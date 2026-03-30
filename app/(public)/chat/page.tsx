import { ChatBox } from "@/components/ChatBox";
import { FrontendHeader } from "@/components/FrontendHeader";

export default function ChatPage() {
  return (
    <main className="min-h-screen bg-[#f2f5f9] text-[#1a2535]">
      <FrontendHeader active="chat" />
      <div className="mx-auto flex w-full max-w-[1280px] flex-col gap-8 px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-[#1a2535]">
            Water Management Chat
          </h1>
          <p className="text-sm text-[#6b7a94]">
            Frontend assistant for water operations, tank coverage, ward-level
            questions, and app data help.
          </p>
        </div>
        <ChatBox />
      </div>
    </main>
  );
}
