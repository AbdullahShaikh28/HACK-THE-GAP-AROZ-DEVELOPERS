"use client";

/**
 * Sidebar header branding / “store” slot (shadcn-style).
 * Replace with a real team/store switcher when you have multiple tenants.
 */
export function StoreMenu() {
  return (
    <div className="flex items-center gap-2 px-2 py-1.5">
      <div className="flex size-8 shrink-0 items-center justify-center rounded-md border border-sidebar-border bg-sidebar-accent text-xs font-bold text-sidebar-accent-foreground">
        CEI
      </div>
      <div className="grid min-w-0 flex-1 text-left text-sm leading-tight">
        <span className="truncate font-semibold text-sidebar-foreground">Water Supply</span>
        <span className="truncate text-xs text-sidebar-foreground/70">Chhatrapati Sambhajinagar</span>
      </div>
    </div>
  );
}
