import { createClient } from "@/lib/supabase/server";

export type HomeScheduledTankRow = {
  owner_user_id: string;
  tank_id: number;
  tank_name: string;
  tank_type: "ESR" | "GSR" | "Sump";
  ward: string;
  area_address: string;
  schedule_id: number;
  schedule_date: string;
  open_at: string;
  duration_minutes: number;
  timezone: string;
  scheduled_start_local: string;
  ai_payload: unknown;
  notes: string | null;
  created_at: string;
};

export async function getHomeScheduledTanksForUser(userId?: string | null) {
  if (!userId) return [] as HomeScheduledTankRow[];

  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("valve_opening_schedules")
    .select(
      "id,tank_id,schedule_date,open_at,duration_minutes,timezone,ai_payload,notes,created_at,status,created_source,water_tanks(name,type,ward,area_address)",
    )
    .eq("owner_user_id", userId)
    .in("status", ["scheduled", "opened"])
    .in("created_source", ["backend_ai", "backend_manual"])
    .order("schedule_date", { ascending: true })
    .order("open_at", { ascending: true })
    .limit(10);

  if (error) {
    throw new Error(`Failed to load scheduled tanks: ${error.message}`);
  }

  return ((data ?? []) as Array<any>).map((row) => ({
    owner_user_id: userId,
    tank_id: Number(row.tank_id),
    tank_name: String(row.water_tanks?.name ?? `Tank #${row.tank_id}`),
    tank_type: (row.water_tanks?.type ?? "ESR") as "ESR" | "GSR" | "Sump",
    ward: String(row.water_tanks?.ward ?? ""),
    area_address: String(row.water_tanks?.area_address ?? ""),
    schedule_id: Number(row.id),
    schedule_date: String(row.schedule_date),
    open_at: String(row.open_at),
    duration_minutes: Number(row.duration_minutes ?? 0),
    timezone: String(row.timezone ?? "Asia/Kolkata"),
    scheduled_start_local: `${String(row.schedule_date)}T${String(row.open_at)}`,
    ai_payload: row.ai_payload ?? null,
    notes: row.notes ?? null,
    created_at: String(row.created_at ?? new Date().toISOString()),
  }));
}
