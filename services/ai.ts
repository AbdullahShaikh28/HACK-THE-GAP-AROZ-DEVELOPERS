import type { ChatApiMessage, ChatLanguage } from "@/types";

type OllamaChatResponse = {
  message?: {
    content?: string;
  };
  error?: string;
};

const languageInstructions: Record<ChatLanguage, string> = {
  en: "Respond in English.",
  hi: "Respond in Hindi.",
  mr: "Respond in Marathi.",
  ur: "Respond in Urdu.",
};

export async function generateAiResponse(
  messages: ChatApiMessage[],
  language: ChatLanguage,
) {
  const baseUrl = process.env.OLLAMA_BASE_URL || "http://localhost:11434";
  const model = process.env.OLLAMA_MODEL || "llama3.2";

  const response = await fetch(`${baseUrl}/api/chat`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model,
      stream: false,
      messages: [
        {
          role: "system",
          content:
            `You are a strictly domain-limited water management copilot for a municipal or industrial water system. Only answer questions related to water management operations, water infrastructure, reservoirs, tanks, pipelines, pumps, valves, pressure, leakage, water quality, treatment, alerts, forecasting, maintenance, service zones, maps, and locations relevant to the water system. You may also answer questions about data that is explicitly present in the app or directly provided by the user in the chat. If the user asks about anything outside water management, unrelated geography, general trivia, coding outside this water system app, or any topic not grounded in water management or app data, politely refuse and say you can only help with water management, locations, and app data. Never invent live readings, dashboards, analytics, or location data that the app has not provided. If the user asks for app data that is unavailable, clearly say that the current app does not expose that data yet. Keep answers practical, safety-conscious, and useful for operators, analysts, and decision-makers. Ask clarifying questions when specific site, location, or measurement details are missing. ${languageInstructions[language]}`,
        },
        ...messages,
      ],
    }),
  });

  const data = (await response.json()) as OllamaChatResponse;

  if (!response.ok) {
    throw new Error(data.error || "Ollama request failed.");
  }

  return {
    message: data.message?.content || "I could not generate a response.",
  };
}
