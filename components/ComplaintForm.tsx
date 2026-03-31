"use client";

import { useMemo, useState } from "react";
import { PhotoCaptureInput } from "@/components/PhotoCaptureInput";
import { createClient } from "@/lib/supabase/client";
import { fetchIssueLabelFromImage } from "@/lib/client-vision";
import { complaintFormT } from "@/lib/complaint-form-i18n";
import { computeLocationCheck, getPhotoMaxDistanceM } from "@/lib/geo";
import type { PhotoCaptureValue } from "@/lib/photo-capture-types";
import { FORM_LANGUAGE_OPTIONS } from "@/lib/form-language-options";
import { enrichGpsFromServerExif } from "@/lib/enrich-photo-gps";
import { tankDropdownLabel } from "@/lib/whatsapp-tank-lines";
import type { ChatLanguage } from "@/types";

const COMPLAINTS_BUCKET = process.env.NEXT_PUBLIC_COMPLAINTS_BUCKET ?? "imaged";

type TankOption = {
  id: number;
  name: string;
  ward: string;
  latitude: number;
  longitude: number;
};

type ComplaintFormProps = {
  tanks: TankOption[];
  initialPhoneNumber?: string;
  initialTankId?: number;
  initialChannel?: "web" | "whatsapp";
};

export function ComplaintForm({
  tanks,
  initialPhoneNumber,
  initialTankId,
  initialChannel = "web",
}: ComplaintFormProps) {
  const [formLang, setFormLang] = useState<ChatLanguage>("en");
  const t = useMemo(() => complaintFormT(formLang), [formLang]);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber ?? "");
  const [tankId, setTankId] = useState(
    initialTankId ? String(initialTankId) : tanks[0] ? String(tanks[0].id) : "",
  );
  const [issue, setIssue] = useState("");
  const [photo, setPhoto] = useState<PhotoCaptureValue | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const textDirection = formLang === "ur" ? "rtl" : "ltr";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const copy = complaintFormT(formLang);
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    if (!photo?.file) {
      setError(copy.errors.incomplete);
      setIsSubmitting(false);
      return;
    }

    const imageFile = photo.file;

    try {
      const supabase = createClient();

      const vision = await fetchIssueLabelFromImage(imageFile);

      let photoLat = photo.latitude;
      let photoLon = photo.longitude;
      let photoAcc = photo.accuracyM;
      if (photoLat == null || photoLon == null) {
        const ex = await enrichGpsFromServerExif(imageFile);
        if (ex.latitude != null && ex.longitude != null) {
          photoLat = ex.latitude;
          photoLon = ex.longitude;
        }
      }

      const selectedTank = tanks.find((t) => t.id === Number(tankId));
      const maxM = getPhotoMaxDistanceM();
      const loc = selectedTank
        ? computeLocationCheck(
            photoLat,
            photoLon,
            selectedTank.latitude,
            selectedTank.longitude,
            maxM,
          )
        : { distanceM: null as number | null, status: "unavailable" as const };

      const extension = imageFile.name.split(".").pop() ?? "jpg";
      const filePath = `complaints/${Date.now()}-${Math.random().toString(36).slice(2)}.${extension}`;
      const { error: uploadError } = await (supabase as any)
        .storage
        .from(COMPLAINTS_BUCKET)
        .upload(filePath, imageFile, {
          cacheControl: "3600",
          upsert: false,
        });

      if (uploadError) {
        if (uploadError.message?.toLowerCase().includes("bucket not found")) {
          throw new Error(
            `Bucket "${COMPLAINTS_BUCKET}" not found. Create it in Supabase Storage or set NEXT_PUBLIC_COMPLAINTS_BUCKET.`,
          );
        }
        throw new Error(uploadError.message);
      }

      const { data: publicData } = (supabase as any)
        .storage
        .from(COMPLAINTS_BUCKET)
        .getPublicUrl(filePath);

      const imageUrl = publicData?.publicUrl ?? null;
      if (!imageUrl) {
        throw new Error(copy.errors.imageUrl);
      }

      const issueText = issue.trim();
      if (!issueText) {
        throw new Error(copy.errors.issueRequired);
      }

      /** Base row — works with minimal `complaints` table (see sql/complaints.sql). */
      const minimal: Record<string, unknown> = {
        name,
        phone_number: phoneNumber,
        tank_id: Number(tankId),
        issue: issueText,
        report_channel: initialChannel,
        source_phone: phoneNumber,
        report_type: "complaint",
        image_url: imageUrl,
      };

      const withLang: Record<string, unknown> = { ...minimal, language: formLang };

      const withPhotoGeo: Record<string, unknown> = {
        ...withLang,
        photo_latitude: photoLat,
        photo_longitude: photoLon,
        photo_location_accuracy_m: photoAcc,
        distance_to_tank_m: loc.distanceM,
        location_check_status: loc.status,
      };

      const withAi: Record<string, unknown> = {
        ...withPhotoGeo,
        ai_issue_label: vision.label,
        ai_issue_raw: vision.raw,
        ai_analyzed_at: vision.analyzedAt,
      };

      /**
       * Try richest payload first. If PostgREST reports unknown columns (migrations not applied),
       * fall back so submission still works on older schemas. Does not send `capture_address`
       * from the client — add sql/cei_capture_address.sql when the column exists.
       */
      const attempts = [withAi, withPhotoGeo, withLang, minimal];

      let lastMessage = "";
      for (const payload of attempts) {
        const { error: insertError } = await (supabase as any).from("complaints").insert(payload);
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
          throw new Error(lastMessage);
        }
      }
      if (lastMessage) {
        throw new Error(lastMessage);
      }

      await (supabase as any).from("tank_contacts").upsert(
        {
          tank_id: Number(tankId),
          name,
          phone_number: phoneNumber,
          source: "complaint",
        },
        { onConflict: "tank_id,phone_number" },
      );

      setMessage(complaintFormT(formLang).success);
      setName("");
      setPhoneNumber("");
      setIssue("");
      if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
      setPhoto(null);
      if (initialPhoneNumber) setPhoneNumber(initialPhoneNumber);
      if (initialTankId) setTankId(String(initialTankId));
      else if (tanks[0]) setTankId(String(tanks[0].id));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : complaintFormT(formLang).errors.submitFailed,
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form
      dir={textDirection}
      onSubmit={handleSubmit}
      className="space-y-4 rounded-xl border border-[#dce4ef] bg-white p-6 shadow-[0_2px_8px_rgba(26,58,110,0.10)]"
    >
      <div className="rounded-lg border border-[#dce4ef] bg-gradient-to-br from-[#f8fafc] to-[#f0f4f8] px-4 py-3 shadow-[inset_0_1px_0_rgba(255,255,255,0.8)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div className="min-w-0 flex-1 space-y-1">
            <p className="text-sm font-semibold leading-snug text-[#1a2535]">
              {t.formLanguageLabel}
            </p>
            <p className="text-[11px] leading-relaxed text-[#6b7a94] sm:max-w-xl">
              {t.formLanguageHint}
            </p>
          </div>
          <div className="flex w-full shrink-0 justify-end sm:w-auto sm:max-w-[44%]">
            <select
              id="cf_form_lang"
              value={formLang}
              onChange={(event) => setFormLang(event.target.value as ChatLanguage)}
              aria-label={t.formLanguageLabel}
              className="h-9 w-full max-w-[12rem] cursor-pointer appearance-none rounded-md border border-[#b8c5d6] bg-white px-2.5 pe-8 ps-2.5 text-[13px] font-medium text-[#1a2535] shadow-sm transition hover:border-[#1a3a6e]/40 focus:border-[#1a3a6e] focus:outline-none focus:ring-2 focus:ring-[#1a3a6e]/20 sm:ms-auto sm:w-44"
              style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%2324496b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E")`,
                backgroundSize: "1rem",
                backgroundPosition: "calc(100% - 0.5rem) center",
                backgroundRepeat: "no-repeat",
              }}
            >
              {FORM_LANGUAGE_OPTIONS.map((opt) => (
                <option key={opt.code} value={opt.code} dir={opt.dir}>
                  {opt.nativeLabel} ({opt.label})
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-1">
          <label htmlFor="cf_name" className="text-sm font-medium text-[#1a2535]">
            {t.name}
          </label>
          <input
            id="cf_name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="cf_phone" className="text-sm font-medium text-[#1a2535]">
            {t.phone}
          </label>
          <input
            id="cf_phone"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="cf_tank" className="text-sm font-medium text-[#1a2535]">
          {t.tank}
        </label>
        <select
          id="cf_tank"
          value={tankId}
          onChange={(event) => setTankId(event.target.value)}
          className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
          required
        >
          {tanks.map((tank) => (
            <option key={tank.id} value={tank.id} dir={formLang === "ur" ? "rtl" : "ltr"}>
              {tankDropdownLabel(
                { id: tank.id, name: tank.name, ward: tank.ward ?? "" },
                formLang,
              )}
            </option>
          ))}
        </select>
      </div>

      <div className="space-y-1">
        <label htmlFor="cf_issue" className="text-sm font-medium text-[#1a2535]">
          {t.complaintDetails}
        </label>
        <textarea
          id="cf_issue"
          value={issue}
          onChange={(event) => setIssue(event.target.value)}
          rows={4}
          required
          minLength={1}
          className="w-full rounded-lg border border-[#dce4ef] px-3 py-2 text-sm outline-none focus:border-[#1a3a6e]"
          placeholder={t.complaintPlaceholder}
        />
      </div>

      <PhotoCaptureInput
        id="cf_image"
        label={t.uploadImage}
        required
        value={photo}
        onChange={(next) => {
          if (photo?.previewUrl) URL.revokeObjectURL(photo.previewUrl);
          setPhoto(next);
        }}
        hint={`Proximity check: photo location must be within ${getPhotoMaxDistanceM()} m of the selected tank (centroid). Allow browser location when prompted for best results.`}
      />

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-10 rounded-lg bg-[#1a3a6e] px-4 text-sm font-semibold text-white transition hover:bg-[#16325c] disabled:opacity-60"
      >
        {isSubmitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
