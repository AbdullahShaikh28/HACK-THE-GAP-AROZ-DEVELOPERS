/**
 * OpenStreetMap Nominatim reverse lookup (usage policy: low volume, identifiable UA).
 */
export async function nominatimReverseDisplayName(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  if (!Number.isFinite(latitude) || !Number.isFinite(longitude)) return null;
  if (latitude < -90 || latitude > 90 || longitude < -180 || longitude > 180) return null;

  const nominatimUrl = new URL("https://nominatim.openstreetmap.org/reverse");
  nominatimUrl.searchParams.set("lat", String(latitude));
  nominatimUrl.searchParams.set("lon", String(longitude));
  nominatimUrl.searchParams.set("format", "json");
  nominatimUrl.searchParams.set("addressdetails", "1");

  const res = await fetch(nominatimUrl.toString(), {
    headers: {
      Accept: "application/json",
      "User-Agent": "HACKTHEGAP-WaterSurvey/1.0 (field survey dashboard; contact: local)",
    },
    cache: "no-store",
  });

  if (!res.ok) return null;

  const data = (await res.json()) as {
    display_name?: string;
    error?: string;
  };

  if (data.error) return null;
  return typeof data.display_name === "string" ? data.display_name : null;
}
