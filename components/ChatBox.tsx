"use client";

import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import { Message } from "@/components/Message";
import type { ChatApiMessage, ChatLanguage, ChatMessage } from "@/types";
import { cn } from "@/utils/helpers";

const initialMessages: ChatMessage[] = [
  {
    id: "welcome",
    role: "assistant",
    content:
      "I am your water management copilot. I can help only with water management, locations, and data available in this app or shared in the chat.",
  },
];

const languageOptions: Array<{
  code: ChatLanguage;
  label: string;
  nativeLabel: string;
  dir: "ltr" | "rtl";
}> = [
  { code: "en", label: "English", nativeLabel: "English", dir: "ltr" },
  { code: "hi", label: "Hindi", nativeLabel: "हिन्दी", dir: "ltr" },
  { code: "mr", label: "Marathi", nativeLabel: "मराठी", dir: "ltr" },
  { code: "ur", label: "Urdu", nativeLabel: "اردو", dir: "rtl" },
];

const contentByLanguage: Record<
  ChatLanguage,
  {
    title: string;
    description: string;
    placeholder: string;
    button: string;
    thinking: string;
    welcome: string;
    suggestions: string[];
  }
> = {
  en: {
    title: "Water Management Assistant",
    description:
      "Answers are limited to water management, locations, and in-app data.",
    placeholder:
      "Ask about water operations, locations, quality, pressure, or alerts...",
    button: "Send",
    thinking: "Thinking...",
    welcome:
      "I am your water management copilot. I can help only with water management, locations, and data available in this app or shared in the chat.",
    suggestions: [
      "Summarize the main risks for a city water distribution network during peak summer demand.",
      "What data should I track daily for reservoir, pump, and leakage management?",
      "Create an incident response checklist for a sudden drop in distribution pressure.",
      "How can I prioritize alerts for water quality, overflow, and pump downtime?",
    ],
  },
  hi: {
    title: "जल प्रबंधन सहायक",
    description:
      "उत्तर केवल जल प्रबंधन, स्थानों और ऐप के उपलब्ध डेटा तक सीमित हैं।",
    placeholder:
      "जल संचालन, स्थान, गुणवत्ता, दबाव या अलर्ट के बारे में पूछें...",
    button: "भेजें",
    thinking: "सोच रहा है...",
    welcome:
      "मैं आपका जल प्रबंधन सहायक हूँ। मैं केवल जल प्रबंधन, स्थानों और इस ऐप या चैट में उपलब्ध डेटा से जुड़े प्रश्नों में मदद कर सकता हूँ।",
    suggestions: [
      "गर्मी के मौसम में शहर के जल वितरण नेटवर्क के मुख्य जोखिम बताइए।",
      "रिज़र्वॉयर, पंप और लीकेज प्रबंधन के लिए रोज़ कौन सा डेटा ट्रैक करना चाहिए?",
      "डिस्ट्रिब्यूशन प्रेशर अचानक गिरने पर एक प्रतिक्रिया चेकलिस्ट बनाइए।",
      "जल गुणवत्ता, ओवरफ्लो और पंप डाउनटाइम के अलर्ट को कैसे प्राथमिकता दें?",
    ],
  },
  mr: {
    title: "जल व्यवस्थापन सहाय्यक",
    description:
      "उत्तरे फक्त जल व्यवस्थापन, स्थान आणि अॅपमधील उपलब्ध डेटापुरती मर्यादित आहेत.",
    placeholder:
      "जल संचालन, स्थान, गुणवत्ता, दाब किंवा अलर्ट याबद्दल विचारा...",
    button: "पाठवा",
    thinking: "विचार करत आहे...",
    welcome:
      "मी तुमचा जल व्यवस्थापन सहाय्यक आहे. मी फक्त जल व्यवस्थापन, स्थान आणि या अॅपमध्ये किंवा चॅटमध्ये दिलेल्या डेटासंबंधी मदत करू शकतो.",
    suggestions: [
      "उन्हाळ्यात शहराच्या जल वितरण जाळ्यातील मुख्य जोखमींचा सारांश द्या.",
      "रिझर्वॉयर, पंप आणि गळती व्यवस्थापनासाठी रोज कोणता डेटा ट्रॅक करावा?",
      "डिस्ट्रिब्यूशन प्रेशर अचानक कमी झाल्यास प्रतिसाद चेकलिस्ट तयार करा.",
      "पाणी गुणवत्ता, ओव्हरफ्लो आणि पंप डाउनटाइम अलर्टना प्राधान्य कसे द्यावे?",
    ],
  },
  ur: {
    title: "واٹر مینجمنٹ اسسٹنٹ",
    description:
      "جوابات صرف واٹر مینجمنٹ، مقامات، اور ایپ میں موجود ڈیٹا تک محدود ہیں۔",
    placeholder:
      "واٹر آپریشنز، مقامات، کوالٹی، پریشر یا الرٹس کے بارے میں پوچھیں...",
    button: "بھیجیں",
    thinking: "سوچ رہا ہے...",
    welcome:
      "میں آپ کا واٹر مینجمنٹ اسسٹنٹ ہوں۔ میں صرف واٹر مینجمنٹ، مقامات، اور اس ایپ یا چیٹ میں موجود ڈیٹا سے متعلق سوالات میں مدد کر سکتا ہوں۔",
    suggestions: [
      "گرمی کے موسم میں شہر کے واٹر ڈسٹری بیوشن نیٹ ورک کے اہم خطرات بتائیں۔",
      "ریزروائر، پمپ اور لیکیج مینجمنٹ کے لیے روزانہ کون سا ڈیٹا ٹریک کرنا چاہیے؟",
      "ڈسٹری بیوشن پریشر اچانک کم ہونے پر ایک رسپانس چیک لسٹ بنائیں۔",
      "واٹر کوالٹی، اوورفلو اور پمپ ڈاؤن ٹائم الرٹس کو کیسے ترجیح دی جائے؟",
    ],
  },
};

type ChatBoxProps = {
  variant?: "page" | "widget";
  showHeader?: boolean;
};

export function ChatBox({
  variant = "page",
  showHeader = true,
}: ChatBoxProps) {
  const [language, setLanguage] = useState<ChatLanguage>("en");
  const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  const [input, setInput] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement | null>(null);
  const selectedLanguage = languageOptions.find(
    (option) => option.code === language,
  ) ?? languageOptions[0];
  const copy = contentByLanguage[language];

  const hasOnlyWelcomeMessage = useMemo(
    () => messages.length === 1 && messages[0]?.id === "welcome",
    [messages],
  );

  useEffect(() => {
    const container = scrollContainerRef.current;

    if (!container) {
      return;
    }

    container.scrollTo({
      top: container.scrollHeight,
      behavior: "smooth",
    });
  }, [messages]);

  useEffect(() => {
    setMessages([
      {
        id: "welcome",
        role: "assistant",
        content: copy.welcome,
      },
    ]);
    setInput("");
  }, [copy.welcome]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const trimmed = input.trim();

    if (!trimmed) {
      return;
    }

    const nextMessages = [
      ...messages,
      { id: crypto.randomUUID(), role: "user" as const, content: trimmed },
    ];
    const loadingMessage: ChatMessage = {
      id: "assistant-pending",
      role: "assistant",
      content: "",
      pending: true,
    };

    setMessages([...nextMessages, loadingMessage]);
    setInput("");
    setIsSubmitting(true);

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          message: trimmed,
          language,
          messages: nextMessages.map<ChatApiMessage>((message) => ({
            role: message.role,
            content: message.content,
          })),
        }),
      });

      const data = (await response.json()) as {
        error?: string;
        message?: string;
      };

      if (!response.ok) {
        throw new Error(data.error || "The chat request failed.");
      }

      setMessages([
        ...nextMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: data.message ?? "Mock response unavailable.",
        },
      ]);
    } catch (error) {
      setMessages([
        ...nextMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            error instanceof Error
              ? error.message
              : "Something went wrong reaching the chat API.",
        },
      ]);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div
      className={cn(
        "flex flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-card",
        variant === "page" ? "h-[70vh]" : "h-[32rem]",
      )}
    >
      {showHeader ? (
        <div className="border-b border-border bg-slate-50/70 px-6 py-4">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div>
              <p className="text-sm font-medium text-foreground">{copy.title}</p>
              <p className="mt-1 text-sm text-muted">{copy.description}</p>
            </div>
            <label className="flex items-center gap-2 text-sm text-muted">
              <span>Language</span>
              <select
                value={language}
                onChange={(event) =>
                  setLanguage(event.target.value as ChatLanguage)
                }
                className="rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground"
              >
                {languageOptions.map((option) => (
                  <option key={option.code} value={option.code}>
                    {option.nativeLabel}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>
      ) : null}
      {!showHeader ? (
        <div className="border-b border-border bg-slate-50/70 px-4 py-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-foreground">{copy.title}</p>
              <p className="mt-1 text-xs text-muted">{copy.description}</p>
            </div>
            <select
              value={language}
              onChange={(event) => setLanguage(event.target.value as ChatLanguage)}
              className="rounded-md border border-border bg-white px-2.5 py-2 text-sm text-foreground"
            >
              {languageOptions.map((option) => (
                <option key={option.code} value={option.code}>
                  {option.nativeLabel}
                </option>
              ))}
            </select>
          </div>
        </div>
      ) : null}
      <div
        ref={scrollContainerRef}
        dir={selectedLanguage.dir}
        className={cn(
          "flex-1 space-y-4 overflow-y-auto bg-[radial-gradient(circle_at_top,_rgba(226,232,240,0.55),_transparent_45%)]",
          variant === "page" ? "p-6" : "p-4",
        )}
      >
        {messages.map((message) => (
          <Message key={message.id} message={message} />
        ))}

        {hasOnlyWelcomeMessage ? (
          <div className="grid gap-3 pt-2 md:grid-cols-2">
            {copy.suggestions.map((prompt) => (
              <button
                key={prompt}
                type="button"
                onClick={() => setInput(prompt)}
                className="rounded-2xl border border-border bg-slate-50 px-4 py-3 text-left text-sm text-muted transition duration-200 hover:-translate-y-0.5 hover:border-slate-300 hover:bg-white hover:text-foreground"
              >
                {prompt}
              </button>
            ))}
          </div>
        ) : null}
      </div>
      <form
        onSubmit={handleSubmit}
        className={cn(
          "flex items-center gap-3 border-t border-border",
          variant === "page" ? "p-4" : "p-3",
        )}
      >
        <Input
          value={input}
          onChange={(event) => setInput(event.target.value)}
          placeholder={copy.placeholder}
          disabled={isSubmitting}
          dir={selectedLanguage.dir}
        />
        <Button
          type="submit"
          disabled={isSubmitting}
          className={cn(variant === "widget" && "px-3")}
        >
          {isSubmitting ? copy.thinking : copy.button}
        </Button>
      </form>
    </div>
  );
}
