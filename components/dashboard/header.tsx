"use client";

import { SidebarTrigger } from "@/components/ui/sidebar";

type HeaderProps = {
  title?: string;
};

export function Header({ title = "Dashboard" }: HeaderProps) {
  return (
    <header className="flex h-14 items-center gap-2 border-b border-border bg-background px-4">
      <SidebarTrigger className="-ml-1" />
      <h1 className="text-sm font-semibold">{title}</h1>
    </header>
  );
}
