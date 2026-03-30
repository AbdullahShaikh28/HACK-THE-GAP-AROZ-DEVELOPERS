/**
 * Dummy model: every tank has 5 zones (Zone 1 … Zone 5). Real names unknown.
 *
 * Alternate-day schedule: each zone is assigned a weekday (Mon–Fri).
 * Zone 1 → Monday, … Zone 5 → Friday. “Next supply” for a zone is the next
 * calendar date on or after `fromDate` that falls on that weekday.
 */

const ZONE_LABEL_PREFIX = "Zone";

export function getDummyZoneLabel(zoneNumber: number) {
  return `${ZONE_LABEL_PREFIX} ${zoneNumber}`;
}

/** JS getDay(): Mon=1 … Fri=5 matches zone 1…5 */
function zoneToWeekday(zoneNumber: number): number {
  if (zoneNumber < 1 || zoneNumber > 5) return 1;
  return zoneNumber;
}

/**
 * Next calendar date (local midnight preserved for display) when this zone is
 * scheduled, on or after `fromDate`.
 */
export function getNextAlternateDayForZone(zoneNumber: number, fromDate: Date): Date {
  const targetDow = zoneToWeekday(zoneNumber);
  const d = new Date(fromDate);
  d.setHours(12, 0, 0, 0);
  const currentDow = d.getDay();
  let daysToAdd = (targetDow - currentDow + 7) % 7;
  if (daysToAdd === 0) {
    return new Date(d);
  }
  const out = new Date(d);
  out.setDate(out.getDate() + daysToAdd);
  return out;
}

export function formatZoneSupplyDateLabel(date: Date) {
  return date.toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}
