import type { Metadata } from "next";
import { FloatingChatWidget } from "@/components/FloatingChatWidget";
import { TooltipProvider } from "@/components/ui/tooltip";
import "./globals.css";
import { Geist } from "next/font/google";
import { cn } from "@/lib/utils";

const geist = Geist({subsets:['latin'],variable:'--font-sans'});

export const metadata: Metadata = {
  title: "Next Supabase Starter",
  description: "Starter template with App Router and Supabase authentication.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("font-sans", geist.variable)}>
      <body>
        <TooltipProvider>
          {children}
          <FloatingChatWidget />
        </TooltipProvider>
      </body>
    </html>
  );
}
