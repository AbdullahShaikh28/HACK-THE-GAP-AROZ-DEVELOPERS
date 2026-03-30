import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@/lib/supabase/server";

type CampaignPayload = {
  tankId?: number;
  message?: string;
};

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as CampaignPayload;
    const tankId = Number(body.tankId);
    const message = body.message?.trim();

    if (Number.isNaN(tankId) || !message) {
      return NextResponse.json(
        { error: "tankId and message are required." },
        { status: 400 },
      );
    }

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;

    if (!accountSid || !authToken || !fromNumber || !appBaseUrl) {
      return NextResponse.json({ error: "Twilio environment is missing." }, { status: 500 });
    }

    const supabase = await createClient();
    const { data: contacts, error } = await (supabase as any)
      .from("v_tank_contacts")
      .select("phone_number")
      .eq("tank_id", tankId);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const uniquePhones = Array.from(
      new Set(((contacts ?? []) as Array<{ phone_number: string }>).map((c) => c.phone_number)),
    );

    const client = twilio(accountSid, authToken);
    const link = `${appBaseUrl.replace(/\/$/, "")}/complaints?tank=${tankId}&channel=whatsapp`;
    const fullMessage = `${message}\n\nPlease submit your report here: ${link}`;

    let sentCount = 0;
    for (const phone of uniquePhones) {
      await client.messages.create({
        from: fromNumber,
        to: phone,
        body: fullMessage,
      });
      sentCount += 1;
    }

    return NextResponse.json({ ok: true, sentCount });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Campaign failed.";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
