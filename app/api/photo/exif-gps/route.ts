import { NextResponse } from "next/server";
import { extractGpsFromImageBuffer } from "@/lib/extract-exif-gps";

export const runtime = "nodejs";

const MAX_BYTES = 12 * 1024 * 1024;

export async function POST(request: Request) {
  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("image");
  if (!(file instanceof File) || file.size === 0) {
    return NextResponse.json({ latitude: null, longitude: null }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const gps = await extractGpsFromImageBuffer(buf);

  return NextResponse.json({
    latitude: gps?.latitude ?? null,
    longitude: gps?.longitude ?? null,
  });
}
