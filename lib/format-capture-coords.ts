/** Compact WGS84 pair for table cells and titles. */
export function formatCaptureCoordinates(
  latitude: number | null,
  longitude: number | null,
): string {
  if (
    latitude == null ||
    longitude == null ||
    !Number.isFinite(latitude) ||
    !Number.isFinite(longitude)
  ) {
    return "—";
  }
  return `${latitude.toFixed(5)}, ${longitude.toFixed(5)}`;
}
