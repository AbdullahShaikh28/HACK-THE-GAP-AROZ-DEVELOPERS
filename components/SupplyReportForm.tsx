"use client";

import { useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { computeLocationCheck, getPhotoMaxDistanceM } from "@/lib/geo";
import { FORM_LANGUAGE_OPTIONS } from "@/lib/form-language-options";
import { supplyReportT } from "@/lib/supply-report-i18n";
import { tankDropdownLabel } from "@/lib/whatsapp-tank-lines";
import type { ChatLanguage } from "@/types";

type TankOption = {
  id: number;
  name: string;
  ward: string;
  latitude: number;
  longitude: number;
};

type SupplyReportFormProps = {
  tanks: TankOption[];
  initialPhoneNumber?: string;
  initialTankId?: number;
  initialChannel?: "web" | "whatsapp";
};

export function SupplyReportForm({
  tanks,
  initialPhoneNumber,
  initialTankId,
  initialChannel = "web",
}: SupplyReportFormProps) {
  const [formLang, setFormLang] = useState<ChatLanguage>("en");
  const t = useMemo(() => supplyReportT(formLang), [formLang]);

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState(initialPhoneNumber ?? "");
  const [tankId, setTankId] = useState(
    initialTankId ? String(initialTankId) : tanks[0] ? String(tanks[0].id) : "",
  );
  const [details, setDetails] = useState("");
  const [arrivalDate, setArrivalDate] = useState("");
  const [arrivalTime, setArrivalTime] = useState("");
  const [durationMinutes, setDurationMinutes] = useState("");
  const [pressureLevel, setPressureLevel] = useState<"" | "low" | "medium" | "high">("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const textDirection = formLang === "ur" ? "rtl" : "ltr";

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const copy = supplyReportT(formLang);
    setIsSubmitting(true);
    setMessage(null);
    setError(null);

    if (!pressureLevel || !arrivalDate.trim() || !arrivalTime.trim() || durationMinutes === "") {
      setError(copy.errors.incomplete);
      setIsSubmitting(false);
      return;
    }

    try {
      const supabase = createClient();

      const selectedTank = tanks.find((t) => t.id === Number(tankId));
      const maxM = getPhotoMaxDistanceM();
      const loc = selectedTank
        ? computeLocationCheck(
            null,
            null,
            selectedTank.latitude,
            selectedTank.longitude,
            maxM,
          )
        : { distanceM: null as number | null, status: "unavailable" as const };

      const notesText = details.trim();
      if (!notesText) {
        throw new Error(copy.errors.detailsRequired);
      }

      const duration = Number(durationMinutes);
      if (Number.isNaN(duration) || duration < 0) {
        throw new Error(copy.errors.durationInvalid);
      }

      const minimalSurvey: Record<string, unknown> = {
        respondent_name: name,
        phone_number: phoneNumber,
        tank_id: Number(tankId),
        survey_date: arrivalDate.trim(),
        arrival_time: arrivalTime,
        duration_minutes: duration,
        pressure_level: pressureLevel,
      };

      const withSupplyFields: Record<string, unknown> = {
        ...minimalSurvey,
        notes: notesText,
        submission_kind: "supply_report",
        report_channel: initialChannel,
      };

      const withLang: Record<string, unknown> = {
        ...withSupplyFields,
        language: formLang,
      };

      const withLocationCheck: Record<string, unknown> = {
        ...withLang,
        ...(loc.status ? { location_check_status: loc.status } : {}),
        ...(loc.distanceM != null ? { distance_to_tank_m: loc.distanceM } : {}),
      };

      const attempts = [withLocationCheck, withLang, withSupplyFields, minimalSurvey];

      let lastMessage = "";
      for (const payload of attempts) {
        const { error: insertError } = await (supabase as any)
          .from("field_surveys")
          .insert(payload);
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

      try {
        await (supabase as any).from("tank_contacts").upsert(
          {
            tank_id: Number(tankId),
            name,
            phone_number: phoneNumber,
            source: "supply_report",
          },
          { onConflict: "tank_id,phone_number" },
        );
      } catch {
        // Non-blocking: contact provenance is best-effort
      }

      setMessage(supplyReportT(formLang).success);
      setName("");
      setPhoneNumber("");
      setDetails("");
      setArrivalDate("");
      setArrivalTime("");
      setDurationMinutes("");
      setPressureLevel("");
      if (initialPhoneNumber) setPhoneNumber(initialPhoneNumber);
      if (initialTankId) setTankId(String(initialTankId));
      else if (tanks[0]) setTankId(String(tanks[0].id));
    } catch (submitError) {
      setError(
        submitError instanceof Error
          ? submitError.message
          : supplyReportT(formLang).errors.submitFailed,
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
              id="sr_form_lang"
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
          <label htmlFor="sr_name" className="text-sm font-medium text-[#1a2535]">
            {t.name}
          </label>
          <input
            id="sr_name"
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="sr_phone" className="text-sm font-medium text-[#1a2535]">
            {t.phone}
          </label>
          <input
            id="sr_phone"
            value={phoneNumber}
            onChange={(event) => setPhoneNumber(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
            required
          />
        </div>
      </div>

      <div className="space-y-1">
        <label htmlFor="sr_tank" className="text-sm font-medium text-[#1a2535]">
          {t.tank}
        </label>
        <select
          id="sr_tank"
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
        <label htmlFor="sr_details" className="text-sm font-medium text-[#1a2535]">
          {t.reportDetails}
        </label>
        <textarea
          id="sr_details"
          value={details}
          onChange={(event) => setDetails(event.target.value)}
          rows={3}
          required
          minLength={1}
          className="w-full rounded-lg border border-[#dce4ef] px-3 py-2 text-sm outline-none focus:border-[#1a3a6e]"
          placeholder={t.detailsPlaceholder}
        />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="space-y-1">
          <label htmlFor="sr_arrival_date" className="text-sm font-medium text-[#1a2535]">
            {t.arrivalDate}
          </label>
          <input
            id="sr_arrival_date"
            type="date"
            value={arrivalDate}
            onChange={(event) => setArrivalDate(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="sr_arrival" className="text-sm font-medium text-[#1a2535]">
            {t.arrivalTime}
          </label>
          <input
            id="sr_arrival"
            type="time"
            value={arrivalTime}
            onChange={(event) => setArrivalTime(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="sr_duration" className="text-sm font-medium text-[#1a2535]">
            {t.durationMinutes}
          </label>
          <input
            id="sr_duration"
            type="number"
            min={0}
            step={1}
            value={durationMinutes}
            onChange={(event) => setDurationMinutes(event.target.value)}
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
            required
          />
        </div>
        <div className="space-y-1">
          <label htmlFor="sr_pressure" className="text-sm font-medium text-[#1a2535]">
            {t.pressure}
          </label>
          <select
            id="sr_pressure"
            value={pressureLevel}
            onChange={(event) =>
              setPressureLevel(event.target.value as "" | "low" | "medium" | "high")
            }
            className="h-10 w-full rounded-lg border border-[#dce4ef] px-3 text-sm outline-none focus:border-[#1a3a6e]"
            required
          >
            <option value="" disabled>
              {t.selectPressure}
            </option>
            <option value="low">{t.pressureLow}</option>
            <option value="medium">{t.pressureMedium}</option>
            <option value="high">{t.pressureHigh}</option>
          </select>
        </div>
      </div>

      {error ? <p className="text-sm text-red-600">{error}</p> : null}
      {message ? <p className="text-sm text-emerald-600">{message}</p> : null}

      <button
        type="submit"
        disabled={isSubmitting}
        className="h-10 rounded-lg bg-[#e8610a] px-4 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
      >
        {isSubmitting ? t.submitting : t.submit}
      </button>
    </form>
  );
}
