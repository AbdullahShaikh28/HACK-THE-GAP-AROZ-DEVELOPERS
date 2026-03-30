import { formatZoneSupplyDateLabel, getNextAlternateDayForZone } from "@/lib/dummy-zones";

/**
 * Zone 1→Monday … Zone 5→Friday (see dummy-zones). Same clock time for each zone’s day;
 * if that instant is already past, move to the same weekday next week.
 */
export function computeZoneNextSupplyStart(
  zoneNumber: number,
  recommendedOpenTimeHHmm: string,
  fromDate: Date,
): { startIso: string; dateLabel: string; weekdayLabel: string } {
  let day = getNextAlternateDayForZone(zoneNumber, fromDate);
  const parts = recommendedOpenTimeHHmm.split(":");
  const h = Number(parts[0]);
  const minute = Number(parts[1]);
  const hh = Number.isFinite(h) ? h : 7;
  const mm = Number.isFinite(minute) ? minute : 0;
  day.setHours(hh, mm, 0, 0);
  while (day.getTime() <= fromDate.getTime()) {
    day.setDate(day.getDate() + 7);
  }
  return {
    startIso: day.toISOString(),
    dateLabel: formatZoneSupplyDateLabel(day),
    weekdayLabel: day.toLocaleDateString("en-US", { weekday: "long" }),
  };
}

/** HH:mm in Asia/Kolkata from an ISO instant (for applying manual overrides to rotation). */
export function extractHHmmIST(iso: string): string {
  const d = new Date(iso);
  const parts = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).formatToParts(d);
  let h = "07";
  let m = "00";
  for (const p of parts) {
    if (p.type === "hour") h = p.value.padStart(2, "0");
    if (p.type === "minute") m = p.value.padStart(2, "0");
  }
  return `${h}:${m}`;
}
