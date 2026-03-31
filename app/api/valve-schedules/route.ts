import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

function toIstDateAndTime(iso: string) {
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return null;
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "Asia/Kolkata",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).formatToParts(date);
  const byType = Object.fromEntries(parts.map((p) => [p.type, p.value]));
  const scheduleDate = `${byType.year}-${byType.month}-${byType.day}`;
  const openAt = `${byType.hour}:${byType.minute}:${byType.second}`;
  return { scheduleDate, openAt };
}

export async function GET(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { searchParams } = new URL(request.url);
  const tankId = Number(searchParams.get("tankId"));
  if (!Number.isFinite(tankId) || tankId <= 0) {
    return NextResponse.json({ error: "tankId is required" }, { status: 400 });
  }

  const { data, error } = await (supabase as any)
    .from("valve_opening_schedules")
    .select("zone_number,status,schedule_date,open_at")
    .eq("owner_user_id", user.id)
    .eq("tank_id", tankId)
    .in("status", ["scheduled", "opened"])
    .order("schedule_date", { ascending: true })
    .order("open_at", { ascending: true });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ rows: data ?? [] });
}

export async function POST(request: Request) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as {
    action?: "confirm" | "cancel";
    tankId?: number;
    zoneNumber?: number;
    startIso?: string;
    durationMinutes?: number;
    notes?: string | null;
  };

  const action = body.action;
  const tankId = Number(body.tankId);
  const zoneNumber = Number(body.zoneNumber);
  const durationMinutes = Number(body.durationMinutes);
  const startIso = body.startIso;

  if (!action || !["confirm", "cancel"].includes(action)) {
    return NextResponse.json({ error: "action must be confirm|cancel" }, { status: 400 });
  }
  if (!Number.isFinite(tankId) || tankId <= 0) {
    return NextResponse.json({ error: "tankId is required" }, { status: 400 });
  }
  if (!Number.isFinite(zoneNumber) || zoneNumber < 1 || zoneNumber > 5) {
    return NextResponse.json({ error: "zoneNumber must be 1..5" }, { status: 400 });
  }
  if (!startIso) {
    return NextResponse.json({ error: "startIso is required" }, { status: 400 });
  }

  const local = toIstDateAndTime(startIso);
  if (!local) {
    return NextResponse.json({ error: "Invalid startIso" }, { status: 400 });
  }

  if (action === "cancel") {
    const { error } = await (supabase as any)
      .from("valve_opening_schedules")
      .update({ status: "cancelled" })
      .eq("owner_user_id", user.id)
      .eq("tank_id", tankId)
      .eq("zone_number", zoneNumber)
      .eq("schedule_date", local.scheduleDate)
      .eq("open_at", local.openAt)
      .in("status", ["scheduled", "opened"]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
    return NextResponse.json({ ok: true });
  }

  if (!Number.isFinite(durationMinutes) || durationMinutes < 1 || durationMinutes > 360) {
    return NextResponse.json({ error: "durationMinutes must be 1..360" }, { status: 400 });
  }

  const { data: existing, error: findError } = await (supabase as any)
    .from("valve_opening_schedules")
    .select("id")
    .eq("owner_user_id", user.id)
    .eq("tank_id", tankId)
    .eq("zone_number", zoneNumber)
    .eq("schedule_date", local.scheduleDate)
    .eq("open_at", local.openAt)
    .in("status", ["scheduled", "opened"])
    .limit(1)
    .maybeSingle();

  if (findError) {
    return NextResponse.json({ error: findError.message }, { status: 500 });
  }

  if (existing?.id) {
    const { error } = await (supabase as any)
      .from("valve_opening_schedules")
      .update({
        duration_minutes: durationMinutes,
        status: "scheduled",
        created_source: "backend_manual",
        notes: body.notes ?? null,
      })
      .eq("id", existing.id);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  } else {
    const { error } = await (supabase as any).from("valve_opening_schedules").insert({
      owner_user_id: user.id,
      tank_id: tankId,
      zone_number: zoneNumber,
      created_source: "backend_manual",
      schedule_date: local.scheduleDate,
      open_at: local.openAt,
      duration_minutes: durationMinutes,
      timezone: "Asia/Kolkata",
      status: "scheduled",
      notes: body.notes ?? null,
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
