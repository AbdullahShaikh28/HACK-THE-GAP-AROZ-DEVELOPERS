/** Calls server Ollama vision route; failures return nulls so submission can continue. */
export async function fetchIssueLabelFromImage(file: File): Promise<{
  label: string | null;
  raw: unknown | null;
  analyzedAt: string | null;
}> {
  const fd = new FormData();
  fd.append("image", file);
  try {
    const res = await fetch("/api/vision/issue-from-image", { method: "POST", body: fd });
    const data = (await res.json()) as {
      label?: string | null;
      raw?: unknown;
      analyzedAt?: string | null;
    };
    if (!res.ok) {
      return { label: null, raw: null, analyzedAt: null };
    }
    return {
      label: typeof data.label === "string" ? data.label : null,
      raw: data.raw ?? null,
      analyzedAt: typeof data.analyzedAt === "string" ? data.analyzedAt : null,
    };
  } catch {
    return { label: null, raw: null, analyzedAt: null };
  }
}
