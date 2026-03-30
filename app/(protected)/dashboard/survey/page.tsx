import Link from "next/link";
import { Card } from "@/components/ui/Card";
import type { FieldSurveyListItem } from "@/components/dashboard/FieldSurveysList";
import { createClient } from "@/lib/supabase/server";
import { SurveyPageTabs } from "./SurveyPageTabs";

function normalizeFieldSurveyRow(row: Record<string, unknown>): FieldSurveyListItem {
  const pressure = row.pressure_level;
  const pressure_level =
    pressure === "low" || pressure === "medium" || pressure === "high" ? pressure : "medium";

  const sk = row.submission_kind;
  const submission_kind =
    sk === "supply_report" || sk === "field_survey" ? sk : "field_survey";

  const rc = row.report_channel;
  const report_channel = rc === "web" || rc === "whatsapp" ? rc : null;

  const lg = row.language;
  const language =
    lg === "en" || lg === "hi" || lg === "mr" || lg === "ur" ? lg : null;

  const dm = row.duration_minutes;
  const duration_minutes =
    typeof dm === "number" && !Number.isNaN(dm) ? dm : null;

  const zn = row.zone_number;
  let zone_number: number | null = null;
  if (typeof zn === "number" && zn >= 1 && zn <= 5) zone_number = zn;
  else if (typeof zn === "string" && /^[1-5]$/.test(zn)) zone_number = Number(zn);

  return {
    id: String(row.id ?? ""),
    respondent_name: String(row.respondent_name ?? ""),
    phone_number: String(row.phone_number ?? ""),
    survey_date: row.survey_date != null ? String(row.survey_date) : null,
    arrival_time: row.arrival_time != null ? String(row.arrival_time) : null,
    duration_minutes,
    pressure_level,
    notes: row.notes != null ? String(row.notes) : null,
    image_url: row.image_url != null ? String(row.image_url) : null,
    submission_kind,
    report_channel,
    language,
    zone_number,
    created_at: String(row.created_at ?? ""),
  };
}

export default async function SurveyPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await (supabase as any).from("profiles").select("tank_id").eq("id", user.id).single()
    : { data: null };

  const rawTankId = profile?.tank_id as number | string | null | undefined;
  const numericTankId =
    rawTankId != null && rawTankId !== ""
      ? Number(rawTankId)
      : NaN;
  const tankId = !Number.isNaN(numericTankId) ? numericTankId : null;
  const hasTank = tankId != null;

  const { data: tankMeta } = tankId
    ? await (supabase as any).from("water_tanks").select("name,ward").eq("id", tankId).single()
    : { data: null };

  let surveyRows: FieldSurveyListItem[] = [];
  let surveyFetchError: string | null = null;

  if (tankId != null) {
    const { data: rawRows, error } = await (supabase as any)
      .from("field_surveys")
      .select("*")
      .eq("tank_id", tankId)
      .order("created_at", { ascending: false });

    if (error) {
      surveyFetchError = error.message;
    } else {
      surveyRows = (rawRows ?? []).map((row: Record<string, unknown>) =>
        normalizeFieldSurveyRow(row),
      );
    }
  }

  const tankTitle = (tankMeta?.name as string | undefined) ?? (tankId != null ? `Tank #${tankId}` : "");
  const wardLabel = (tankMeta?.ward as string | undefined) ?? null;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Survey</h1>
        <p className="text-sm text-muted">
          Field surveys are stored in <strong className="font-medium text-foreground">field_surveys</strong>{" "}
          only (not complaints). Public{" "}
          <Link href="/supply-report" className="font-medium text-primary underline">
            supply reports
          </Link>{" "}
          from citizens are saved there too, tagged as supply reports. Complaints use the separate{" "}
          <Link href="/complaints" className="font-medium text-primary underline">
            complaint
          </Link>{" "}
          page.
        </p>
      </div>

      {!user ? (
        <Card>
          <p className="text-sm text-muted">Sign in to view surveys and submit new entries.</p>
        </Card>
      ) : !hasTank ? (
        <Card>
          <p className="text-sm text-muted">
            No tank is assigned to your profile. Assign one from{" "}
            <Link href="/dashboard/assigned-tank" className="font-medium text-primary underline">
              Assigned Tank
            </Link>{" "}
            first.
          </p>
        </Card>
      ) : (
        <>
          {surveyFetchError ? (
            <Card className="border-red-200 bg-red-50/50">
              <p className="text-sm font-medium text-red-800">Could not load surveys</p>
              <p className="mt-1 text-sm text-red-700">{surveyFetchError}</p>
              <p className="mt-2 text-xs text-red-700/90">
                If this mentions a missing column, run the SQL migrations for{" "}
                <code className="rounded bg-red-100 px-1">field_surveys</code> (including supply
                columns). If rows never appear, apply{" "}
                <code className="rounded bg-red-100 px-1">
                  cei_field_surveys_select_by_assigned_tank.sql
                </code>{" "}
                so your account can read surveys for your assigned tank.
              </p>
            </Card>
          ) : null}
          <SurveyPageTabs rows={surveyRows} tankTitle={tankTitle} wardLabel={wardLabel} />
        </>
      )}
    </div>
  );
}
