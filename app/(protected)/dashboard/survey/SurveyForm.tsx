"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
import { getDummyZoneLabel } from "@/lib/dummy-zones";
import { submitFieldSurvey } from "./actions";

type SurveyFormProps = {
  /** When true, skip the outer Card (e.g. inside tabbed layout). */
  embedded?: boolean;
  /** Called after a successful save. */
  onSaved?: () => void;
};

export function SurveyForm({ embedded, onSaved }: SurveyFormProps) {
  const [error, setError] = React.useState<string | null>(null);
  const [success, setSuccess] = React.useState(false);
  const [pending, setPending] = React.useState(false);
  const [formKey, setFormKey] = React.useState(0);

  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSuccess(false);

    const form = event.currentTarget;
    const fd = new FormData(form);
    fd.append("photo_latitude", "");
    fd.append("photo_longitude", "");
    fd.append("photo_location_accuracy_m", "");

    setPending(true);
    const result = await submitFieldSurvey(fd);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setSuccess(true);
    setFormKey((k) => k + 1);
    onSaved?.();
  }

  const body = (
    <>
      <h2 className="text-lg font-semibold text-foreground">Survey details</h2>
      <p className="mt-1 text-sm text-muted">
        All fields are required. Saved to field surveys for your assigned tank. No photo is
        required on this form.
      </p>

      <form
        key={formKey}
        onSubmit={onSubmit}
        className="mt-4 grid grid-cols-1 gap-x-3 gap-y-2 sm:grid-cols-2"
      >
        <p className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground sm:col-span-2">
          Respondent
        </p>
        <div className="space-y-1">
          <label htmlFor="sv_name" className="text-xs font-medium text-foreground">
            Name
          </label>
          <input
            id="sv_name"
            name="name"
            required
            autoComplete="name"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            placeholder="Respondent name"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="sv_phone" className="text-xs font-medium text-foreground">
            Contact (phone)
          </label>
          <input
            id="sv_phone"
            name="phone_number"
            required
            type="tel"
            autoComplete="tel"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            placeholder="+91…"
          />
        </div>

        <p className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground sm:col-span-2">
          Visit timing
        </p>
        <div className="space-y-1">
          <label htmlFor="sv_survey_date" className="text-xs font-medium text-foreground">
            Survey date
          </label>
          <input
            id="sv_survey_date"
            name="survey_date"
            type="date"
            required
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
          <p className="mt-0.5 text-[11px] leading-snug text-muted">
            Day this observation applies to (e.g. visit or supply date).
          </p>
        </div>

        <div className="space-y-1">
          <label htmlFor="sv_arrival" className="text-xs font-medium text-foreground">
            Arrival time
          </label>
          <input
            id="sv_arrival"
            name="arrival_time"
            type="time"
            required
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="sv_duration" className="text-xs font-medium text-foreground">
            Duration (minutes)
          </label>
          <input
            id="sv_duration"
            name="duration_minutes"
            type="number"
            min={0}
            step={1}
            required
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            placeholder="e.g. 35"
          />
        </div>

        <div className="space-y-1">
          <label htmlFor="sv_zone" className="text-xs font-medium text-foreground">
            Zone
          </label>
          <select
            id="sv_zone"
            name="zone_number"
            required
            defaultValue=""
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
          >
            <option value="" disabled>
              Select zone
            </option>
            {([1, 2, 3, 4, 5] as const).map((z) => (
              <option key={z} value={String(z)}>
                {getDummyZoneLabel(z)}
              </option>
            ))}
          </select>
          <p className="mt-0.5 text-[11px] leading-snug text-muted">
            Distribution zone 1–5 (supply rotation Mon–Fri).
          </p>
        </div>

        <div className="flex w-full min-w-0 flex-col gap-2 sm:col-span-2">
          <p className="text-[11px] font-semibold uppercase leading-tight tracking-wide text-muted-foreground">
            Observation
          </p>
          <div className="flex min-w-0 flex-col gap-1">
            <label
              htmlFor="sv_pressure"
              className="block text-xs font-medium leading-none text-foreground"
            >
              Pressure
            </label>
            <select
              id="sv_pressure"
              name="pressure_level"
              required
              defaultValue="medium"
              className="h-10 w-full max-w-md rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/40"
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
        </div>

        {error ? (
          <p className="text-sm text-red-600 sm:col-span-2">{error}</p>
        ) : null}
        {success ? (
          <p className="text-sm text-green-700 sm:col-span-2">Survey saved successfully.</p>
        ) : null}

        <div className="mt-1 flex flex-col gap-2 border-t border-border pt-3 sm:col-span-2">
          <button
            type="submit"
            disabled={pending}
            className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90 disabled:opacity-60"
          >
            {pending ? "Saving…" : "Submit survey"}
          </button>
        </div>
      </form>
    </>
  );

  return embedded ? body : <Card>{body}</Card>;
}
