"use client";

import type { ReactNode } from "react";
import { Suspense } from "react";
import {
  DashboardShellTopbar,
  SidebarInset,
  SidebarProvider,
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
        <Suspense fallback={null}>
          <AppSidebar />
        </Suspense>
        <SidebarInset className="flex min-h-svh max-h-svh flex-col overflow-hidden">
          <DashboardShellTopbar />
          <div className="ds-page-body flex min-h-0 flex-1 flex-col">
            <div className="mx-auto w-full max-w-6xl flex-1 px-6 py-8">{children}</div>
          </div>
        </SidebarInset>
      </SidebarProvider>
    </TooltipProvider>
  );
}
