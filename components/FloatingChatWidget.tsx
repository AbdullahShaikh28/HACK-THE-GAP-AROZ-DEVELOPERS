"use client";

import { useState } from "react";
import { ChatBox } from "@/components/ChatBox";
import { cn } from "@/utils/helpers";

export function FloatingChatWidget() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="fixed bottom-5 right-5 z-40">
      <div
        className={cn(
          "mb-3 w-[min(26rem,calc(100vw-1.5rem))] origin-bottom-right transition duration-300",
          isOpen
            ? "pointer-events-auto translate-y-0 scale-100 opacity-100"
            : "pointer-events-none translate-y-4 scale-95 opacity-0",
        )}
      >
        <div className="overflow-hidden rounded-[1.5rem] border border-border bg-white shadow-[0_24px_80px_rgba(15,23,42,0.22)]">
          <div className="flex items-center justify-between border-b border-border bg-slate-900 px-4 py-3 text-white">
            <div>
              <p className="text-sm font-semibold">Water Assistant</p>
              <p className="text-xs text-slate-300">
                Quick help across the app
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsOpen(false)}
              className="rounded-full border border-white/20 px-2.5 py-1 text-xs transition hover:bg-white/10"
            >
              Close
            </button>
          </div>
          <ChatBox variant="widget" showHeader={false} />
        </div>
      </div>

      <div className="flex justify-end">
        <button
          type="button"
          onClick={() => setIsOpen((current) => !current)}
          className="group relative inline-flex h-16 w-16 items-center justify-center rounded-full bg-primary text-sm font-semibold text-white shadow-[0_18px_50px_rgba(15,23,42,0.35)] transition duration-300 hover:-translate-y-1 hover:shadow-[0_24px_55px_rgba(15,23,42,0.38)]"
          aria-label={isOpen ? "Close water assistant" : "Open water assistant"}
        >
          <span className="absolute inset-0 rounded-full bg-white/10 opacity-0 transition group-hover:opacity-100" />
          <span className="relative flex flex-col items-center leading-none">
            <span className="text-[10px] uppercase tracking-[0.22em]">AI</span>
            <span className="mt-1 text-xs">Chat</span>
          </span>
          <span className="absolute -right-0.5 -top-0.5 h-4 w-4 rounded-full border-2 border-white bg-emerald-400" />
        </button>
      </div>
    </div>
  );
}
