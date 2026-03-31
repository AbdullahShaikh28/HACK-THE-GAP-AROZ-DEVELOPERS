import { NextResponse } from "next/server";
import { nominatimReverseDisplayName } from "@/lib/nominatim-reverse";

export const runtime = "nodejs";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const latRaw = url.searchParams.get("lat");
  const lonRaw = url.searchParams.get("lon");

  if (latRaw == null || lonRaw == null || latRaw === "" || lonRaw === "") {
    return NextResponse.json({ error: "Missing lat or lon" }, { status: 400 });
  }

  const lat = Number(latRaw);
  const lon = Number(lonRaw);
  if (!Number.isFinite(lat) || !Number.isFinite(lon)) {
    return NextResponse.json({ error: "Invalid coordinates" }, { status: 400 });
  }
  if (lat < -90 || lat > 90 || lon < -180 || lon > 180) {
    return NextResponse.json({ error: "Coordinates out of range" }, { status: 400 });
  }

  try {
    const display_name = await nominatimReverseDisplayName(lat, lon);
    return NextResponse.json({ display_name });
  } catch {
    return NextResponse.json({ display_name: null, error: "Geocoding failed" }, { status: 502 });
  }
}
