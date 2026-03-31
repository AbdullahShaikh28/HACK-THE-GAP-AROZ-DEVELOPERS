"use client";

import { useId, useState } from "react";
import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";
import { Menu, X } from "lucide-react";

type FrontendHeaderProps = {
  active?: "home" | "chat" | "tanks" | "scheduled" | "complaints" | "supply_report";
};

const NAV_KEYS = ["home", "chat", "tanks", "scheduled", "complaints", "supply_report"] as const;
type NavKey = (typeof NAV_KEYS)[number];

const NAV_HREF: Record<NavKey, Route> = {
  home: "/",
  chat: "/chat",
  tanks: "/tanks",
  scheduled: "/tanks?tab=scheduled",
  complaints: "/complaints",
  supply_report: "/supply-report",
};

const NAV_LABEL: Record<NavKey, string> = {
  home: "Home",
  chat: "Chat",
  tanks: "Tanks",
  scheduled: "Scheduled",
  complaints: "Complaint",
  supply_report: "Supply report",
};

export function FrontendHeader({ active }: FrontendHeaderProps) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const menuId = useId();

  const linkClass = (key: NavKey, inDrawer = false) =>
    [
      inDrawer
        ? "block w-full rounded-md px-4 py-3 text-base font-semibold tracking-[0.3px] transition"
        : "inline-flex shrink-0 items-center justify-center whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] font-semibold leading-none tracking-[0.2px] transition sm:px-3 sm:text-sm",
      inDrawer
        ? active === key
          ? "bg-[#e8610a] text-white"
          : "text-white/80 hover:bg-white/10 hover:text-white"
        : active === key
          ? "text-white shadow-[inset_0_-2px_0_0_#e8610a] hover:text-white"
          : "text-white/85 hover:bg-white/10 hover:text-white",
    ].join(" ");

  return (
    <>
      <div className="flex items-center justify-between gap-2 bg-[#e8610a] px-3 py-2.5 text-[10px] font-semibold tracking-[0.4px] text-white sm:py-1.5 sm:gap-3 sm:px-8 sm:text-xs">
        <span className="shrink-0">Updates</span>
        <div className="min-w-0 flex-1 overflow-hidden px-1 sm:px-4">
          <p className="truncate text-center text-white/90 sm:whitespace-nowrap">
            महानगरपालिका औरंगाबाद | 39 tanks active across 22 wards | Total capacity 756 LL across
            the distribution network
          </p>
        </div>
        <span className="shrink-0">मराठी</span>
      </div>

      <div className="w-full border-b border-black/5 bg-white">
        <Image
          src="/images/main_logo.jpg"
          alt="Aurangabad Smart City"
          width={1352}
          height={110}
          className="block h-auto max-h-[48vw] w-full object-cover object-center sm:max-h-none sm:object-contain"
          priority
          sizes="100vw"
        />
      </div>

      <header className="sticky top-0 z-40 bg-[#1a3a6e] text-white shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between gap-3 px-4 py-4 sm:gap-5 sm:px-6 sm:py-3 md:h-[152px] md:py-0">
          <div className="flex min-w-0 items-center gap-2.5 sm:gap-3.5">
            <div className="relative h-[4.5rem] w-[5rem] shrink-0 overflow-hidden sm:h-20 sm:w-24 md:h-[130px] md:w-[152px]">
              <Image
                src="/csmc-logo.jpeg"
                alt="Chhatrapati Sambhajinagar Corporation logo"
                fill
                className="object-contain p-0.5 sm:p-1"
                priority
              />
            </div>

            <div className="min-w-0 border-l-2 border-white/20 pl-2 sm:pl-3.5">
              <p className="text-[12px] font-extrabold leading-[1.25] tracking-[0.5px] sm:text-[13px] md:text-[15px]">
                Chhatrapati Sambhajinagar Corporation
              </p>
              <p className="hidden text-[9px] uppercase tracking-[0.8px] text-white/65 sm:block sm:text-[10.5px]">
                Chhatrapati Sambhajinagar Smart City
              </p>
            </div>
          </div>

          <div className="hidden shrink-0 items-center gap-2 md:flex md:pl-2 lg:pl-4">
            <nav
              className="flex flex-nowrap items-center gap-0.5 sm:gap-1"
              aria-label="Main"
            >
              {NAV_KEYS.map((key) => (
                <Link key={key} href={NAV_HREF[key]} className={linkClass(key, false)}>
                  {NAV_LABEL[key]}
                </Link>
              ))}
            </nav>
            <div className="flex shrink-0 flex-nowrap items-center gap-1 border-l border-white/20 pl-2 sm:gap-1.5 sm:pl-3">
              <Link
                href="/login"
                className="inline-flex whitespace-nowrap rounded-md px-2.5 py-2 text-[13px] font-semibold leading-none tracking-[0.2px] text-white/90 transition hover:bg-white/10 hover:text-white sm:px-3 sm:text-sm"
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="inline-flex whitespace-nowrap rounded-md border border-white/30 bg-white/5 px-2.5 py-2 text-[13px] font-semibold leading-none tracking-[0.2px] text-white transition hover:border-white/45 hover:bg-white/10 sm:px-3 sm:text-sm"
              >
                Sign up
              </Link>
            </div>
          </div>

          <button
            type="button"
            className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md border border-white/25 text-white md:hidden"
            aria-expanded={mobileOpen}
            aria-controls={menuId}
            aria-label={mobileOpen ? "Close menu" : "Open menu"}
            onClick={() => setMobileOpen((o) => !o)}
          >
            {mobileOpen ? <X className="h-6 w-6" aria-hidden /> : <Menu className="h-6 w-6" aria-hidden />}
          </button>
        </div>

        <div
          id={menuId}
          className={`border-t border-white/15 bg-[#152f56] md:hidden ${mobileOpen ? "block" : "hidden"}`}
        >
          <nav className="mx-auto flex max-w-[1280px] flex-col px-2 py-2" aria-label="Mobile main">
            {NAV_KEYS.map((key) => (
              <Link
                key={key}
                href={NAV_HREF[key]}
                className={linkClass(key, true)}
                onClick={() => setMobileOpen(false)}
              >
                {NAV_LABEL[key]}
              </Link>
            ))}
            <div className="mt-2 flex flex-col gap-2 border-t border-white/10 px-2 pb-2 pt-3">
              <Link
                href="/login"
                className="rounded-md px-4 py-3 text-center text-base font-semibold text-white/90 hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                Login
              </Link>
              <Link
                href="/signup"
                className="rounded-md border border-white/25 px-4 py-3 text-center text-base font-semibold text-white hover:bg-white/10"
                onClick={() => setMobileOpen(false)}
              >
                Sign up
              </Link>
            </div>
          </nav>
        </div>

        <div className="h-1 bg-[linear-gradient(90deg,#e8610a_0%,#f5a623_50%,#f47c2e_100%)]" />
      </header>
    </>
  );
}
