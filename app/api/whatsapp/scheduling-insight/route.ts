import { NextResponse } from "next/server";
import twilio from "twilio";
import { buildSchedulingInsightWhatsAppBody } from "@/lib/scheduling-whatsapp-message";
import { toWhatsappAddress } from "@/lib/whatsapp-phone";
import { getWhatsappOutboundMediaUrls } from "@/lib/whatsapp-outbound-media";
import { createClient } from "@/lib/supabase/server";
import { generateCeiInsightsForTank } from "@/services/cei-insights";

type Body = {
  tankId?: number;
};

export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
    }

    const json = (await request.json()) as Body;
    const tankId = Number(json.tankId);

    if (Number.isNaN(tankId) || tankId < 1) {
      return NextResponse.json({ error: "tankId is required." }, { status: 400 });
    }

    const { data: profile } = await (supabase as any)
      .from("profiles")
      .select("tank_id")
      .eq("id", user.id)
      .single();

    if (profile?.tank_id !== tankId) {
      return NextResponse.json(
        { error: "You can only send for your assigned tank." },
        { status: 403 },
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;

    if (!accountSid || !authToken || !fromNumber) {
      return NextResponse.json({ error: "Twilio environment is missing." }, { status: 500 });
    }

    const insight = await generateCeiInsightsForTank(tankId);
    if (!insight) {
      return NextResponse.json({ error: "No scheduling insight for this tank." }, { status: 400 });
    }

    const { data: rows, error } = await (supabase as any)
      .from("tank_contacts")
      .select("phone_number, zone_number")
      .eq("tank_id", tankId)
      .not("zone_number", "is", null);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const recipients = (rows ?? []) as Array<{ phone_number: string; zone_number: number }>;
    if (recipients.length === 0) {
      return NextResponse.json({
        ok: true,
        sentCount: 0,
        skippedCount: 0,
        message: "No contacts with a zone for this tank.",
      });
    }

    const client = twilio(accountSid, authToken);
    const mediaUrl = getWhatsappOutboundMediaUrls();
    const fromDate = new Date();

    let sentCount = 0;
    for (const row of recipients) {
      const zn = Number(row.zone_number);
      if (Number.isNaN(zn) || zn < 1 || zn > 5) continue;

      const bodyText = buildSchedulingInsightWhatsAppBody(insight, zn, fromDate);
      const to = toWhatsappAddress(row.phone_number);
      if (!to) continue;

      await client.messages.create({
        from: fromNumber,
        to,
        body: bodyText,
        ...(mediaUrl.length > 0 ? { mediaUrl } : {}),
      });
      sentCount += 1;
    }

    return NextResponse.json({ ok: true, sentCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Scheduling broadcast failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
