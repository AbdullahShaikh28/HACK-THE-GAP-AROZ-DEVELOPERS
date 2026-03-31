"use client";

import Image from "next/image";
import type { Route } from "next";
import Link from "next/link";
import * as React from "react";
import { ArrowUp, ChevronDown, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const EXPLORE_LINKS: { href: Route; label: string }[] = [
  { href: "/", label: "Home" },
  { href: "/chat", label: "Chat" },
  { href: "/tanks", label: "Tanks" },
  { href: "/tanks?tab=scheduled" as Route, label: "Scheduled" },
  { href: "/complaints", label: "Complaints" },
  { href: "/supply-report", label: "Supply report" },
];

const ACCOUNT_LINKS: { href: Route; label: string }[] = [
  { href: "/login", label: "Login" },
  { href: "/signup", label: "Sign up" },
];

function FooterLink({ href, label }: { href: Route; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-2 rounded-lg px-2 py-1.5 -mx-2 text-sm text-white/80",
        "transition-all duration-200 motion-reduce:transition-none",
        "hover:bg-white/[0.08] hover:text-white hover:shadow-[inset_3px_0_0_0_#e8610a]",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8610a]/90 focus-visible:ring-offset-2 focus-visible:ring-offset-[#152f56]",
      )}
    >
      <span className="min-w-0 flex-1">{label}</span>
      <ChevronRight
        className="h-4 w-4 shrink-0 opacity-0 transition-all duration-200 motion-reduce:transition-none -translate-x-1 group-hover:translate-x-0 group-hover:opacity-100"
        aria-hidden
      />
    </Link>
  );
}

function FooterAccordionSection({
  id,
  title,
  children,
}: {
  id: string;
  title: string;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(false);

  return (
    <div className="border-b border-white/10 last:border-b-0 md:border-0">
      <button
        type="button"
        id={`${id}-trigger`}
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between gap-3 py-3 text-left md:hidden"
      >
        <span
          className="text-[11px] font-bold uppercase tracking-[0.14em] text-[#f5a623]"
          style={{ fontFamily: "var(--font-montserrat, ui-sans-serif)" }}
        >
          {title}
        </span>
        <ChevronDown
          className={cn(
            "h-5 w-5 shrink-0 text-white/70 transition-transform duration-200 motion-reduce:transition-none",
            open && "rotate-180",
          )}
          aria-hidden
        />
      </button>

      <p
        className="hidden text-[11px] font-bold uppercase tracking-[0.14em] text-[#f5a623] md:block"
        style={{ fontFamily: "var(--font-montserrat, ui-sans-serif)" }}
      >
        {title}
      </p>

      <div
        id={id}
        role="region"
        aria-label={title}
        className={cn("pb-4 pt-0 md:pb-0 md:pt-4", open ? "block" : "hidden", "md:block")}
      >
        {children}
      </div>
    </div>
  );
}

export function FrontendFooter() {
  const year = new Date().getFullYear();

  function scrollToTop() {
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  return (
    <footer className="mt-auto border-t border-white/10 bg-[#152f56] text-white">
      <div className="mx-auto max-w-[1280px] px-6 py-10 md:py-12">
        <div className="grid gap-6 md:grid-cols-[1fr_1fr_minmax(0,280px)] md:gap-10 md:items-start">
          <FooterAccordionSection id="footer-explore" title="Explore">
            <ul className="grid gap-1 sm:grid-cols-2 sm:gap-x-4">
              {EXPLORE_LINKS.map((item) => (
                <li key={item.href + item.label}>
                  <FooterLink href={item.href} label={item.label} />
                </li>
              ))}
            </ul>
          </FooterAccordionSection>

          <FooterAccordionSection id="footer-account" title="Account">
            <ul className="space-y-1">
              {ACCOUNT_LINKS.map((item) => (
                <li key={item.href}>
                  <FooterLink href={item.href} label={item.label} />
                </li>
              ))}
            </ul>
            <p className="mt-4 text-xs leading-relaxed text-white/55">
              Citizen services and tank directory are available without an account. Sign in for staff
              dashboard features.
            </p>
          </FooterAccordionSection>

          <div className="flex flex-col gap-6 pt-2 md:items-end md:pt-0">
            <Link
              href="/"
              className={cn(
                "group relative block h-20 w-[88px] shrink-0 rounded-xl outline-none transition-transform duration-300 motion-reduce:transition-none sm:h-24 sm:w-[104px]",
                "hover:scale-[1.04] focus-visible:ring-2 focus-visible:ring-[#e8610a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#152f56]",
              )}
              aria-label="Chhatrapati Sambhajinagar Corporation — Home"
            >
              <Image
                src="/csmc-logo.jpeg"
                alt=""
                fill
                className="object-contain opacity-90 transition-opacity duration-300 group-hover:opacity-100"
                sizes="104px"
              />
            </Link>
            <div className="text-left text-xs leading-snug text-white/70 md:text-right">
              <p className="font-semibold text-white/90">Chhatrapati Sambhajinagar Corporation</p>
              <p className="mt-1 text-[11px] uppercase tracking-wide text-white/55">
                Smart City · Water network portal
              </p>
            </div>
          </div>
        </div>

        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-6 sm:flex-row sm:gap-6">
          <p className="text-center text-[11px] text-white/50 sm:text-left">
            © {year} Chhatrapati Sambhajinagar Municipal Corporation. Public information services.
          </p>
          <button
            type="button"
            onClick={scrollToTop}
            className={cn(
              "inline-flex items-center gap-2 rounded-full border border-white/25 bg-white/[0.06] px-4 py-2 text-xs font-semibold text-white/90",
              "transition-all duration-200 motion-reduce:transition-none",
              "hover:border-[#e8610a]/60 hover:bg-[#e8610a]/20 hover:text-white",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#e8610a] focus-visible:ring-offset-2 focus-visible:ring-offset-[#152f56]",
              "active:scale-[0.98]",
            )}
          >
            <ArrowUp className="h-3.5 w-3.5" aria-hidden />
            Back to top
          </button>
        </div>
      </div>
      <div
        className="h-1 bg-[linear-gradient(90deg,#e8610a_0%,#f5a623_50%,#f47c2e_100%)]"
        aria-hidden
      />
    </footer>
  );
}
