import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@/lib/supabase/server";
import { toWhatsappAddress } from "@/lib/whatsapp-phone";

type Body = {
  complaintId?: string;
};

function formatClosedAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
    timeZone: "Asia/Kolkata",
  }).format(d);
}

export async function POST(request: Request) {
  try {
    const json = (await request.json()) as Body;
    const complaintId = String(json.complaintId ?? "").trim();
    console.info("[whatsapp:complaint-closed] request received", { complaintId });
    if (!complaintId) {
      console.warn("[whatsapp:complaint-closed] missing complaintId");
      return NextResponse.json({ error: "complaintId is required." }, { status: 400 });
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    if (!accountSid || !authToken || !fromNumber) {
      console.warn("[whatsapp:complaint-closed] missing Twilio env");
      return NextResponse.json({ error: "Twilio environment is missing." }, { status: 500 });
    }

    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      console.warn("[whatsapp:complaint-closed] unauthorized: no user session");
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }
    console.info("[whatsapp:complaint-closed] user session found", { userId: user.id });

    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("tank_id")
      .eq("id", user.id)
      .single();
    const tankId = Number(profile?.tank_id);
    if (!Number.isFinite(tankId) || tankId <= 0) {
      console.warn("[whatsapp:complaint-closed] user has no assigned tank", {
        userId: user.id,
        rawTankId: profile?.tank_id ?? null,
      });
      return NextResponse.json({ error: "No assigned tank for this user." }, { status: 403 });
    }
    console.info("[whatsapp:complaint-closed] assigned tank resolved", { userId: user.id, tankId });

    let complaint: any = null;
    let complaintError: any = null;
    ({
      data: complaint,
      error: complaintError,
    } = await (supabase as any)
      .from("complaints")
      .select("id,phone_number,status,created_at,tank_id")
      .eq("id", complaintId)
      .eq("tank_id", tankId)
      .maybeSingle());

    if (complaintError) {
      const msg = [complaintError.message, complaintError.details, complaintError.hint]
        .filter(Boolean)
        .join(" ");
      console.warn("[whatsapp:complaint-closed] primary complaint query error", {
        complaintId,
        tankId,
        error: msg,
      });
      const missingOptionalColumns =
        /could not find|schema cache|column|unknown|does not exist|PGRST204/i.test(msg) &&
        /(closed_at|updated_at)/i.test(msg);
      if (missingOptionalColumns) {
        console.info("[whatsapp:complaint-closed] retrying complaint query with minimal columns");
        ({
          data: complaint,
          error: complaintError,
        } = await (supabase as any)
          .from("complaints")
          .select("id,phone_number,status,created_at,tank_id")
          .eq("id", complaintId)
          .eq("tank_id", tankId)
          .maybeSingle());
        if (complaintError) {
          const retryMsg = [complaintError.message, complaintError.details, complaintError.hint]
            .filter(Boolean)
            .join(" ");
          console.warn("[whatsapp:complaint-closed] fallback complaint query failed", {
            complaintId,
            tankId,
            error: retryMsg,
          });
        }
      }
    }

    if (complaintError || !complaint) {
      console.warn("[whatsapp:complaint-closed] complaint not found for assigned tank", {
        complaintId,
        tankId,
        hasComplaint: Boolean(complaint),
        hasError: Boolean(complaintError),
      });
      return NextResponse.json(
        { error: `Complaint ${complaintId} not found for your assigned tank.` },
        { status: 404 },
      );
    }
    console.info("[whatsapp:complaint-closed] complaint row found", {
      complaintId: complaint.id,
      complaintTankId: complaint.tank_id,
      status: complaint.status,
      hasPhone: Boolean(complaint.phone_number),
    });

    const status = String(complaint.status ?? "");
    if (status !== "resolved") {
      console.warn("[whatsapp:complaint-closed] complaint is not resolved", {
        complaintId: complaint.id,
        status,
      });
      return NextResponse.json(
        { error: "Only closed complaints can send closure message." },
        { status: 400 },
      );
    }

    const phone = String(complaint.phone_number ?? "").trim();
    const to = toWhatsappAddress(phone);
    if (!to) {
      console.warn("[whatsapp:complaint-closed] missing/invalid phone number", {
        complaintId: complaint.id,
        rawPhone: complaint.phone_number ?? null,
      });
      return NextResponse.json({ error: "Complainant phone number is missing." }, { status: 400 });
    }

    const closeIso =
      (complaint.closed_at as string | null | undefined) ||
      (complaint.updated_at as string | null | undefined) ||
      (complaint.created_at as string | null | undefined) ||
      new Date().toISOString();

    const closedAtLabel = formatClosedAt(closeIso);
    const body =
      `Your request is closed.\n` +
      `Complaint ID: ${complaint.id}\n` +
      `Closed at: ${closedAtLabel} IST`;

    const client = twilio(accountSid, authToken);
    await client.messages.create({
      from: fromNumber,
      to,
      body,
    });
    console.info("[whatsapp:complaint-closed] closure WhatsApp sent", {
      complaintId: complaint.id,
      to,
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Failed to send closure message.";
    console.error("[whatsapp:complaint-closed] unhandled error", { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
