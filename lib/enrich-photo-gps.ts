/** Server-side EXIF pass when browser had no GPS / stripped EXIF. */
export async function enrichGpsFromServerExif(file: File): Promise<{
  latitude: number | null;
  longitude: number | null;
}> {
  const fd = new FormData();
  fd.append("image", file);
  try {
    const res = await fetch("/api/photo/exif-gps", { method: "POST", body: fd });
    const data = (await res.json()) as {
      latitude?: number | null;
      longitude?: number | null;
    };
    if (!res.ok) {
      return { latitude: null, longitude: null };
    }
    const lat = data.latitude;
    const lon = data.longitude;
    const latitude =
      typeof lat === "number" && Number.isFinite(lat)
        ? lat
        : lat != null
          ? Number(lat)
          : NaN;
    const longitude =
      typeof lon === "number" && Number.isFinite(lon)
        ? lon
        : lon != null
          ? Number(lon)
          : NaN;
    if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) {
      return { latitude: null, longitude: null };
    }
    return { latitude, longitude };
  } catch {
    return { latitude: null, longitude: null };
  }
}
