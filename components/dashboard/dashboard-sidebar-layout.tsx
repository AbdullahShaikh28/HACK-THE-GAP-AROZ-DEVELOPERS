"use client";

import type { ReactNode } from "react";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppSidebar } from "@/components/dashboard/app-sidebar";

type DashboardSidebarLayoutProps = {
  children: ReactNode;
  defaultOpen: boolean;
};

export function DashboardSidebarLayout({
  children,
  defaultOpen,
}: DashboardSidebarLayoutProps) {
  return (
    <TooltipProvider delayDuration={0}>
      <SidebarProvider defaultOpen={defaultOpen}>
        <AppSidebar />
        <SidebarInset className="flex min-h-svh max-h-svh flex-col overflow-hidden bg-background">
          <header className="flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-4 md:hidden">
            <SidebarTrigger className="-ml-1" />
          </header>
          <div className="flex min-h-0 flex-1 flex-col overflow-y-auto">
            <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
