/**
 * Classify a field photo using a local Ollama **vision** model (not text-only llama3.2).
 * Set OLLAMA_VISION_MODEL (e.g. llama3.2-vision, llava). If unset, returns nulls.
 */

type OllamaVisionChatResponse = {
  message?: { content?: string };
  error?: string;
};

const SYSTEM_PROMPT =
  "You are a water utility field inspector. Classify the primary visible issue in the image. " +
  "Reply with a single JSON object only, no markdown or code fences: " +
  '{"label":"one of leak|pressure|turbidity|valve|equipment|unknown","confidence":0.0}';

export async function analyzeIssueFromImageBase64(
  base64: string,
): Promise<{ label: string | null; raw: unknown | null; error?: string }> {
  const model = process.env.OLLAMA_VISION_MODEL?.trim();
  if (!model) {
    return { label: null, raw: null };
  }

  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        {
          role: "user",
          content: SYSTEM_PROMPT,
          images: [base64],
        },
      ],
    }),
  });

  const data = (await response.json()) as OllamaVisionChatResponse;

  if (!response.ok) {
    return {
      label: null,
      raw: null,
      error: data.error || `Ollama vision HTTP ${response.status}`,
    };
  }

  const text = data.message?.content?.trim() ?? "";
  if (!text) {
    return { label: null, raw: null };
  }

  let parsed: { label?: string; confidence?: number };
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    parsed = JSON.parse(jsonMatch ? jsonMatch[0] : text) as {
      label?: string;
      confidence?: number;
    };
  } catch {
    return { label: null, raw: { text } };
  }

  const allowed = new Set(["leak", "pressure", "turbidity", "valve", "equipment", "unknown"]);
  const label =
    typeof parsed.label === "string" && allowed.has(parsed.label.toLowerCase())
      ? parsed.label.toLowerCase()
      : typeof parsed.label === "string"
        ? parsed.label.slice(0, 120)
        : null;

  return {
    label,
    raw: { label: parsed.label, confidence: parsed.confidence, text },
  };
}
