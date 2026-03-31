import { NextResponse } from "next/server";
import { analyzeIssueFromImageBase64 } from "@/services/ollama-vision";

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
    return NextResponse.json({ error: "Missing image" }, { status: 400 });
  }

  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image too large" }, { status: 413 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const base64 = buf.toString("base64");
  const analyzedAt = new Date().toISOString();

  let result: Awaited<ReturnType<typeof analyzeIssueFromImageBase64>>;
  try {
    result = await analyzeIssueFromImageBase64(base64);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Vision request failed";
    return NextResponse.json(
      { label: null, raw: null, analyzedAt: null, skipped: false, error: message },
      { status: 502 },
    );
  }

  if (result.error) {
    return NextResponse.json(
      {
        label: null,
        raw: result.raw,
        analyzedAt: null,
        skipped: false,
        error: result.error,
      },
      { status: 502 },
    );
  }

  const hasVisionModel = Boolean(process.env.OLLAMA_VISION_MODEL?.trim());

  return NextResponse.json({
    label: result.label,
    raw: result.raw,
    analyzedAt: hasVisionModel && (result.label != null || result.raw != null) ? analyzedAt : null,
    skipped: !hasVisionModel,
  });
}
