"use server";

import { createClient } from "@/lib/supabase/server";
import { computeLocationCheck, getPhotoMaxDistanceM } from "@/lib/geo";
import { extractGpsFromImageBuffer } from "@/lib/extract-exif-gps";
import { revalidatePath } from "next/cache";
import { analyzeIssueFromImageBase64 } from "@/services/ollama-vision";
import { nominatimReverseDisplayName } from "@/lib/nominatim-reverse";

const COMPLAINTS_BUCKET = process.env.NEXT_PUBLIC_COMPLAINTS_BUCKET ?? "imaged";

function parseOptionalNumber(raw: string): number | null {
  const t = raw.trim();
  if (t === "") return null;
  const n = Number(t);
  return Number.isFinite(n) ? n : null;
}

export async function submitFieldSurvey(formData: FormData): Promise<
  | { ok: true }
  | { ok: false; error: string }
> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, error: "You must be signed in." };
  }

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("tank_id")
    .eq("id", user.id)
    .single();

  const tankId = profile?.tank_id as number | null | undefined;
  if (!tankId) {
    return { ok: false, error: "Assign a tank in Assigned Tank before submitting a survey." };
  }

  const imageEntry = formData.get("survey_image");
  const hasImage = imageEntry instanceof File && imageEntry.size > 0;

  const respondent_name = String(formData.get("name") ?? "").trim();
  const phone_number = String(formData.get("phone_number") ?? "").trim();
  const surveyDateRaw = String(formData.get("survey_date") ?? "").trim();
  const arrivalRaw = String(formData.get("arrival_time") ?? "").trim();
  const durationRaw = String(formData.get("duration_minutes") ?? "").trim();
  const pressure = String(formData.get("pressure_level") ?? "").trim();
  const zoneRaw = String(formData.get("zone_number") ?? "").trim();

  let photoLat = parseOptionalNumber(String(formData.get("photo_latitude") ?? ""));
  let photoLon = parseOptionalNumber(String(formData.get("photo_longitude") ?? ""));
  const photoAcc = parseOptionalNumber(String(formData.get("photo_location_accuracy_m") ?? ""));

  let imageBuf: Buffer | null = null;
  if (hasImage) {
    imageBuf = Buffer.from(await (imageEntry as File).arrayBuffer());
    if (photoLat == null || photoLon == null) {
      const exifGps = await extractGpsFromImageBuffer(imageBuf);
      if (exifGps) {
        photoLat = exifGps.latitude;
        photoLon = exifGps.longitude;
      }
    }
  }

  if (!respondent_name) return { ok: false, error: "Name is required." };
  if (!phone_number) return { ok: false, error: "Contact number is required." };

  const pressure_level =
    pressure === "low" || pressure === "medium" || pressure === "high" ? pressure : null;
  if (!pressure_level) {
    return { ok: false, error: "Select a pressure level." };
  }

  if (!surveyDateRaw) {
    return { ok: false, error: "Survey date is required." };
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(surveyDateRaw)) {
    return { ok: false, error: "Survey date must be a valid date." };
  }
  const survey_date = surveyDateRaw;

  if (!arrivalRaw) {
    return { ok: false, error: "Arrival time is required." };
  }
  const arrival_time = arrivalRaw;

  if (!durationRaw) {
    return { ok: false, error: "Duration is required." };
  }
  const durationN = Number(durationRaw);
  if (Number.isNaN(durationN) || durationN < 0) {
    return { ok: false, error: "Duration must be a non-negative number." };
  }
  const duration_minutes = Math.round(durationN);

  if (!zoneRaw) {
    return { ok: false, error: "Zone is required." };
  }
  const z = Number(zoneRaw);
  if (!Number.isInteger(z) || z < 1 || z > 5) {
    return { ok: false, error: "Zone must be between 1 and 5." };
  }
  const zone_number = z;

  const { data: tankRow } = await (supabase as any)
    .from("water_tanks")
    .select("latitude,longitude")
    .eq("id", tankId)
    .single();

  const tankLat = Number(tankRow?.latitude);
  const tankLon = Number(tankRow?.longitude);
  const maxM = getPhotoMaxDistanceM();

  const loc =
    Number.isFinite(tankLat) && Number.isFinite(tankLon)
      ? computeLocationCheck(photoLat, photoLon, tankLat, tankLon, maxM)
      : { distanceM: null as number | null, status: "unavailable" as const };

  let capture_address: string | null = null;
  if (
    photoLat != null &&
    photoLon != null &&
    Number.isFinite(photoLat) &&
    Number.isFinite(photoLon)
  ) {
    capture_address = await nominatimReverseDisplayName(photoLat, photoLon);
  }

  let vision: { label: string | null; raw: unknown | null; analyzedAt: string | null } = {
    label: null,
    raw: null,
    analyzedAt: null,
  };
  if (hasImage && imageBuf) {
    try {
      const analyzedAt = new Date().toISOString();
      const result = await analyzeIssueFromImageBase64(imageBuf.toString("base64"));
      if (!result.error) {
        vision = {
          label: result.label,
          raw: result.raw ?? null,
          analyzedAt:
            process.env.OLLAMA_VISION_MODEL?.trim() && (result.label != null || result.raw != null)
              ? analyzedAt
              : null,
        };
      }
    } catch {
      vision = { label: null, raw: null, analyzedAt: null };
    }
  }

  let imageUrl: string | null = null;
  if (hasImage && imageBuf) {
    const imageFile = imageEntry as File;
    const extension = imageFile.name.split(".").pop() ?? "jpg";
    const filePath = `field-surveys/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
    const { error: uploadError } = await (supabase as any).storage
      .from(COMPLAINTS_BUCKET)
      .upload(filePath, imageBuf, {
        cacheControl: "3600",
        upsert: false,
      });

    if (uploadError) {
      if (uploadError.message?.toLowerCase().includes("bucket not found")) {
        return {
          ok: false,
          error: `Bucket "${COMPLAINTS_BUCKET}" not found. Create it in Supabase Storage or set NEXT_PUBLIC_COMPLAINTS_BUCKET.`,
        };
      }
      return { ok: false, error: uploadError.message };
    }

    const { data: publicData } = (supabase as any).storage
      .from(COMPLAINTS_BUCKET)
      .getPublicUrl(filePath);
    imageUrl = publicData?.publicUrl ?? null;
    if (!imageUrl) {
      return { ok: false, error: "Could not get image URL after upload." };
    }
  }

  const basePayload: Record<string, unknown> = {
    tank_id: tankId,
    submitted_by: user.id,
    respondent_name,
    phone_number,
    survey_date,
    arrival_time,
    duration_minutes,
    pressure_level,
  };

  const withSubKind: Record<string, unknown> = {
    ...basePayload,
    zone_number,
    submission_kind: "field_survey",
    report_channel: "web",
    image_url: imageUrl,
  };

  const withGeo: Record<string, unknown> = {
    ...withSubKind,
    photo_latitude: photoLat,
    photo_longitude: photoLon,
    photo_location_accuracy_m: photoAcc,
    distance_to_tank_m: loc.distanceM,
    location_check_status: loc.status,
  };

  const withAi: Record<string, unknown> = {
    ...withGeo,
    ai_issue_label: vision.label,
    ai_issue_raw: vision.raw,
    ai_analyzed_at: vision.analyzedAt,
  };

  const fullPayload: Record<string, unknown> = {
    ...withAi,
    ...(capture_address ? { capture_address } : {}),
  };

  const attempts = [fullPayload, withAi, withGeo, withSubKind, basePayload];

  let lastMessage = "";
  for (const payload of attempts) {
    const { error: insertError } = await (supabase as any).from("field_surveys").insert(payload);
    if (!insertError) {
      lastMessage = "";
      break;
    }
    const msg = [insertError.message, insertError.details, insertError.hint]
      .filter(Boolean)
      .join(" ");
    lastMessage = msg || insertError.message || "Insert failed";
    const missingColumn =
      /could not find|schema cache|column|unknown|does not exist|PGRST204/i.test(
        lastMessage,
      );
    if (!missingColumn) {
      return { ok: false, error: lastMessage };
    }
  }

  if (lastMessage) {
    return { ok: false, error: lastMessage };
  }

  await (supabase as any).from("tank_contacts").upsert(
    {
      tank_id: tankId,
      name: respondent_name,
      phone_number,
      source: "survey",
    },
    { onConflict: "tank_id,phone_number" },
  );

  revalidatePath("/dashboard/survey");
  return { ok: true };
}
