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
import { tankDropdownLabel } from "@/lib/whatsapp-tank-lines";

function inferTankIdFromBody(body: string) {
  const match = body.match(/tank[\s:#-]*(\d+)/i);
  if (!match) return null;
  const value = Number(match[1]);
  return Number.isNaN(value) ? null : value;
}

function isTankerBookingIntent(body: string) {
  const text = body.toLowerCase();
  return (
    text.includes("tanker") ||
    text.includes("booking") ||
    text.includes("book tanker") ||
    text.includes("water tanker")
  );
}

function parseBookingDateTime(body: string): { supplyDate: string; supplyTime: string } | null {
  function isValidCalendarDate(y: number, m: number, d: number) {
    if (m < 1 || m > 12 || d < 1 || d > 31) return false;
    const dt = new Date(y, m - 1, d);
    return dt.getFullYear() === y && dt.getMonth() === m - 1 && dt.getDate() === d;
  }

  const text = body.trim();
  if (!text) return null;

  const ymd = text.match(/(20\d{2})[-\/](\d{1,2})[-\/](\d{1,2})[,\s]+(\d{1,2}):(\d{2})/);
  if (ymd) {
    const y = Number(ymd[1]);
    const m = Number(ymd[2]);
    const d = Number(ymd[3]);
    const hh = Number(ymd[4]);
    const mm = Number(ymd[5]);
    if (
      isValidCalendarDate(y, m, d) &&
      hh >= 0 &&
      hh <= 23 &&
      mm >= 0 &&
      mm <= 59
    ) {
      return {
        supplyDate: `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        supplyTime: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`,
      };
    }
  }

  const dmy = text.match(/(\d{1,2})[-\/](\d{1,2})[-\/](20\d{2})[,\s]+(\d{1,2}):(\d{2})/);
  if (dmy) {
    const d = Number(dmy[1]);
    const m = Number(dmy[2]);
    const y = Number(dmy[3]);
    const hh = Number(dmy[4]);
    const mm = Number(dmy[5]);
    if (
      isValidCalendarDate(y, m, d) &&
      hh >= 0 &&
      hh <= 23 &&
      mm >= 0 &&
      mm <= 59
    ) {
      return {
        supplyDate: `${String(y).padStart(4, "0")}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`,
        supplyTime: `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:00`,
      };
    }
  }

  return null;
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
      const tankerIntent = isTankerBookingIntent(messageBody);

      const client = twilio(accountSid, authToken);
      const outboundBodies: string[] = [];

      let sessionStep = existingSession?.step as string | undefined;
      const sessionLang = existingSession?.language as WhatsAppLang | null | undefined;

      /** Legacy awaiting_area → user must pick tank before complaint text. */
      if (sessionStep === "awaiting_area") {
        await (supabase as any)
          .from("whatsapp_sessions")
          .update({
            step: "awaiting_tank",
            selected_area_id: null,
            updated_at: new Date().toISOString(),
          })
          .eq("phone_number", sourcePhone);
        sessionStep = "awaiting_tank";
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

      /**
       * Tanker booking flow should take precedence over language/tank complaint flow.
       * This prevents date/time replies from being treated as tank-selection messages.
       */
      if (sessionStep === "awaiting_tanker_booking_datetime") {
        const booking = parseBookingDateTime(messageBody);
        if (!booking) {
          outboundBodies.push(
            "Invalid date/time. Please send in format: YYYY-MM-DD HH:MM (example: 2026-04-02 10:30).",
          );
          if (sourceWhatsappAddress && outboundBodies.length) {
            await sendWhatsappMessages(client, fromNumber, sourceWhatsappAddress, outboundBodies);
          }
          return NextResponse.json({ ok: true });
        }

        const tankerTankId =
          typeof existingSession?.tank_id === "number" && Number.isFinite(existingSession.tank_id)
            ? existingSession.tank_id
            : resolvedTankId;

        const { error: tankerInsertError } = await (supabase as any).from("tanker_requests").insert({
          tank_id: tankerTankId,
          requester_name: "WhatsApp User",
          vehicle_number: "WA-BOOKING",
          phone_number: sourcePhone,
          address: "From WhatsApp booking",
          supply_date: booking.supplyDate,
          supply_time: booking.supplyTime,
          payment_status: "cod",
          source: "whatsapp_booking",
        });

        if (tankerInsertError) {
          outboundBodies.push(
            "Could not save tanker booking right now. Please try again in a moment.",
          );
          if (sourceWhatsappAddress && outboundBodies.length) {
            await sendWhatsappMessages(client, fromNumber, sourceWhatsappAddress, outboundBodies);
          }
          return NextResponse.json({ ok: true });
        }

        await (supabase as any).from("whatsapp_sessions").upsert(
          {
            phone_number: sourcePhone,
            tank_id: tankerTankId,
            selected_area_id: null,
            step: "completed",
            language: sessionLang ?? "en",
            last_inbound_message_sid: messageSid,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "phone_number" },
        );

        outboundBodies.push(
          `Your tanker booking is registered for ${booking.supplyDate} ${booking.supplyTime.slice(0, 5)}.`,
        );
        if (sourceWhatsappAddress && outboundBodies.length) {
          await sendWhatsappMessages(client, fromNumber, sourceWhatsappAddress, outboundBodies);
        }
        return NextResponse.json({ ok: true });
      }

      if (tankerIntent) {
        const bookingLang: WhatsAppLang =
          sessionLang && ["hi", "mr", "ur", "en"].includes(sessionLang) ? sessionLang : "en";
        const tankerSessionRes = await (supabase as any).from("whatsapp_sessions").upsert(
          {
            phone_number: sourcePhone,
            tank_id: resolvedTankId,
            selected_area_id: null,
            step: "awaiting_tanker_tank",
            language: bookingLang,
            last_inbound_message_sid: messageSid,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "phone_number" },
        );
        if (tankerSessionRes?.error) {
          outboundBodies.push(
            "Tanker booking flow is not enabled on database yet. Please ask admin to run SQL migration for WhatsApp tanker steps.",
          );
          if (sourceWhatsappAddress && outboundBodies.length) {
            await sendWhatsappMessages(client, fromNumber, sourceWhatsappAddress, outboundBodies);
          }
          return NextResponse.json({ ok: true });
        }
        const tankLines = formatTankListLines(allTanks, bookingLang);
        const tankChunks = appendSuffixToLastChunk(
          chunkTankMessages("Please choose tank for tanker booking:", "More tanks:", tankLines),
          "Reply with tank number from the list.",
        );
        outboundBodies.push(
          ...tankChunks,
        );
        if (sourceWhatsappAddress && outboundBodies.length) {
          await sendWhatsappMessages(client, fromNumber, sourceWhatsappAddress, outboundBodies);
        }
        return NextResponse.json({ ok: true });
      }

      if (sessionStep === "awaiting_tanker_tank") {
        const bookingLang: WhatsAppLang =
          sessionLang && ["hi", "mr", "ur", "en"].includes(sessionLang) ? sessionLang : "en";
        const trimmed = messageBody.trim();
        if (!trimmed || !/^\d+$/.test(trimmed)) {
          outboundBodies.push("Please reply with tank number from the list.");
          if (sourceWhatsappAddress && outboundBodies.length) {
            await sendWhatsappMessages(client, fromNumber, sourceWhatsappAddress, outboundBodies);
          }
          return NextResponse.json({ ok: true });
        }
        const tankIdReply = Number(trimmed);
        const selectedTank = allTanks.find((row) => row.id === tankIdReply);
        if (!selectedTank) {
          outboundBodies.push("Invalid tank number. Please choose a valid tank from list.");
          if (sourceWhatsappAddress && outboundBodies.length) {
            await sendWhatsappMessages(client, fromNumber, sourceWhatsappAddress, outboundBodies);
          }
          return NextResponse.json({ ok: true });
        }

        const stepRes = await (supabase as any).from("whatsapp_sessions").upsert(
          {
            phone_number: sourcePhone,
            tank_id: selectedTank.id,
            selected_area_id: null,
            step: "awaiting_tanker_booking_datetime",
            language: bookingLang,
            last_inbound_message_sid: messageSid,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "phone_number" },
        );
        if (stepRes?.error) {
          outboundBodies.push("Could not continue tanker booking right now. Please try again.");
          if (sourceWhatsappAddress && outboundBodies.length) {
            await sendWhatsappMessages(client, fromNumber, sourceWhatsappAddress, outboundBodies);
          }
          return NextResponse.json({ ok: true });
        }

        const areaLabel = tankDropdownLabel(
          { id: selectedTank.id, name: selectedTank.name, ward: selectedTank.ward },
          bookingLang,
        );
        outboundBodies.push(
          `Tank selected: ${areaLabel}\nPlease share required date and time in format: YYYY-MM-DD HH:MM`,
        );
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
              step: "awaiting_tank",
              language: lang,
              last_inbound_message_sid: messageSid,
              updated_at: new Date().toISOString(),
            },
            { onConflict: "phone_number" },
          );

          const tankLines = formatTankListLines(allTanks, lang);
          const tankChunks = appendSuffixToLastChunk(
            chunkTankMessages(copy.tankListHeader, copy.tankListContinued, tankLines),
            copy.tankPickPrompt,
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

      /** Reply must be a tank ID from the list; then we ask for complaint text. */
      if (sessionStep === "awaiting_tank" && existingSession) {
        const langForTank: WhatsAppLang =
          sessionLang && ["hi", "mr", "ur", "en"].includes(sessionLang)
            ? sessionLang
            : "en";
        const copy = t(langForTank);
        const trimmed = messageBody.trim();
        if (!trimmed || !/^\d+$/.test(trimmed)) {
          outboundBodies.push(copy.tankPickInvalid);
        } else {
          const tankIdReply = Number(trimmed);
          const selectedTank = allTanks.find((row) => row.id === tankIdReply);
          if (!selectedTank) {
            outboundBodies.push(copy.tankPickInvalid);
          } else {
            await (supabase as any).from("whatsapp_sessions").upsert(
              {
                phone_number: sourcePhone,
                tank_id: selectedTank.id,
                selected_area_id: null,
                step: "awaiting_complaint",
                language: langForTank,
                last_inbound_message_sid: messageSid,
                updated_at: new Date().toISOString(),
              },
              { onConflict: "phone_number" },
            );
            const areaLabel = tankDropdownLabel(
              {
                id: selectedTank.id,
                name: selectedTank.name,
                ward: selectedTank.ward,
              },
              langForTank,
            );
            outboundBodies.push(
              `${copy.areaSelectedLine.replace("%s", areaLabel)}\n\n${copy.complaintPrompt}`,
            );
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

        const complaintTankId =
          typeof existingSession.tank_id === "number" && Number.isFinite(existingSession.tank_id)
            ? existingSession.tank_id
            : resolvedTankId;

        if (shouldInsert) {
          await (supabase as any).from("complaints").insert({
            name: "WhatsApp User",
            phone_number: sourcePhone,
            source_phone: sourcePhone,
            tank_id: complaintTankId,
            issue: messageBody || "WhatsApp complaint received.",
            report_channel: "whatsapp",
            whatsapp_message_sid: messageSid,
            report_type: "complaint",
          });
        }

        await (supabase as any).from("tank_contacts").upsert(
          {
            tank_id: complaintTankId,
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
        /** New complaint cycle: pick tank again, then complaint text. */
        await (supabase as any).from("whatsapp_sessions").upsert(
          {
            phone_number: sourcePhone,
            tank_id: resolvedTankId,
            selected_area_id: null,
            step: "awaiting_tank",
            language: lang,
            last_inbound_message_sid: messageSid,
            updated_at: new Date().toISOString(),
          },
          { onConflict: "phone_number" },
        );
        const tankLines = formatTankListLines(allTanks, lang);
        const tankChunks = appendSuffixToLastChunk(
          chunkTankMessages(copy.tankListHeader, copy.tankListContinued, tankLines),
          copy.tankPickPrompt,
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
