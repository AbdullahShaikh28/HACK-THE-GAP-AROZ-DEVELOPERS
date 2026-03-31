import type { LocationCheckStatus } from "@/lib/geo";

/**
 * Copy for UI: we avoid "Fail" — outside-radius captures are flagged as possible spam.
 */
export function locationCheckBadgeText(
  status: LocationCheckStatus | null,
  distanceToTankM: number | null,
): string {
  if (status === "pass") return "Within service area";
  if (status === "fail") {
    if (distanceToTankM != null) {
      return `Possible spam · ~${Math.round(distanceToTankM)} m from tank point`;
    }
    return "Possible spam · outside service area";
  }
  if (status === "unavailable") return "No capture location";
  return "—";
}

/** Short label for dense table cells (coordinates shown on next line). */
export function locationCheckTableSummary(
  status: LocationCheckStatus | null,
  distanceToTankM: number | null,
): string {
  if (status === "pass") return "Verified";
  if (status === "fail") {
    return distanceToTankM != null ? `Spam? · ${Math.round(distanceToTankM)} m` : "Spam?";
  }
  if (status === "unavailable") return "No GPS";
  return "—";
}

/** Sentence for dialogs / detail panels. */
export function locationCheckDescription(
  status: LocationCheckStatus | null,
  distanceToTankM: number | null,
): string {
  if (status === "pass") {
    return "Capture location is within the configured distance from this tank’s map point.";
  }
  if (status === "fail") {
    return `Capture is farther from the tank’s map point than the allowed radius (${
      distanceToTankM != null ? `about ${Math.round(distanceToTankM)} m away` : "outside allowed area"
    }). It is flagged as possible spam for review—not rejected automatically.`;
  }
  if (status === "unavailable") {
    return "No GPS coordinates were stored with this photo.";
  }
  return "—";
}
