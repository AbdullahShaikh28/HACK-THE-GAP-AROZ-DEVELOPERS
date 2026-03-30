"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import * as React from "react";
import { createClient } from "@/lib/supabase/client";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuBadge,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  SidebarSeparator,
} from "@/components/ui/sidebar";
import { SignOutButton } from "@/components/SignOutButton";

function initialsFromEmail(email: string | undefined) {
  if (!email) return "?";
  const local = email.split("@")[0] ?? "";
  const parts = local.split(/[.\s_-]+/).filter(Boolean);
  if (parts.length >= 2) {
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase() || "?";
}

function useSidebarUser() {
  const [email, setEmail] = React.useState<string | null>(null);
  React.useEffect(() => {
    const supabase = createClient();
    void supabase.auth.getUser().then(({ data }) => {
      setEmail(data.user?.email ?? null);
    });
  }, []);
  return email;
}

function IconDashboard() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="1"
        y="1"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="9"
        y="1"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="1"
        y="9"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <rect
        x="9"
        y="9"
        width="6"
        height="6"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function IconTanks() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <ellipse
        cx="8"
        cy="4"
        rx="5"
        ry="2"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M3 4 L3 12 Q3 14 8 14 Q13 14 13 12 L13 4"
        stroke="currentColor"
        strokeWidth="1.4"
        fill="none"
      />
      <path
        d="M3 9 Q8 11 13 9"
        stroke="currentColor"
        strokeWidth="1"
        strokeDasharray="1.5 1.5"
      />
    </svg>
  );
}

function IconZoneContacts() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2"
        y="3"
        width="12"
        height="9"
        rx="1"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <path
        d="M5 6.5 L8 8.5 L11 6.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        strokeLinejoin="round"
        fill="none"
      />
      <circle cx="8" cy="5" r="0.9" fill="currentColor" />
    </svg>
  );
}

function IconSurvey() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <rect
        x="2.5"
        y="2"
        width="11"
        height="12"
        rx="1.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line x1="5" y1="5.5" x2="11" y2="5.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="8" x2="11" y2="8" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
      <line x1="5" y1="10.5" x2="9" y2="10.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
    </svg>
  );
}

function IconMap() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M5.5 2 L1 4.5 L1 14 L5.5 11.5 L10.5 14 L15 11.5 L15 2 L10.5 4.5 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="5.5"
        y1="2"
        x2="5.5"
        y2="11.5"
        stroke="currentColor"
        strokeWidth="1.4"
      />
      <line
        x1="10.5"
        y1="4.5"
        x2="10.5"
        y2="14"
        stroke="currentColor"
        strokeWidth="1.4"
      />
    </svg>
  );
}

function IconAnalytics() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <polyline
        points="1,12 5,7 8,10 11,5 15,3"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinejoin="round"
        strokeLinecap="round"
        fill="none"
      />
      <circle cx="5" cy="7" r="1.5" fill="currentColor" />
      <circle cx="8" cy="10" r="1.5" fill="currentColor" />
      <circle cx="11" cy="5" r="1.5" fill="currentColor" />
    </svg>
  );
}

function IconAlerts() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M8 1 L15 14 L1 14 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="8"
        y1="6"
        x2="8"
        y2="10"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      <circle cx="8" cy="12" r="0.8" fill="currentColor" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="6" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M1 14 Q1 10 6 10 Q11 10 11 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
      <path
        d="M12 7 Q13.5 7 13.5 5.5 Q13.5 4 12 4"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
      <path
        d="M12 10 Q15 10 15 14"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
        fill="none"
      />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <circle cx="8" cy="8" r="2.5" stroke="currentColor" strokeWidth="1.4" />
      <path
        d="M8 1 L8 3 M8 13 L8 15 M1 8 L3 8 M13 8 L15 8 M2.93 2.93 L4.34 4.34 M11.66 11.66 L13.07 13.07 M2.93 13.07 L4.34 11.66 M11.66 4.34 L13.07 2.93"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinecap="round"
      />
    </svg>
  );
}

function IconDocs() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
      <path
        d="M3 2 L3 14 L13 14 L13 5 L10 2 Z"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
      <path
        d="M10 2 L10 5 L13 5"
        stroke="currentColor"
        strokeWidth="1.4"
        strokeLinejoin="round"
        fill="none"
      />
      <line
        x1="5.5"
        y1="8"
        x2="10.5"
        y2="8"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
      <line
        x1="5.5"
        y1="10.5"
        x2="10.5"
        y2="10.5"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
      />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg className="ds-chevron" viewBox="0 0 12 12" fill="none" aria-hidden>
      <path
        d="M2 4 L6 8 L10 4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

function IconMore() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" aria-hidden>
      <circle cx="7" cy="3" r="1" fill="currentColor" />
      <circle cx="7" cy="7" r="1" fill="currentColor" />
      <circle cx="7" cy="11" r="1" fill="currentColor" />
    </svg>
  );
}

/** Shows total complaints for the user’s assigned tank (sidebar badge). */
function ComplaintsCountBadge() {
  const [count, setCount] = React.useState<number | null>(null);

  React.useEffect(() => {
    const supabase = createClient();
    void (async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) {
        setCount(0);
        return;
      }
      const { data: profile } = await supabase
        .from("profiles")
        .select("tank_id")
        .eq("id", user.id)
        .single();
      const tankId = (profile as { tank_id: number | null } | null)?.tank_id;
      if (!tankId) {
        setCount(0);
        return;
      }
      const { count: n, error } = await supabase
        .from("complaints")
        .select("*", { count: "exact", head: true })
        .eq("tank_id", tankId);
      if (error) {
        setCount(0);
        return;
      }
      setCount(n ?? 0);
    })();
  }, []);

  if (count === null || count === 0) return null;

  return (
    <SidebarMenuBadge
      style={{
        background: "rgba(239,68,68,0.12)",
        color: "#ef4444",
      }}
    >
      {count > 99 ? "99+" : count}
    </SidebarMenuBadge>
  );
}

export function AppSidebar() {
  const pathname = usePathname();
  const email = useSidebarUser();
  const [analyticsOpen, setAnalyticsOpen] = React.useState(
    () =>
      pathname.startsWith("/dashboard/analytics"),
  );

  React.useEffect(() => {
    if (pathname.startsWith("/dashboard/analytics")) {
      setAnalyticsOpen(true);
    }
  }, [pathname]);

  const dashboardActive = pathname === "/dashboard";
  const assignedTankActive =
    pathname === "/dashboard/assigned-tank" ||
    pathname.startsWith("/dashboard/assigned-tank/");
  const mapActive =
    pathname === "/dashboard/map" || pathname.startsWith("/dashboard/map/");
  const complaintsActive =
    pathname === "/dashboard/complaints" ||
    pathname.startsWith("/dashboard/complaints/");
  const zoneContactsActive =
    pathname === "/dashboard/zone-contacts" ||
    pathname.startsWith("/dashboard/zone-contacts/");
  const surveyActive =
    pathname === "/dashboard/survey" || pathname.startsWith("/dashboard/survey/");
  const analyticsActive =
    pathname === "/dashboard/analytics" ||
    pathname.startsWith("/dashboard/analytics/");

  return (
    <Sidebar collapsible="icon" variant="default">
      <SidebarHeader>
        <div className="ds-brand">
          <div className="ds-brand-logo-wrap">
            <Image
              src="/csmc-logo.jpeg"
              alt="Chhatrapati Sambhajinagar Corporation logo"
              fill
              className="object-contain p-0.5"
              sizes="52px"
              priority
            />
          </div>
          <div className="ds-brand-text">
            <div className="ds-brand-name">
              Chhatrapati Sambhajinagar Corporation
            </div>
            <div className="ds-brand-sub">Chhatrapati Sambhajinagar Smart City</div>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Navigation</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={dashboardActive}
                  tooltip="Dashboard"
                >
                  <Link href="/dashboard">
                    <span className="ds-menu-icon">
                      <IconDashboard />
                    </span>
                    <span className="ds-menu-label">Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={assignedTankActive}
                  tooltip="Assigned Tank"
                >
                  <Link href="/dashboard/assigned-tank">
                    <span className="ds-menu-icon">
                      <IconTanks />
                    </span>
                    <span className="ds-menu-label">Assigned Tank</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={zoneContactsActive}
                  tooltip="Zone contacts"
                >
                  <Link href="/dashboard/zone-contacts">
                    <span className="ds-menu-icon">
                      <IconZoneContacts />
                    </span>
                    <span className="ds-menu-label">Zone contacts</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton
                  asChild
                  isActive={surveyActive}
                  tooltip="Survey"
                >
                  <Link href="/dashboard/survey">
                    <span className="ds-menu-icon">
                      <IconSurvey />
                    </span>
                    <span className="ds-menu-label">Survey</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={mapActive} tooltip="Map View">
                  <Link href="/dashboard/map">
                    <span className="ds-menu-icon">
                      <IconMap />
                    </span>
                    <span className="ds-menu-label">Map View</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>

              <SidebarMenuItem
                className={analyticsOpen ? "ds-sub-open" : undefined}
              >
                <SidebarMenuButton
                  type="button"
                  isActive={analyticsActive}
                  tooltip="Analytics"
                  onClick={() => setAnalyticsOpen((o) => !o)}
                >
                  <span className="ds-menu-icon">
                    <IconAnalytics />
                  </span>
                  <span className="ds-menu-label">Analytics</span>
                  <ChevronDown />
                </SidebarMenuButton>
                <div
                  className={cnSubMenu(analyticsOpen)}
                >
                  <ul className="ds-sub-list">
                    <li>
                      <Link
                        href="/dashboard/analytics"
                        className={cnSubBtn(pathname === "/dashboard/analytics")}
                      >
                        Capacity Trends
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/analytics"
                        className={cnSubBtn(false)}
                      >
                        Ward Coverage
                      </Link>
                    </li>
                    <li>
                      <Link
                        href="/dashboard/analytics"
                        className={cnSubBtn(false)}
                      >
                        ESR vs GSR
                      </Link>
                    </li>
                  </ul>
                </div>
              </SidebarMenuItem>

              <SidebarMenuItem>
                  <SidebarMenuButton
                    asChild
                  isActive={complaintsActive}
                  tooltip="Complaints"
                >
                  <Link href="/dashboard/complaints">
                    <span className="ds-menu-icon">
                      <IconAlerts />
                    </span>
                    <span className="ds-menu-label">Complaints</span>
                    <ComplaintsCountBadge />
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        <SidebarGroup>
          <SidebarGroupLabel>System</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  tooltip="Users"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="ds-menu-icon">
                    <IconUsers />
                  </span>
                  <span className="ds-menu-label">Users</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  tooltip="Settings"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="ds-menu-icon">
                    <IconSettings />
                  </span>
                  <span className="ds-menu-label">Settings</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
              <SidebarMenuItem>
                <SidebarMenuButton
                  type="button"
                  tooltip="Docs"
                  onClick={(e) => e.preventDefault()}
                >
                  <span className="ds-menu-icon">
                    <IconDocs />
                  </span>
                  <span className="ds-menu-label">Docs</span>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        <div className="flex flex-col gap-1">
          <button type="button" className="ds-user-btn">
            <div className="ds-avatar">{initialsFromEmail(email ?? undefined)}</div>
            <div className="ds-user-info">
              <div className="ds-user-name">Account</div>
              <div className="ds-user-email">
                {email ?? "Loading…"}
              </div>
            </div>
            <div className="ds-user-more">
              <IconMore />
            </div>
          </button>
          <SignOutButton className="ds-user-btn !cursor-pointer justify-center text-[12.5px] font-semibold text-[var(--ds-sidebar-muted)] hover:text-[var(--ds-sidebar-fg)]" />
        </div>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}

function cnSubMenu(open: boolean) {
  return ["ds-sub-menu", open && "ds-open"].filter(Boolean).join(" ");
}

function cnSubBtn(active: boolean) {
  return ["ds-sub-btn", active && "ds-active"].filter(Boolean).join(" ");
}
