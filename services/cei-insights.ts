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
