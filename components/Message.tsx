import type { ChatMessage } from "@/types";
import { cn } from "@/utils/helpers";

type MessageProps = {
  message: ChatMessage;
};

export function Message({ message }: MessageProps) {
  const isUser = message.role === "user";

  return (
    <div
      className={cn(
        "flex animate-message-in",
        isUser ? "justify-end" : "justify-start",
      )}
    >
      <div
        className={cn(
          "max-w-[80%] rounded-2xl px-4 py-3 text-sm shadow-sm",
          isUser
            ? "bg-primary text-white"
            : "border border-border bg-white text-foreground",
          message.pending && "min-w-24",
        )}
      >
        {message.pending ? (
          <div className="flex items-center gap-1.5 py-1">
            <span className="h-2 w-2 animate-chat-bounce rounded-full bg-slate-400 [animation-delay:-0.2s]" />
            <span className="h-2 w-2 animate-chat-bounce rounded-full bg-slate-400 [animation-delay:-0.1s]" />
            <span className="h-2 w-2 animate-chat-bounce rounded-full bg-slate-400" />
          </div>
        ) : (
          <p className="whitespace-pre-wrap leading-6">{message.content}</p>
        )}
      </div>
    </div>
  );
}
