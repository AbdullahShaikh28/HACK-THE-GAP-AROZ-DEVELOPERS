import exifr from "exifr";

/**
 * Read GPS latitude/longitude from image bytes (JPEG/HEIC/etc. as supported by exifr).
 * Prefer this on the server when the browser stripped EXIF or geolocation was denied.
 */
export async function extractGpsFromImageBuffer(
  buffer: Buffer,
): Promise<{ latitude: number; longitude: number } | null> {
  try {
    const tags = await exifr.parse(buffer, { gps: true });
    if (tags == null) return null;
    const lat = (tags as { latitude?: number }).latitude;
    const lon = (tags as { longitude?: number }).longitude;
    if (typeof lat === "number" && typeof lon === "number" && Number.isFinite(lat) && Number.isFinite(lon)) {
      return { latitude: lat, longitude: lon };
    }
    return null;
  } catch {
    return null;
  }
}
