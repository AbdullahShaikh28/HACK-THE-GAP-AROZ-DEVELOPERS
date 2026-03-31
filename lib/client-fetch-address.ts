/** Browser: resolve capture point to a display name via our API route. */
export async function fetchDisplayNameForCoords(
  latitude: number,
  longitude: number,
): Promise<string | null> {
  const q = new URLSearchParams({ lat: String(latitude), lon: String(longitude) });
  try {
    const res = await fetch(`/api/geocode/reverse?${q.toString()}`);
    const data = (await res.json()) as { display_name?: string | null };
    if (!res.ok) return null;
    return typeof data.display_name === "string" ? data.display_name : null;
  } catch {
    return null;
  }
}
