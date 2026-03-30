"use client";

import * as React from "react";
import { Slot } from "radix-ui";

import { cn } from "@/lib/utils";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";

import "./sidebar-theme.css";

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
export type SidebarVariant = "default" | "floating" | "inset";
export type SidebarSide = "left" | "right";
export type SidebarState = "expanded" | "collapsed";

interface SidebarContextValue {
  state: SidebarState;
  open: boolean;
  setOpen: (open: boolean) => void;
  openMobile: boolean;
  setOpenMobile: (open: boolean) => void;
  isMobile: boolean;
  toggleSidebar: () => void;
  themeDark: boolean;
  setThemeDark: (v: boolean) => void;
}

// ─────────────────────────────────────────────
// Context
// ─────────────────────────────────────────────
const SidebarContext = React.createContext<SidebarContextValue | null>(null);

export function useSidebar(): SidebarContextValue {
  const ctx = React.useContext(SidebarContext);
  if (!ctx) {
    throw new Error("useSidebar must be used within a <SidebarProvider>");
  }
  return ctx;
}

// ─────────────────────────────────────────────
// Provider
// ─────────────────────────────────────────────
interface SidebarProviderProps {
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}

const MOBILE_BREAKPOINT = 768;
export const SIDEBAR_COOKIE_NAME = "sidebar:state";
const SIDEBAR_COOKIE_MAX_AGE = 60 * 60 * 24 * 7;

export function SidebarProvider({
  children,
  defaultOpen = true,
  open: openProp,
  onOpenChange: setOpenProp,
}: SidebarProviderProps) {
  const [isMobile, setIsMobile] = React.useState(false);
  const [openMobile, setOpenMobile] = React.useState(false);
  const [_open, _setOpen] = React.useState(defaultOpen);
  const [themeDark, setThemeDark] = React.useState(false);

  const open = openProp ?? _open;
  const setOpen = React.useCallback(
    (value: boolean) => {
      if (setOpenProp) {
        setOpenProp(value);
      } else {
        _setOpen(value);
      }
      document.cookie = `${SIDEBAR_COOKIE_NAME}=${value}; path=/; max-age=${SIDEBAR_COOKIE_MAX_AGE}`;
    },
    [setOpenProp],
  );

  const toggleSidebar = React.useCallback(() => {
    if (isMobile) {
      setOpenMobile((v) => !v);
    } else {
      setOpen(!open);
    }
  }, [isMobile, open, setOpen]);

  React.useEffect(() => {
    const mql = window.matchMedia(`(max-width: ${MOBILE_BREAKPOINT - 1}px)`);
    const onChange = () => setIsMobile(mql.matches);
    mql.addEventListener("change", onChange);
    setIsMobile(mql.matches);
    return () => mql.removeEventListener("change", onChange);
  }, []);

  React.useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === "b" && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        toggleSidebar();
      }
    };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [toggleSidebar]);

  const state: SidebarState = open ? "expanded" : "collapsed";

  const value: SidebarContextValue = {
    state,
    open,
    setOpen,
    openMobile,
    setOpenMobile,
    isMobile,
    toggleSidebar,
    themeDark,
    setThemeDark,
  };

  return (
    <SidebarContext.Provider value={value}>
      <div
        style={
          {
            "--sidebar-width": "16rem",
            "--sidebar-width-collapsed": "3.5rem",
          } as React.CSSProperties
        }
        data-sidebar-state={state}
        className={cn(
          "dashboard-app-shell ds-app-shell group/sidebar-wrapper min-h-svh w-full",
          themeDark && "ds-theme-dark",
        )}
      >
        {children}
      </div>
    </SidebarContext.Provider>
  );
}

// ─────────────────────────────────────────────
// Sidebar shell
// ─────────────────────────────────────────────
function SidebarDesktopFrame({
  className,
  collapsed,
  children,
}: {
  className?: string;
  collapsed: boolean;
  children: React.ReactNode;
}) {
  return (
    <aside
      className={cn(
        "ds-sidebar",
        collapsed && "ds-sidebar-collapsed",
        className,
      )}
    >
      {children}
    </aside>
  );
}

export function Sidebar({
  children,
  className,
  collapsible: _collapsible,
  variant: _variant,
  side = "left",
  ...props
}: React.ComponentProps<"aside"> & {
  side?: SidebarSide;
  variant?: SidebarVariant;
  collapsible?: "offcanvas" | "icon" | "none";
}) {
  const { isMobile, open, openMobile, setOpenMobile } = useSidebar();
  const collapsed = !open;

  if (isMobile) {
    return (
      <Sheet open={openMobile} onOpenChange={setOpenMobile}>
        <SheetContent
          data-sidebar="sidebar"
          side={side === "right" ? "right" : "left"}
          showCloseButton
          className={cn(
            "dashboard-app-shell flex h-full max-h-[100dvh] min-h-0 w-[min(100vw,260px)] flex-col border-r p-0",
            "bg-[var(--ds-sidebar-bg)] text-[var(--ds-sidebar-fg)]",
            className,
          )}
        >
          <SheetHeader className="sr-only">
            <SheetTitle>Navigation</SheetTitle>
            <SheetDescription>Main menu</SheetDescription>
          </SheetHeader>
          <SidebarDesktopFrame collapsed={false} className="min-h-0 flex-1">
            {children}
          </SidebarDesktopFrame>
        </SheetContent>
      </Sheet>
    );
  }

  return (
    <SidebarDesktopFrame collapsed={collapsed} className={className} {...props}>
      {children}
    </SidebarDesktopFrame>
  );
}

export function SidebarRail({
  className,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar } = useSidebar();
  return (
    <button
      type="button"
      aria-label="Toggle sidebar"
      title="Toggle sidebar (⌘B)"
      className={cn("ds-sidebar-rail", className)}
      onClick={toggleSidebar}
      {...props}
    />
  );
}

export function SidebarInset({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="sidebar-inset"
      className={cn("ds-main-content", className)}
      {...props}
    />
  );
}

function TriggerIconExpanded() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="1.5"
        y="1.5"
        width="13"
        height="13"
        rx="2"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="5.5"
        y1="1.5"
        x2="5.5"
        y2="14.5"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      <line
        x1="8"
        y1="6"
        x2="12"
        y2="6"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="8"
        y1="9"
        x2="12"
        y2="9"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

function TriggerIconCollapsed() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <line
        x1="2"
        y1="4"
        x2="14"
        y2="4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="8"
        x2="14"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <line
        x1="2"
        y1="12"
        x2="14"
        y2="12"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function SidebarTrigger({
  className,
  onClick,
  ...props
}: React.ComponentProps<"button">) {
  const { toggleSidebar, open, openMobile, isMobile } = useSidebar();
  const expanded = isMobile ? openMobile : open;
  return (
    <button
      type="button"
      data-slot="sidebar-trigger"
      className={cn("ds-trigger-btn", className)}
      onClick={(e) => {
        onClick?.(e);
        toggleSidebar();
      }}
      title="Toggle sidebar (⌘B)"
      {...props}
    >
      {expanded ? <TriggerIconExpanded /> : <TriggerIconCollapsed />}
      <span className="sr-only">Toggle sidebar</span>
    </button>
  );
}

export function DashboardShellTopbar({
  title,
  className,
}: {
  title?: string;
  className?: string;
}) {
  const { toggleSidebar, themeDark, setThemeDark, open, openMobile, isMobile } =
    useSidebar();
  const expanded = isMobile ? openMobile : open;
  return (
    <header className={cn("ds-topbar", className)}>
      <div className="ds-topbar-inner">
        <button
          type="button"
          className="ds-trigger-btn"
          onClick={toggleSidebar}
          title="Toggle sidebar (⌘B)"
        >
          {expanded ? <TriggerIconExpanded /> : <TriggerIconCollapsed />}
          <span className="sr-only">Toggle sidebar</span>
        </button>
        {title ? <span className="ds-topbar-title">{title}</span> : null}
        <div className="ds-topbar-actions">
          <button
            type="button"
            className="ds-kbd-hint"
            onClick={toggleSidebar}
          >
            ⌘B
          </button>
          <button
            type="button"
            className="ds-theme-toggle"
            onClick={() => setThemeDark(!themeDark)}
          >
            {themeDark ? "☀️ Light" : "🌙 Dark"}
          </button>
        </div>
      </div>
      <div className="ds-topbar-gradient" aria-hidden />
    </header>
  );
}

// ─────────────────────────────────────────────
// Composition helpers (custom skin class names)
// ─────────────────────────────────────────────

export function SidebarHeader({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("ds-sidebar-header", className)} {...props} />;
}

export function SidebarContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("ds-sidebar-content", className)} {...props} />;
}

export function SidebarFooter({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("ds-sidebar-footer", className)} {...props} />;
}

export function SidebarGroup({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("ds-sidebar-group", className)} {...props} />;
}

export function SidebarGroupLabel({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("ds-group-label", className)} {...props} />;
}

export function SidebarGroupContent({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("w-full", className)} {...props} />;
}

export function SidebarSeparator({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return <div className={cn("ds-sidebar-sep", className)} {...props} />;
}

export function SidebarMenu({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return <ul className={cn("ds-sidebar-menu", className)} {...props} />;
}

export function SidebarMenuItem({
  className,
  ...props
}: React.ComponentProps<"li">) {
  return (
    <li className={cn("ds-menu-item ds-tooltip-wrap", className)} {...props} />
  );
}

export function SidebarMenuButton({
  asChild = false,
  isActive = false,
  tooltip,
  className,
  children,
  ...props
}: React.ComponentProps<"button"> & {
  asChild?: boolean;
  isActive?: boolean;
  tooltip?: string;
}) {
  const Comp = asChild ? Slot.Root : "button";
  const content = (
    <Comp
      data-active={isActive}
      className={cn("ds-menu-btn", isActive && "ds-active", className)}
      {...props}
    >
      {children}
    </Comp>
  );

  if (!tooltip) {
    return content;
  }

  return (
    <>
      {content}
      <span className="ds-tooltip-text">{tooltip}</span>
    </>
  );
}

export function SidebarMenuBadge({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return <span className={cn("ds-menu-badge", className)} {...props} />;
}

// Stubs for older shadcn-style imports (kept minimal)
export function SidebarInput(
  _props: React.ComponentProps<"input">,
): React.ReactNode {
  return null;
}

export function SidebarMenuAction(
  _props: Record<string, unknown>,
): React.ReactNode {
  return null;
}

export function SidebarMenuSkeleton(
  _props: Record<string, unknown>,
): React.ReactNode {
  return null;
}

export function SidebarMenuSub(
  _props: React.ComponentProps<"ul">,
): React.ReactNode {
  return null;
}

export function SidebarMenuSubItem(
  _props: React.ComponentProps<"li">,
): React.ReactNode {
  return null;
}

export function SidebarMenuSubButton(
  _props: Record<string, unknown>,
): React.ReactNode {
  return null;
}
