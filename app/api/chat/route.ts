import { NextResponse } from "next/server";
import { generateAiResponse } from "@/services/ai";
import type { ChatApiMessage, ChatLanguage } from "@/types";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as {
      message?: string;
      messages?: ChatApiMessage[];
      language?: ChatLanguage;
    };
    const latestMessage = body.message?.trim();
    const language = body.language ?? "en";
    const messages =
      body.messages?.filter(
        (message) => message.role && message.content?.trim().length,
      ) ?? [];

    if (!latestMessage && messages.length === 0) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const response = await generateAiResponse(
      messages.length > 0
        ? messages
        : [{ role: "user", content: latestMessage as string }],
      language,
    );

    return NextResponse.json(response);
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Failed to generate response.";

    return NextResponse.json({ error: message }, { status: 500 });
  }
}
