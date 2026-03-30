import { NextResponse } from "next/server";
import twilio from "twilio";
import { createClient } from "@/lib/supabase/server";
import {
  appendSuffixToLastChunk,
  chunkTankMessages,
  formatTankListLines,
  isGreetingOrStart,
  parseLanguageReply,
  t,
  type WhatsAppLang,
} from "@/lib/whatsapp-i18n";
import { getWhatsappOutboundMediaUrls } from "@/lib/whatsapp-outbound-media";
import { normalizePhone, toWhatsappAddress } from "@/lib/whatsapp-phone";

function inferTankIdFromBody(body: string) {
  const match = body.match(/tank[\s:#-]*(\d+)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isNaN(value) ? null : value;
}

async function sendWhatsappMessages(
  client: ReturnType<typeof twilio>,
  from: string,
  to: string,
  bodies: string[],
) {
  const mediaUrl = getWhatsappOutboundMediaUrls();
  for (const body of bodies) {
    if (!body.trim()) continue;
    await client.messages.create({
      from,
      to,
      body,
      ...(mediaUrl.length > 0 ? { mediaUrl } : {}),
    });
  }
}

export async function POST(request: Request) {
  try {
    const accountSid = process.env.TWILIO_ACCOUNT_SID;
    const authToken = process.env.TWILIO_AUTH_TOKEN;
    const fromNumber = process.env.TWILIO_WHATSAPP_FROM;
    const appBaseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL;

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
    const twilioWebhookUrl = process.env.TWILIO_WEBHOOK_URL;
    const validationUrl = twilioWebhookUrl ?? urlFromForwarded ?? request.url;

    if (twilioSignature) {
      const isValid = twilio.validateRequest(
        authToken,
        twilioSignature,
        validationUrl,
        Object.fromEntries(form.entries()),
      );
      if (!isValid) {
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

    const { data: allTanksRaw } = await (supabase as any)
      .from("water_tanks")
      .select("id,name,ward")
      .order("id", { ascending: true });

    const allTanks = (allTanksRaw ?? []) as Array<{
      id: number;
      name: string;
      ward: string | null;
    }>;

    if (resolvedTankId && sourcePhone) {
      const { data: existingSession } = await (supabase as any)
        .from("whatsapp_sessions")
        .select("phone_number,tank_id,selected_area_id,step,language")
        .eq("phone_number", sourcePhone)
        .maybeSingle();

      const langChoice = parseLanguageReply(messageBody);
      const greeting = isGreetingOrStart(messageBody);

      const client = twilio(accountSid, authToken);
      const outboundBodies: string[] = [];

      let sessionStep = existingSession?.step as string | undefined;
      const sessionLang = existingSession?.language as WhatsAppLang | null | undefined;

      /** Zone sub-step removed; move old sessions to complaint entry. */
      if (sessionStep === "awaiting_area") {
        await (supabase as any)
          .from("whatsapp_sessions")
          .update({
            step: "awaiting_complaint",
            selected_area_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("phone_number", sourcePhone);
        sessionStep = "awaiting_complaint";
      }

      /** Reset to language selection (e.g. user sent "hi"). */
      if (greeting) {
        await (supabase as any).from("whatsapp_sessions").upsert(
          {
            phone_number: sourcePhone,
            tank_id: resolvedTankId,
            selected_area_id: null,
            step: "awaiting_language",
            language: null,
            last_inbound_message_sid: messageSid,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "phone_number" },
        );
        const menu =
          `${t("en").languageMenuTitle}\n\n${t("en").languageMenuHint}`;
        outboundBodies.push(menu);
        if (sourceWhatsappAddress && outboundBodies.length) {
          await sendWhatsappMessages(client, fromNumber, sourceWhatsappAddress, outboundBodies);
        }
        return NextResponse.json({ ok: true });
      }

      /** Language step only for new sessions or explicit awaiting_language (not legacy awaiting_area rows). */
      const needsLanguage =
        !existingSession || sessionStep === "awaiting_language";

      if (needsLanguage && !greeting) {
        if (langChoice) {
          const lang: WhatsAppLang = langChoice;
          const copy = t(lang);
          await (supabase as any).from("whatsapp_sessions").upsert(
            {
              phone_number: sourcePhone,
              tank_id: resolvedTankId,
              selected_area_id: null,
              step: "awaiting_complaint",
              language: lang,
              last_inbound_message_sid: messageSid,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "phone_number" },
          );

          const tankLines = formatTankListLines(allTanks, lang);
          const tankChunks = appendSuffixToLastChunk(
            chunkTankMessages(copy.tankListHeader, copy.tankListContinued, tankLines),
            copy.complaintAfterTanks,
          );
          outboundBodies.push(...tankChunks);
        } else {
          await (supabase as any).from("whatsapp_sessions").upsert(
            {
              phone_number: sourcePhone,
              tank_id: resolvedTankId,
              selected_area_id: existingSession?.selected_area_id ?? null,
              step: "awaiting_language",
              language: null,
              last_inbound_message_sid: messageSid,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "phone_number" },
          );
          outboundBodies.push(
            `${t("en").languageMenuTitle}\n\n${t("en").languageMenuHint}`,
          );
          if (messageBody.length > 0 && !langChoice) {
            outboundBodies.push(t("en").languageInvalid);
          }
        }

        if (sourceWhatsappAddress && outboundBodies.length) {
          await sendWhatsappMessages(client, fromNumber, sourceWhatsappAddress, outboundBodies);
        }
        return NextResponse.json({ ok: true });
      }

      const lang: WhatsAppLang =
        sessionLang && ["hi", "mr", "ur", "en"].includes(sessionLang)
          ? sessionLang
          : "en";
      const copy = t(lang);

      if (sessionStep === "awaiting_complaint" && existingSession) {
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
          await (supabase as any).from("complaints").insert({
            name: "WhatsApp User",
            phone_number: sourcePhone,
            source_phone: sourcePhone,
            tank_id: resolvedTankId,
            issue: messageBody || "WhatsApp complaint received.",
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

        outboundBodies.push(
          `${copy.thankYou}\n${formUrl.toString()}`,
        );
      } else if (sessionStep === "completed") {
        /** New complaint cycle: full tank list + complaint prompt (merged when possible). */
        await (supabase as any).from("whatsapp_sessions").upsert(
          {
            phone_number: sourcePhone,
            tank_id: resolvedTankId,
            selected_area_id: null,
            step: "awaiting_complaint",
            language: lang,
            last_inbound_message_sid: messageSid,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "phone_number" },
        );
        const tankLines = formatTankListLines(allTanks, lang);
        const tankChunks = appendSuffixToLastChunk(
          chunkTankMessages(copy.tankListHeader, copy.tankListContinued, tankLines),
          copy.complaintAfterTanks,
        );
        outboundBodies.push(...tankChunks);
      }

      if (sourceWhatsappAddress && outboundBodies.length) {
        await sendWhatsappMessages(client, fromNumber, sourceWhatsappAddress, outboundBodies);
      }
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Webhook failed.";
    console.error("[whatsapp:webhook] error", { message });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
