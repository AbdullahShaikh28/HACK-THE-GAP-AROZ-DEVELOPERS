"use client";

import Link from "next/link";
import type { Route } from "next";
import { usePathname } from "next/navigation";
import { SignOutButton } from "@/components/SignOutButton";
import { cn } from "@/utils/helpers";

const navigationItems: Array<{
  href: Route;
  label: string;
  description: string;
}> = [
  { href: "/dashboard", label: "Dashboard", description: "Overview" },
  { href: "/dashboard/analytics", label: "Analytics", description: "Insights" },
  { href: "/dashboard/alerts", label: "Alerts", description: "Monitoring" },
  { href: "/dashboard/profile", label: "Profile", description: "Account" },
];

export function ProtectedSidebar() {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-full flex-col border-r border-border bg-white">
      <div className="border-b border-border px-5 py-5">
        <Link href="/dashboard" className="block">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted">
            Control Center
          </p>
          <h2 className="mt-2 text-xl font-semibold text-foreground">
            Water Ops
          </h2>
        </Link>
      </div>

      <div className="flex-1 px-4 py-5">
        <p className="px-2 text-xs font-semibold uppercase tracking-[0.18em] text-muted">
          Workspace
        </p>
        <nav className="mt-3 space-y-1">
          {navigationItems.map((item) => {
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block rounded-xl px-3 py-3 transition",
                  isActive
                    ? "bg-slate-900 text-white shadow-card"
                    : "text-foreground hover:bg-slate-100",
                )}
              >
                <p className="text-sm font-medium">{item.label}</p>
                <p
                  className={cn(
                    "mt-1 text-xs",
                    isActive ? "text-slate-300" : "text-muted",
                  )}
                >
                  {item.description}
                </p>
              </Link>
            );
          })}
        </nav>
      </div>

      <div className="border-t border-border px-4 py-5">
        <div className="rounded-2xl border border-border bg-slate-50 p-4">
          <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted">
            Session
          </p>
          <p className="mt-2 text-sm text-foreground">
            Signed-in dashboard workspace
          </p>
          <div className="mt-3">
            <SignOutButton className="w-full justify-center rounded-lg border border-border bg-white px-4 py-2 text-sm font-medium text-foreground hover:bg-slate-100" />
          </div>
        </div>
      </div>
    </aside>
  );
}
