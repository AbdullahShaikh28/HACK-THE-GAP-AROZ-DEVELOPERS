"use client";

import * as React from "react";
import { Card } from "@/components/ui/Card";
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

  async function onSubmit(formData: FormData) {
    setError(null);
    setSuccess(false);
    setPending(true);
    const result = await submitFieldSurvey(formData);
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
        Saved only to field surveys (not complaints). Include an optional survey date, arrival time,
        duration, and pressure for your assigned tank.
      </p>

      <form key={formKey} action={onSubmit} className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="space-y-1 md:col-span-2">
          <label htmlFor="sv_name" className="text-xs font-medium text-foreground">
            Name
          </label>
          <input
            id="sv_name"
            name="name"
            required
            autoComplete="name"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
            placeholder="Respondent name"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="sv_phone" className="text-xs font-medium text-foreground">
            Contact (phone)
          </label>
          <input
            id="sv_phone"
            name="phone_number"
            required
            type="tel"
            autoComplete="tel"
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
            placeholder="+91…"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="sv_survey_date" className="text-xs font-medium text-foreground">
            Survey date
          </label>
          <input
            id="sv_survey_date"
            name="survey_date"
            type="date"
            className="h-10 w-full max-w-xs rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
          />
          <p className="text-[11px] text-muted">
            Optional — day this observation applies to (e.g. visit or supply date).
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
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
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
            className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
            placeholder="e.g. 35"
          />
        </div>

        <div className="space-y-1 md:col-span-2">
          <label htmlFor="sv_pressure" className="text-xs font-medium text-foreground">
            Pressure
          </label>
          <select
            id="sv_pressure"
            name="pressure_level"
            required
            defaultValue="medium"
            className="h-10 w-full max-w-md rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>

        {error ? <p className="text-sm text-red-600 md:col-span-2">{error}</p> : null}
        {success ? (
          <p className="text-sm text-green-700 md:col-span-2">Survey saved successfully.</p>
        ) : null}

        <div className="md:col-span-2">
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
