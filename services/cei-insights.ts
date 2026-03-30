import { getDummyZoneLabel } from "@/lib/dummy-zones";
import { computeZoneNextSupplyStart } from "@/lib/zone-supply-rotation";
import { createClient } from "@/lib/supabase/server";

export type TankInsight = {
  tankId: number;
  tankName: string;
  recommendedOpenTime: string;
  /** ISO timestamp for the suggested valve open on the scheduled calendar day (local). */
  scheduledOpenAt: string;
  scheduledWeekday: string;
  scheduledDateLabel: string;
  recommendedDurationMinutes: number;
  targetAreas: string[];
  riskFlags: string[];
  reasoningSummary: string;
  confidence: number;
};

function toHourMinute(date: Date) {
  return `${String(date.getHours()).padStart(2, "0")}:${String(date.getMinutes()).padStart(2, "0")}`;
}

function formatInsightDateParts(date: Date) {
  const scheduledWeekday = date.toLocaleDateString("en-US", { weekday: "long" });
  const scheduledDateLabel = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
  return { scheduledWeekday, scheduledDateLabel };
}

export async function generateCeiInsightsForTank(tankId?: number | null) {
  if (!tankId) return null;

  const supabase = await createClient();
  const [{ data: tank }, { data: reports }, { data: areas }] = await Promise.all([
    (supabase as any)
      .from("water_tanks")
      .select("id,name,capacity_lakh_liters,capacity_used_lakh_liters")
      .eq("id", tankId)
      .single(),
    (supabase as any)
      .from("complaints")
      .select("created_at,priority,pressure_level,duration_minutes,report_type,status")
      .eq("tank_id", tankId)
      .order("created_at", { ascending: false })
      .limit(150),
    (supabase as any)
      .from("tank_areas")
      .select("area_name,priority_rank,pressure_level")
      .eq("tank_id", tankId)
      .order("priority_rank", { ascending: true })
      .limit(6),
  ]);

  if (!tank) return null;

  const total = Number(tank.capacity_lakh_liters ?? 0);
  const used = Number(tank.capacity_used_lakh_liters ?? 0);
  const utilization = total > 0 ? used / total : 0;
  const reportRows = (reports ?? []) as Array<any>;
  const highPriorityCount = reportRows.filter((r) => r.priority === "high").length;
  const lowPressureCount = reportRows.filter((r) => r.pressure_level === "low").length;
  const avgDuration = reportRows.length
    ? Math.round(
        reportRows.reduce((acc, r) => acc + Number(r.duration_minutes ?? 0), 0) /
          reportRows.length,
      )
    : 35;

  const now = new Date();
  const startHour = utilization > 0.8 || highPriorityCount > 10 ? 5 : utilization > 0.6 ? 6 : 7;
  const openTime = new Date(now);
  openTime.setHours(startHour, 0, 0, 0);
  const recommendedDuration = Math.min(120, Math.max(30, avgDuration || 35));

  const riskFlags: string[] = [];
  if (utilization > 0.85) riskFlags.push("High tank utilization");
  if (highPriorityCount > 10) riskFlags.push("High-priority complaints rising");
  if (lowPressureCount > 8) riskFlags.push("Frequent low-pressure reports");

  const targetAreas = ((areas ?? []) as Array<any>).map((a) => a.area_name).slice(0, 4);

  const { scheduledWeekday, scheduledDateLabel } = formatInsightDateParts(openTime);

  const insight: TankInsight = {
    tankId: tank.id,
    tankName: tank.name,
    recommendedOpenTime: toHourMinute(openTime),
    scheduledOpenAt: openTime.toISOString(),
    scheduledWeekday,
    scheduledDateLabel,
    recommendedDurationMinutes: recommendedDuration,
    targetAreas,
    riskFlags,
    reasoningSummary: `Based on ${reportRows.length} recent reports and ${Math.round(
      utilization * 100,
    )}% utilization, start distribution near ${toHourMinute(openTime)} for ${recommendedDuration} minutes with priority toward top-ranked nearby areas.`,
    confidence: Math.max(0.55, Math.min(0.95, 0.6 + reportRows.length / 500)),
  };

  return insight;
}

export type ZoneValveSuggestion = {
  zone: number;
  zoneLabel: string;
  /** Human-readable valve identifier for operators. */
  valveLabel: string;
  recommendedMinutes: number;
  lowPressurePct: number;
  surveySubmissions: number;
  avgDurationMinutes: number;
  stressLevel: "high" | "medium" | "low";
  rationale: string;
  /** Next supply window (Mon–Fri rotation + shared time-of-day from AI baseline). */
  nextSupplyStartIso: string;
  /** Zone’s weekday in the rotation (Zone 1 Monday … Zone 5 Friday). */
  rotationWeekdayLabel: string;
  /** Calendar label for nextSupplyStartIso. */
  nextSupplyDateLabel: string;
};

export type ValveSchedulingInsights = {
  tankId: number;
  tankName: string;
  ward: string;
  baseInsight: TankInsight | null;
  zones: ZoneValveSuggestion[];
  surveyWindowDays: number;
  /** Server “now” used to compute next rotation slots (stable for SSR). */
  scheduleReferenceAtIso: string;
  /** HH:mm from AI insight — same clock applied on each zone’s weekday. */
  dailySupplyTimeHHmm: string;
  /** Short copy for the valve UI. */
  rotationExplainer: string;
};

function cutoffDateForInsights(days: number) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days + 1);
  return d;
}

function toPct(value: number) {
  return Number((value * 100).toFixed(1));
}

function toAvg(value: number) {
  return Number(value.toFixed(1));
}

function stressFromSurvey(lowPct: number, submissions: number): ZoneValveSuggestion["stressLevel"] {
  if (lowPct >= 35 || (submissions >= 3 && lowPct >= 20)) return "high";
  if (lowPct >= 12 || (submissions >= 4 && lowPct >= 8)) return "medium";
  return "low";
}

function zoneMinutesFromSurvey(
  avgDuration: number,
  lowPct: number,
  submissions: number,
  fallbackMinutes: number,
) {
  if (submissions === 0) return fallbackMinutes;
  const base = Math.max(avgDuration || fallbackMinutes, 25);
  const boost = 1 + lowPct / 150;
  return Math.min(120, Math.max(25, Math.round(base * boost)));
}

/**
 * Per-zone valve open recommendations from recent field surveys (pressure, duration)
 * plus the existing CEI tank insight for calendar time and baseline duration.
 */
export async function generateValveSchedulingInsights(
  tankId?: number | null,
  surveyWindowDays: number = 30,
): Promise<ValveSchedulingInsights | null> {
  if (!tankId) return null;

  const supabase = await createClient();
  const [{ data: tank }, { data: surveys }] = await Promise.all([
    (supabase as any).from("water_tanks").select("id,name,ward").eq("id", tankId).single(),
    (supabase as any)
      .from("field_surveys")
      .select("zone_number,pressure_level,duration_minutes,created_at")
      .eq("tank_id", tankId)
      .order("created_at", { ascending: false }),
  ]);

  if (!tank) return null;

  const baseInsight = await generateCeiInsightsForTank(tankId);
  const fallbackMinutes = baseInsight?.recommendedDurationMinutes ?? 45;
  const dailySupplyTimeHHmm = baseInsight?.recommendedOpenTime ?? "07:00";
  const scheduleReferenceAt = new Date();
  const scheduleReferenceAtIso = scheduleReferenceAt.toISOString();

  const cut = cutoffDateForInsights(surveyWindowDays).getTime();
  const rows = ((surveys ?? []) as Array<any>).filter(
    (r) => new Date(r.created_at ?? 0).getTime() >= cut,
  );

  const zoneRows = new Map<number, Array<any>>();
  for (let z = 1; z <= 5; z += 1) zoneRows.set(z, []);
  for (const r of rows) {
    const z = Number(r.zone_number);
    if (z >= 1 && z <= 5) zoneRows.get(z)?.push(r);
  }

  const zones: ZoneValveSuggestion[] = [];
  for (let zone = 1; zone <= 5; zone += 1) {
    const list = zoneRows.get(zone) ?? [];
    const surveySubmissions = list.length;
    const low = list.filter((r) => r.pressure_level === "low").length;
    const lowPressurePct = surveySubmissions ? toPct(low / surveySubmissions) : 0;
    const durations = list
      .map((r) => Number(r.duration_minutes))
      .filter((n) => !Number.isNaN(n) && n >= 0);
    const avgDurationMinutes = durations.length
      ? toAvg(durations.reduce((a, b) => a + b, 0) / durations.length)
      : 0;

    const recommendedMinutes = zoneMinutesFromSurvey(
      avgDurationMinutes,
      lowPressurePct,
      surveySubmissions,
      fallbackMinutes,
    );
    const stressLevel = stressFromSurvey(lowPressurePct, surveySubmissions);

    const nextSlot = computeZoneNextSupplyStart(zone, dailySupplyTimeHHmm, scheduleReferenceAt);

    let rationale: string;
    if (surveySubmissions === 0) {
      rationale = `No field surveys in ${getDummyZoneLabel(zone)} in the last ${surveyWindowDays} days. Duration falls back to the tank baseline (${fallbackMinutes} min). Next supply slot: ${nextSlot.weekdayLabel} (${nextSlot.dateLabel}).`;
    } else {
      rationale = `From ${surveySubmissions} survey row${surveySubmissions === 1 ? "" : "s"} (field_surveys): ${lowPressurePct.toFixed(1)}% low-pressure; typical duration ${avgDurationMinutes.toFixed(1)} min. ${stressLevel === "high" ? "Prioritize longer flow to recover head." : stressLevel === "medium" ? "Monitor pressure during supply." : "Stable pressure profile in sample."} Next slot: ${nextSlot.weekdayLabel} (${nextSlot.dateLabel}).`;
    }

    zones.push({
      zone,
      zoneLabel: getDummyZoneLabel(zone),
      valveLabel: `Supply valve — ${getDummyZoneLabel(zone)}`,
      recommendedMinutes,
      lowPressurePct,
      surveySubmissions,
      avgDurationMinutes,
      stressLevel,
      rationale,
      nextSupplyStartIso: nextSlot.startIso,
      rotationWeekdayLabel: nextSlot.weekdayLabel,
      nextSupplyDateLabel: nextSlot.dateLabel,
    });
  }

  zones.sort((a, b) => a.zone - b.zone);

  const rotationExplainer =
    "Water is rotated by zone: Zone 1 on Monday through Zone 5 on Friday — not all areas on the same calendar day. The same time of day from the AI baseline applies on each zone’s day; duration and stress come from aggregated field survey data for that zone (mock seed data for tank 23 uses hundreds of rows per zone).";

  return {
    tankId: Number(tank.id),
    tankName: String(tank.name ?? `Tank #${tankId}`),
    ward: String(tank.ward ?? ""),
    baseInsight,
    zones,
    surveyWindowDays,
    scheduleReferenceAtIso,
    dailySupplyTimeHHmm,
    rotationExplainer,
  };
}
