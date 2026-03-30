"use server";

import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";

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

  const respondent_name = String(formData.get("name") ?? "").trim();
  const phone_number = String(formData.get("phone_number") ?? "").trim();
  const surveyDateRaw = String(formData.get("survey_date") ?? "").trim();
  const arrivalRaw = String(formData.get("arrival_time") ?? "").trim();
  const durationRaw = String(formData.get("duration_minutes") ?? "").trim();
  const pressure = String(formData.get("pressure_level") ?? "").trim();

  if (!respondent_name) return { ok: false, error: "Name is required." };
  if (!phone_number) return { ok: false, error: "Contact number is required." };

  const pressure_level =
    pressure === "low" || pressure === "medium" || pressure === "high" ? pressure : null;
  if (!pressure_level) {
    return { ok: false, error: "Select a pressure level." };
  }

  let duration_minutes: number | null = null;
  if (durationRaw) {
    const n = Number(durationRaw);
    if (Number.isNaN(n) || n < 0) {
      return { ok: false, error: "Duration must be a non-negative number." };
    }
    duration_minutes = Math.round(n);
  }

  const arrival_time = arrivalRaw || null;

  let survey_date: string | null = null;
  if (surveyDateRaw) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(surveyDateRaw)) {
      return { ok: false, error: "Survey date must be a valid date." };
    }
    survey_date = surveyDateRaw;
  }

  const { error: insertError } = await (supabase as any).from("field_surveys").insert({
    tank_id: tankId,
    submitted_by: user.id,
    respondent_name,
    phone_number,
    survey_date,
    arrival_time,
    duration_minutes,
    pressure_level,
  });

  if (insertError) {
    return { ok: false, error: insertError.message };
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
