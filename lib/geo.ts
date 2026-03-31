/** Earth radius in meters (WGS84 mean) */
const R = 6_371_008.8;

export function haversineDistanceMeters(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c;
}

export function getPhotoMaxDistanceM(): number {
  const raw =
    typeof process !== "undefined" ? process.env.NEXT_PUBLIC_PHOTO_MAX_DISTANCE_M : undefined;
  const n = raw != null && raw !== "" ? Number(raw) : NaN;
  return Number.isFinite(n) && n > 0 ? n : 500;
}

export type LocationCheckStatus = "pass" | "fail" | "unavailable";

export function computeLocationCheck(
  photoLat: number | null,
  photoLon: number | null,
  tankLat: number,
  tankLon: number,
  maxDistanceM: number,
): { distanceM: number | null; status: LocationCheckStatus } {
  if (
    photoLat == null ||
    photoLon == null ||
    !Number.isFinite(photoLat) ||
    !Number.isFinite(photoLon)
  ) {
    return { distanceM: null, status: "unavailable" };
  }

  const distanceM = haversineDistanceMeters(photoLat, photoLon, tankLat, tankLon);
  const status: LocationCheckStatus = distanceM <= maxDistanceM ? "pass" : "fail";
  return { distanceM, status };
}
