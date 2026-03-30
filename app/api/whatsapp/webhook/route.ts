import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@/lib/supabase/server";

function normalizePhone(phone: string) {
  return phone.replace(/[^\d+]/g, "").trim();
}

function toWhatsappAddress(phone: string) {
  const normalized = normalizePhone(phone);
  if (!normalized) return "";
  return normalized.startsWith("whatsapp:") ? normalized : `whatsapp:${normalized}`;
}

function inferTankIdFromBody(body: string) {
  const match = body.match(/tank[\s:#-]*(\d+)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isNaN(value) ? null : value;
}

function parseSelectedAreaIndex(body: string) {
  const trimmed = body.trim();
  if (!/^\d+$/.test(trimmed)) return null;
  const num = Number(trimmed);
  if (Number.isNaN(num) || num < 1 || num > 6) return null;
  return num;
}

export async function POST(request: Request) {
  try {
    console.log("[whatsapp:webhook] inbound request", {
      method: request.method,
      url: request.url,
    });

    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;
    const twilioWebhookUrl = process.env.TWILIO_WEBHOOK_URL;

    console.log("[whatsapp:webhook] env presence", {
      hasAccountSid: Boolean(accountSid),
      hasAuthToken: Boolean(authToken),
      hasFromNumber: Boolean(fromNumber),
      hasAppBaseUrl: Boolean(appBaseUrl),
    });

    if (!accountSid || !authToken || !fromNumber || !appBaseUrl) {
      return NextResponse.json({ error: "Twilio environment is missing." }, { status: 500 });
    }

    const rawBody = await request.text();
    const form = new URLSearchParams(rawBody);
    const headers = request.headers;
    const twilioSignature = headers.get("x-twilio-signature");
    const forwardedProto = headers.get("x-forwarded-proto");
    const forwardedHost = headers.get("x-forwarded-host");
    const pathname = new URL(request.url).pathname;
    const urlFromForwarded =
      forwardedProto && forwardedHost
        ? `${forwardedProto}://${forwardedHost}${pathname}`
        : null;
    const validationUrl = twilioWebhookUrl ?? urlFromForwarded ?? request.url;

    console.log("[whatsapp:webhook] payload received", {
      hasSignature: Boolean(twilioSignature),
      from: form.get("From"),
      messageSid: form.get("MessageSid"),
      bodyPreview: (form.get("Body") ?? "").slice(0, 80),
    });

    // Validate signature when provided by Twilio.
    if (twilioSignature) {
      const isValid = twilio.validateRequest(
        authToken,
        twilioSignature,
        validationUrl,
        Object.fromEntries(form.entries()),
      );

      console.log("[whatsapp:webhook] signature validation", {
        requestUrl: request.url,
        validationUrl,
        twilioWebhookUrl,
        forwardedProto,
        forwardedHost,
        isValid,
      });

      if (!isValid) {
        console.warn("[whatsapp:webhook] invalid signature", {
          requestUrl: request.url,
          validationUrl,
        });
        return NextResponse.json({ error: "Invalid Twilio signature." }, { status: 403 });
      }
    }

    const inboundFromRaw = form.get("From") ?? "";
    const sourcePhone = normalizePhone(inboundFromRaw);
    const sourceWhatsappAddress = toWhatsappAddress(inboundFromRaw);
    const messageBody = (form.get("Body") ?? "").trim();
    const messageSid = form.get("MessageSid") ?? null;

    const supabase = await createClient();
    const inferredTankId = inferTankIdFromBody(messageBody);

    let resolvedTankId = inferredTankId;
    if (!resolvedTankId) {
      const { data: profileByPhone } = await (supabase as any)
        .from("profiles")
        .select("tank_id")
        .eq("phone_number", sourcePhone)
        .single();
      if (profileByPhone?.tank_id) {
        resolvedTankId = profileByPhone.tank_id;
      }
    }

    if (!resolvedTankId) {
      const { data: firstTank } = await (supabase as any)
        .from("water_tanks")
        .select("id")
        .order("id", { ascending: true })
        .limit(1)
        .single();
      resolvedTankId = firstTank?.id ?? null;
    }

    if (resolvedTankId && sourcePhone) {
      const { data: existingSession } = await (supabase as any)
        .from("whatsapp_sessions")
        .select("phone_number,tank_id,selected_area_id,step")
        .eq("phone_number", sourcePhone)
        .single();

      const { data: tankAreas } = await (supabase as any)
        .from("tank_areas")
        .select("id,area_name,priority_rank")
        .eq("tank_id", resolvedTankId)
        .order("priority_rank", { ascending: true })
        .limit(6);

      const areas = (tankAreas ?? []) as Array<{ id: number; area_name: string; priority_rank: number }>;
      const selectedIndex = parseSelectedAreaIndex(messageBody);
      let outboundReply = "";

      if (!existingSession || existingSession.step === "completed") {
        await (supabase as any).from("whatsapp_sessions").upsert(
          {
            phone_number: sourcePhone,
            tank_id: resolvedTankId,
            selected_area_id: null,
            step: "awaiting_area",
            last_inbound_message_sid: messageSid,
          },
          { onConflict: "phone_number" },
        );

        if (areas.length > 0) {
          const areaMenu = areas
            .map((area, idx) => `${idx + 1}. ${area.area_name}`)
            .join("\n");
          outboundReply =
            `Please select your area by replying with a number:\n${areaMenu}\n\n` +
            "Example: Reply with 2";
        } else {
          outboundReply =
            "Please type your complaint details. (Area list is currently unavailable.)";
          await (supabase as any)
            .from("whatsapp_sessions")
            .update({
              step: "awaiting_complaint",
              last_inbound_message_sid: messageSid,
              updated_at: new Date().toISOString(),
            })
            .eq("phone_number", sourcePhone);
        }
      } else if (existingSession.step === "awaiting_area") {
        if (!selectedIndex || !areas[selectedIndex - 1]) {
          const areaMenu = areas
            .map((area, idx) => `${idx + 1}. ${area.area_name}`)
            .join("\n");
          outboundReply =
            `Invalid selection. Please reply with a number from the list:\n${areaMenu}`;
        } else {
          const selectedArea = areas[selectedIndex - 1];
          await (supabase as any)
            .from("whatsapp_sessions")
            .update({
              selected_area_id: selectedArea.id,
              step: "awaiting_complaint",
              last_inbound_message_sid: messageSid,
              updated_at: new Date().toISOString(),
            })
            .eq("phone_number", sourcePhone);

          outboundReply =
            `Area selected: ${selectedArea.area_name}\n` +
            "Now please type your complaint details.";
        }
      } else {
        const { data: selectedArea } = existingSession.selected_area_id
          ? await (supabase as any)
              .from("tank_areas")
              .select("id,area_name")
              .eq("id", existingSession.selected_area_id)
              .single()
          : { data: null };

        let shouldInsert = true;
        if (messageSid) {
          const { data: existing } = await (supabase as any)
            .from("complaints")
            .select("id")
            .eq("whatsapp_message_sid", messageSid)
            .limit(1);
          shouldInsert = !existing?.length;
        }

        if (shouldInsert) {
          const areaPrefix = selectedArea?.area_name
            ? `[Area: ${selectedArea.area_name}] `
            : "";
          await (supabase as any).from("complaints").insert({
            name: "WhatsApp User",
            phone_number: sourcePhone,
            source_phone: sourcePhone,
            tank_id: resolvedTankId,
            issue: `${areaPrefix}${messageBody || "WhatsApp complaint received."}`,
            report_channel: "whatsapp",
            whatsapp_message_sid: messageSid,
            report_type: "complaint",
          });
        }

        await (supabase as any).from("tank_contacts").upsert(
          {
            tank_id: resolvedTankId,
            name: "WhatsApp User",
            phone_number: sourcePhone,
            source: "complaint",
          },
          { onConflict: "tank_id,phone_number" },
        );

        await (supabase as any)
          .from("whatsapp_sessions")
          .update({
            step: "completed",
            last_inbound_message_sid: messageSid,
            updated_at: new Date().toISOString(),
          })
          .eq("phone_number", sourcePhone);

        const formUrl = new URL("/complaints", appBaseUrl);
        formUrl.searchParams.set("phone", sourcePhone);
        formUrl.searchParams.set("tank", String(resolvedTankId));
        formUrl.searchParams.set("channel", "whatsapp");

        outboundReply =
          "Thank you. Your complaint has been recorded.\n" +
          `If you want to add more details/image, fill this form: ${formUrl.toString()}`;
      }

      const client = twilio(accountSid, authToken);
      if (sourceWhatsappAddress && outboundReply) {
        console.log("[whatsapp:webhook] sending auto-reply", {
          to: sourceWhatsappAddress,
          messagePreview: outboundReply.slice(0, 120),
        });
        await client.messages.create({
          from: fromNumber,
          to: sourceWhatsappAddress,
          body: outboundReply,
        });
      }
    }

    console.log("[whatsapp:webhook] completed successfully");
    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed.";
    console.error("[whatsapp:webhook] error", { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
