import {
  formatZoneSupplyDateLabel,
  getDummyZoneLabel,
  getNextAlternateDayForZone,
} from "@/lib/dummy-zones";
import type { TankInsight } from "@/services/cei-insights";

/** WhatsApp body for one zone contact: CEI valve schedule + dummy zone rotation date. */
export function buildSchedulingInsightWhatsAppBody(
  insight: TankInsight,
  zoneNumber: number,
  fromDate: Date = new Date(),
) {
  const nextZoneDay = getNextAlternateDayForZone(zoneNumber, fromDate);
  const zoneDateStr = formatZoneSupplyDateLabel(nextZoneDay);
  const zoneLabel = getDummyZoneLabel(zoneNumber);
  return [
    "AI Scheduling Insights",
    `${insight.tankName}: open valve on ${insight.scheduledWeekday}, ${insight.scheduledDateLabel} at ${insight.recommendedOpenTime} for ${insight.recommendedDurationMinutes} minutes.`,
    `Your zone: ${zoneLabel}`,
    `Next supply for your zone: ${zoneDateStr} (alternate-day schedule).`,
  ].join("\n");
}
