import Link from "next/link";
import type { HomeScheduledTankRow } from "@/services/valve-schedules";

const publicServices = [
  {
    href: "/chat",
    title: "Chat assistant",
    description:
      "Ask questions about the water network and get guided help in an interactive conversation.",
  },
  {
    href: "/tanks",
    title: "Tank directory",
    description:
      "Explore all storage assets—capacity, wards, and summaries across the distribution network.",
  },
  {
    href: "/complaints",
    title: "Complaints",
    description:
      "Report service issues. Stored as complaints for follow-up—separate from supply observations.",
  },
  {
    href: "/supply-report",
    title: "Supply report",
    description:
      "Log timing, pressure, and notes about water supply; saved in field surveys for operations.",
  },
] as const;

/** Highlights for the public tanks page—no auth required. */
const publicInsights = [
  {
    title: "Live dataset summary",
    text: "Totals for active tanks, aggregate capacity in lakh litres, and how many municipal wards are represented in the inventory.",
    href: "/tanks" as const,
  },
  {
    title: "Tank mix & coverage",
    text: "Breakdown of ESR, GSR, and sump assets plus ward-level coverage notes derived from published inventory data.",
    href: "/tanks" as const,
  },
  {
    title: "Top capacity & search",
    text: "Largest assets by capacity and tools to browse or narrow down tanks by area for quick reference.",
    href: "/tanks" as const,
  },
];

function formatStart(dateISO: string, timeHHmmss: string) {
  const hhmm = timeHHmmss.slice(0, 5);
  return `${dateISO} · ${hhmm}`;
}

export function HomeOverview({
  scheduledRows = [],
}: {
  scheduledRows?: HomeScheduledTankRow[];
}) {
  return (
    <div className="space-y-14 pb-16">
      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#1a3a6e_0%,#1e4d8c_50%,#0f2a52_100%)] px-6 py-12 text-white md:py-14">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_520px_280px_at_85%_40%,rgba(232,97,10,0.2)_0%,transparent_65%)]" />
        <div className="relative mx-auto max-w-[1280px] space-y-5">
          <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#f5a623]">
            Chhatrapati Sambhajinagar Smart City
          </p>
          <h1 className="max-w-3xl text-3xl font-bold leading-tight tracking-tight md:text-[2.15rem]">
            Public portal for water network information and citizen reporting
          </h1>
          <p className="max-w-2xl text-sm leading-relaxed text-white/85 md:text-[15px]">
            Explore tank inventory and city-wide capacity figures, use the assistant chat, and file complaints or supply
            reports—without an account.
          </p>
          <div className="flex flex-wrap gap-3 pt-2">
            <Link
              href="/tanks"
              className="inline-flex items-center justify-center rounded-lg bg-[#e8610a] px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-black/20 transition hover:bg-[#f47c2e]"
            >
              View tank network
            </Link>
            <Link
              href="/complaints"
              className="inline-flex items-center justify-center rounded-lg border border-white/35 bg-white/10 px-5 py-2.5 text-sm font-semibold text-white backdrop-blur-sm transition hover:bg-white/15"
            >
              Submit feedback
            </Link>
          </div>
        </div>
      </section>

      <section
        className="mx-auto max-w-[1280px] px-6"
        aria-labelledby="network-snapshot-heading"
      >
        <h2 id="network-snapshot-heading" className="sr-only">
          Network snapshot
        </h2>
        <div className="grid gap-4 sm:grid-cols-3">
          {[
            { label: "Active tanks", value: "39", hint: "Monitored across the city" },
            { label: "Wards covered", value: "22", hint: "Distribution footprint" },
            { label: "Total capacity", value: "756 LL", hint: "Across the network" },
          ].map((item) => (
            <div
              key={item.label}
              className="rounded-xl border border-[#dbe3ef] bg-white px-5 py-4 shadow-sm"
            >
              <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#6b7a94]">
                {item.label}
              </p>
              <p className="mt-1 text-2xl font-bold tabular-nums text-[#1a3a6e]">
                {item.value}
              </p>
              <p className="mt-1 text-xs text-[#6b7a94]">{item.hint}</p>
            </div>
          ))}
        </div>
        <p className="mt-3 text-center text-xs text-[#6b7a94]">
          Figures align with the live inventory on the tank directory; open it for up-to-date totals from the dataset.
        </p>
      </section>

      <section
        className="mx-auto max-w-[1280px] px-6"
        aria-labelledby="public-insights-heading"
      >
        <div className="mb-6">
          <h2
            id="public-insights-heading"
            className="text-xl font-semibold text-[#1a2535]"
          >
            Public network insights
          </h2>
          <p className="mt-1 text-sm text-[#6b7a94]">
            Deeper breakdowns and tables are on the tank directory—always the same open information, no login.
          </p>
        </div>
        <ul className="grid gap-4 md:grid-cols-3">
          {publicInsights.map((item) => (
            <li key={item.title}>
              <Link
                href={item.href}
                className="group flex h-full flex-col rounded-xl border border-[#dbe3ef] bg-white p-5 shadow-sm transition hover:border-[#1a3a6e]/25 hover:shadow-md"
              >
                <span className="text-base font-semibold text-[#1a2535] group-hover:text-[#1a3a6e]">
                  {item.title}
                </span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-[#6b7a94]">
                  {item.text}
                </span>
                <span className="mt-4 text-sm font-semibold text-[#e8610a]">
                  See tank directory →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section
        className="mx-auto max-w-[1280px] px-6"
        aria-labelledby="scheduled-valves-heading"
      >
        <div className="mb-6 flex items-end justify-between gap-4">
          <div>
            <h2 id="scheduled-valves-heading" className="text-xl font-semibold text-[#1a2535]">
              Scheduled valve openings
            </h2>
            <p className="mt-1 text-sm text-[#6b7a94]">
              Display-only list from backend-created scheduling records.
            </p>
          </div>
          <Link
            href="/tanks?tab=scheduled"
            className="text-sm font-semibold text-[#1a3a6e] hover:underline"
          >
            Open scheduled tanks →
          </Link>
        </div>

        {scheduledRows.length === 0 ? (
          <div className="rounded-xl border border-[#dbe3ef] bg-white px-5 py-6 text-sm text-[#6b7a94] shadow-sm">
            No upcoming backend schedule found for your account.
          </div>
        ) : (
          <ul className="grid gap-4 md:grid-cols-2">
            {scheduledRows.map((row) => (
              <li
                key={`${row.schedule_id}-${row.tank_id}`}
                className="rounded-xl border border-[#dbe3ef] bg-white p-5 shadow-sm"
              >
                <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#e8610a]">
                  {row.tank_type} · {row.ward}
                </p>
                <p className="mt-1 text-base font-semibold text-[#1a2535]">{row.tank_name}</p>
                <p className="mt-2 text-sm text-[#6b7a94]">{row.area_address}</p>
                <div className="mt-4 grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#6b7a94]">
                      Opening
                    </p>
                    <p className="mt-1 font-semibold text-[#1a3a6e]">
                      {formatStart(row.schedule_date, row.open_at)}
                    </p>
                  </div>
                  <div>
                    <p className="text-[11px] font-bold uppercase tracking-[0.6px] text-[#6b7a94]">
                      Duration
                    </p>
                    <p className="mt-1 font-semibold text-[#1a3a6e]">
                      {row.duration_minutes} min
                    </p>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section
        className="mx-auto max-w-[1280px] px-6"
        aria-labelledby="citizen-services-heading"
      >
        <div className="mb-6">
          <h2
            id="citizen-services-heading"
            className="text-xl font-semibold text-[#1a2535]"
          >
            Citizen services
          </h2>
          <p className="mt-1 text-sm text-[#6b7a94]">
            No account required—open tools directly from the menu or the cards below.
          </p>
        </div>
        <ul className="grid gap-4 md:grid-cols-2">
          {publicServices.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className="group flex h-full flex-col rounded-xl border border-[#dbe3ef] bg-white p-5 shadow-sm transition hover:border-[#1a3a6e]/25 hover:shadow-md"
              >
                <span className="text-base font-semibold text-[#1a2535] group-hover:text-[#1a3a6e]">
                  {item.title}
                </span>
                <span className="mt-2 flex-1 text-sm leading-relaxed text-[#6b7a94]">
                  {item.description}
                </span>
                <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-[#e8610a]">
                  Open
                  <span aria-hidden className="transition group-hover:translate-x-0.5">
                    →
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
