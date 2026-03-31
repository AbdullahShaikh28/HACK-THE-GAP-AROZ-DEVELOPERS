"use client";

import type { Route } from "next";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import type { WaterTank } from "@/services/tanks";

export type TanksInventoryFilter = "ALL" | WaterTank["type"] | "SCHEDULED";
type FilterType = TanksInventoryFilter;

type TanksInventoryProps = {
  tanks: WaterTank[];
  /** From `?tab=` on /tanks (all, esr, gsr, sump, scheduled). */
  initialFilter?: FilterType;
};

const FILTER_ORDER = ["ALL", "ESR", "GSR", "Sump", "SCHEDULED"] as const;

const FILTER_TO_TAB: Record<FilterType, string> = {
  ALL: "all",
  ESR: "esr",
  GSR: "gsr",
  Sump: "sump",
  SCHEDULED: "scheduled",
};

function badgeColors(type: WaterTank["type"]) {
  if (type === "ESR") {
    return "border-[#b8cded] bg-[#e8f0fb] text-[#1a3a6e]";
  }

  if (type === "GSR") {
    return "border-[#f9c07a] bg-[#fff3e0] text-[#b85800]";
  }

  return "border-[#a5d6a7] bg-[#e8f5e9] text-[#1e5e2a]";
}

function accentColor(type: WaterTank["type"]) {
  if (type === "ESR") {
    return "#1a3a6e";
  }

  if (type === "GSR") {
    return "#e8610a";
  }

  return "#1e7e34";
}

function levelFromData(tank: WaterTank) {
  if (tank.capacityLakhLiters <= 0) {
    return 0;
  }

  const derivedAvailable =
    tank.capacityAvailableLakhLiters > 0
      ? tank.capacityAvailableLakhLiters
      : Math.max(0, tank.capacityLakhLiters - tank.capacityUsedLakhLiters);

  // Visual water height should represent currently available water.
  return Math.min(
    100,
    Math.max(0, Math.round((derivedAvailable / tank.capacityLakhLiters) * 100)),
  );
}

function statusForLevel(level: number) {
  if (level > 60) {
    return {
      label: "NORMAL",
      className: "border-[#00e676] bg-[#00e676]/10 text-[#00e676]",
      barColor: "#00e676",
    };
  }

  if (level > 25) {
    return {
      label: "LOW",
      className: "border-[#ffc107] bg-[#ffc107]/10 text-[#ffc107]",
      barColor: "#ffc107",
    };
  }

  return {
    label: "CRITICAL",
    className: "border-[#f44336] bg-[#f44336]/10 text-[#f44336]",
    barColor: "#f44336",
  };
}

function formatScheduledAt(iso: string) {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function TanksInventory({
  tanks,
  initialFilter = "ALL",
}: TanksInventoryProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<FilterType>(initialFilter);
  const [selectedTank, setSelectedTank] = useState<WaterTank | null>(null);

  function applyFilter(filter: FilterType) {
    setActiveFilter(filter);
    const tab = FILTER_TO_TAB[filter];
    const next = tab === "all" ? pathname : `${pathname}?tab=${tab}`;
    router.replace(next as Route, { scroll: false });
  }

  const filteredTanks = useMemo(() => {
    const normalizedQuery = searchQuery.trim().toLowerCase();

    return tanks.filter((tank) => {
      const matchesFilter =
        activeFilter === "ALL"
          ? true
          : activeFilter === "SCHEDULED"
            ? tank.scheduled
            : tank.type === activeFilter;
      const matchesQuery =
        normalizedQuery.length === 0
          ? true
          : tank.name.toLowerCase().includes(normalizedQuery) ||
            tank.ward.toLowerCase().includes(normalizedQuery) ||
            tank.areaAddress.toLowerCase().includes(normalizedQuery);

      return matchesFilter && matchesQuery;
    });
  }, [activeFilter, searchQuery, tanks]);

  return (
    <section className="mt-10">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <h3 className="font-[var(--font-montserrat)] text-[18px] font-extrabold tracking-[-0.2px] text-[#1a3a6e]">
          Tank Inventory
        </h3>
        <p className="rounded-full border border-[#dce4ef] bg-[#f2f5f9] px-4 py-1.5 text-xs text-[#6b7a94]">
          {filteredTanks.length} records visible
        </p>
      </div>

      <div className="mb-5 flex flex-wrap gap-2.5">
        <input
          type="text"
          value={searchQuery}
          onChange={(event) => setSearchQuery(event.target.value)}
          placeholder="Search tank name, ward, or area..."
          className="min-w-[220px] flex-1 rounded-lg border-[1.5px] border-[#dce4ef] bg-white px-4 py-2.5 text-[13px] text-[#1a2535] outline-none transition focus:border-[#2563a8]"
        />
        {FILTER_ORDER.map((filter) => {
          const isActive = activeFilter === filter;
          const label =
            filter === "SCHEDULED" ? "Scheduled" : filter;

          return (
            <button
              key={filter}
              type="button"
              onClick={() => applyFilter(filter)}
              className={[
                "rounded-lg border-[1.5px] px-4 py-2.5 text-[12.5px] font-semibold transition",
                isActive
                  ? "border-[#1a3a6e] bg-[#1a3a6e] text-white"
                  : "border-[#dce4ef] bg-white text-[#1a2535] hover:border-[#1a3a6e] hover:text-[#1a3a6e]",
              ].join(" ")}
            >
              {label}
            </button>
          );
        })}
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTanks.length === 0 ? (
          <div className="col-span-full rounded-xl border border-[#dce4ef] bg-white px-6 py-10 text-center text-sm text-[#6b7a94] shadow-[0_2px_8px_rgba(26,58,110,0.10)]">
            {activeFilter === "SCHEDULED"
              ? "No tanks are listed as scheduled in the directory yet."
              : "No tanks found matching your search."}
          </div>
        ) : null}

        {filteredTanks.map((tank) => (
          <button
            key={tank.id}
            type="button"
            onClick={() => setSelectedTank(tank)}
            className="relative overflow-hidden rounded-[12px] border-[1.5px] border-[#dce4ef] bg-white p-5 text-left shadow-[0_2px_8px_rgba(26,58,110,0.10)] transition duration-200 hover:-translate-y-1 hover:border-[#2563a8] hover:shadow-[0_8px_40px_rgba(26,58,110,0.18)]"
          >
            <span
              className="absolute bottom-0 left-0 top-0 w-1 rounded-l-[12px]"
              style={{ backgroundColor: accentColor(tank.type) }}
            />

            <div className="mb-2 flex items-start justify-between gap-3">
              <h4 className="flex-1 pr-2 font-[var(--font-montserrat)] text-[13.5px] font-bold leading-[1.35] text-[#1a2535]">
                {tank.name}
              </h4>
              <span
                className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.8px] ${badgeColors(
                  tank.type,
                )}`}
              >
                {tank.type}
              </span>
            </div>

            <p className="mb-4 text-[11px] font-medium text-[#6b7a94]">
              {tank.ward}
            </p>
            {tank.nextScheduledAtIso ? (
              <p className="mb-4 rounded-md border border-[#f5c28d] bg-[#fff4e8] px-2.5 py-1.5 text-[10.5px] font-semibold text-[#b85800]">
                Next scheduled: {formatScheduledAt(tank.nextScheduledAtIso)}
              </p>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <p className="mb-0.5 text-[9.5px] font-bold uppercase tracking-[0.8px] text-[#6b7a94]">
                  Capacity
                </p>
                <p className="font-[var(--font-montserrat)] text-[20px] font-extrabold leading-none text-[#1a3a6e]">
                  {tank.capacityLakhLiters}
                  <span className="ml-1 text-[11px] font-semibold text-[#6b7a94]">
                    LL
                  </span>
                </p>
              </div>
              <div>
                <p className="mb-0.5 text-[9.5px] font-bold uppercase tracking-[0.8px] text-[#6b7a94]">
                  Area
                </p>
                <p className="border-l-2 border-[#dce4ef] pl-2 text-[11.5px] leading-[1.45] text-[#1a2535]">
                  {tank.areaAddress}
                </p>
              </div>
            </div>
          </button>
        ))}
      </div>

      {selectedTank ? (
        <TankMonitorModal
          tank={selectedTank}
          onClose={() => setSelectedTank(null)}
        />
      ) : null}
    </section>
  );
}

type TankMonitorModalProps = {
  tank: WaterTank;
  onClose: () => void;
};

function TankMonitorModal({ tank, onClose }: TankMonitorModalProps) {
  const level = levelFromData(tank);
  const status = statusForLevel(level);
  const waterHeight = Math.round((level / 100) * 148);

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/70 px-4 py-8 backdrop-blur-sm">
      <div className="relative max-h-[92vh] w-full max-w-5xl overflow-auto rounded-[20px] border border-white/10 bg-[#1a1810] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.55)]">
        <button
          type="button"
          onClick={onClose}
          className="absolute right-4 top-4 rounded-full border border-white/15 px-3 py-1.5 text-xs font-semibold uppercase tracking-[1px] text-white/80 transition hover:bg-white/10 hover:text-white"
        >
          Close
        </button>

        <div className="mb-6 pr-16">
          <p className="text-[11px] font-bold uppercase tracking-[1.8px] text-[#00e5ff]/70">
            Water Tank Level Monitor
          </p>
          <h3 className="mt-2 font-[var(--font-montserrat)] text-2xl font-extrabold text-white">
            {tank.name}
          </h3>
          <p className="mt-1 text-sm text-white/60">
            {tank.areaAddress} · {tank.ward}
          </p>
        </div>

        <div className="grid gap-10 lg:grid-cols-[1.15fr_0.85fr]">
          <div className="flex flex-col items-center justify-center">
            <div className="flex flex-col items-center gap-6 py-4">
              <div className="relative flex w-[300px] flex-col items-center">
                <div className="relative z-[12] mb-[-1px] h-5 w-[312px]">
                  <div className="absolute left-0 right-0 top-0 h-1 rounded bg-[#a8956e] shadow-[0_-9px_0_#a8956e]" />
                  <div className="absolute left-2 right-2 top-[-9px] h-[13px] bg-[repeating-linear-gradient(90deg,#7a6b4c_0,#7a6b4c_3px,transparent_3px,transparent_15px)]" />
                </div>

                <div className="relative z-10 h-[160px] w-[300px] overflow-hidden rounded-md bg-[linear-gradient(90deg,#7a6b4c_0%,#cfc09a_18%,#e2d8bc_44%,#cfc09a_70%,#7a6b4c_100%)] shadow-[inset_-18px_0_34px_rgba(0,0,0,0.28),inset_18px_0_16px_rgba(255,255,255,0.10),0_6px_18px_rgba(0,0,0,0.55)]">
                  <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,transparent_0px,transparent_28px,rgba(0,0,0,0.06)_28px,rgba(0,0,0,0.06)_31px)]" />
                  <div className="absolute left-[-6px] right-[-6px] top-[-12px] z-[3] h-[26px] rounded-[50%] bg-[linear-gradient(180deg,#e2d8bc_0%,#cfc09a_45%,#a8956e_100%)] shadow-[0_-3px_6px_rgba(0,0,0,0.3)]" />

                  <div
                    className="absolute bottom-0 left-0 right-0 overflow-hidden transition-all duration-1000 ease-out"
                    style={{ height: `${waterHeight}px` }}
                  >
                    <div className="absolute inset-0 bg-[linear-gradient(180deg,#2a88b8_0%,#1560a0_100%)]" />
                    <div className="absolute inset-0 bg-[repeating-linear-gradient(180deg,rgba(255,255,255,0)_0px,rgba(255,255,255,0.07)_5px,rgba(255,255,255,0)_10px)]" />
                    <div className="absolute left-[13%] right-[36%] top-3 h-[55%] rounded-[50%_50%_0_0/20px_20px_0_0] bg-[linear-gradient(180deg,rgba(255,255,255,0.22)_0%,rgba(255,255,255,0.05)_40%,transparent_70%)]" />
                    <div className="absolute left-[-4px] right-[-4px] top-[-11px] h-6 rounded-[50%] bg-[radial-gradient(ellipse_65%_55%_at_38%_38%,rgba(255,255,255,0.76)_0%,#5bb8d4_30%,#2a88b8_65%,#1560a0_100%)] shadow-[0_4px_22px_rgba(79,195,247,0.5)]" />
                  </div>
                </div>

                <div className="relative z-[11] mt-0 h-7 w-[312px] rounded-[14px] bg-[linear-gradient(180deg,#e2d8bc_0%,#cfc09a_40%,#a8956e_100%)] shadow-[0_5px_12px_rgba(0,0,0,0.5),inset_0_1px_0_rgba(255,255,255,0.22)]" />

                <div className="relative z-10 h-[210px] w-[300px]">
                  <div className="absolute left-1/2 top-0 bottom-0 flex w-[46px] -translate-x-1/2 gap-1.5">
                    <div className="flex-1 rounded bg-[linear-gradient(90deg,#4a2008_0%,#b06a40_35%,#8b5030_60%,#3a1808_100%)] shadow-[2px_0_8px_rgba(0,0,0,0.55)]" />
                    <div className="flex-1 rounded bg-[linear-gradient(90deg,#4a2008_0%,#b06a40_35%,#8b5030_60%,#3a1808_100%)] shadow-[2px_0_8px_rgba(0,0,0,0.55)]" />
                  </div>

                  {[0, 68, 136, 196].map((top, index) => (
                    <div
                      key={top}
                      className="absolute left-0 right-0 h-[14px] rounded-[7px] bg-[linear-gradient(180deg,#e2d8bc_0%,#cfc09a_40%,#a8956e_100%)] shadow-[0_3px_9px_rgba(0,0,0,0.4)]"
                      style={index === 3 ? { bottom: 0 } : { top }}
                    />
                  ))}

                  <div className="absolute inset-0 flex justify-around px-2">
                    {Array.from({ length: 8 }).map((_, index) => (
                      <div
                        key={index}
                        className="h-full w-6 rounded-[12px] bg-[linear-gradient(90deg,#7a6b4c_0%,#cfc09a_25%,#e2d8bc_50%,#cfc09a_75%,#7a6b4c_100%)] shadow-[2px_0_8px_rgba(0,0,0,0.38),inset_3px_0_5px_rgba(255,255,255,0.14)]"
                      />
                    ))}
                  </div>
                </div>

                <div className="z-[8] mt-0 h-4 w-[340px] rounded-lg bg-[linear-gradient(180deg,#5a4a30_0%,#3a2e1c_100%)] shadow-[0_4px_14px_rgba(0,0,0,0.55)]" />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-[#00e5ff]/20 bg-[rgba(8,16,24,0.92)] p-6 shadow-[0_0_28px_rgba(0,229,255,0.07),0_8px_28px_rgba(0,0,0,0.55)] backdrop-blur-md">
            <p className="mb-3 font-mono text-[10px] uppercase tracking-[3px] text-[#00e5ff]/70">
              // Water Level Monitor
            </p>

            <div className="mb-4 flex items-baseline gap-2">
              <span className="font-mono text-[46px] leading-none text-white [text-shadow:0_0_18px_var(--tw-shadow-color)] shadow-cyan-300">
                {level}
              </span>
              <span className="font-mono text-[15px] text-white/45">%</span>
            </div>

            <div className="mb-4 h-[7px] overflow-hidden rounded bg-white/10">
              <div
                className="h-full rounded transition-all duration-1000 ease-out"
                style={{
                  width: `${level}%`,
                  background:
                    "linear-gradient(90deg, #1560a0 0%, #00e5ff 100%)",
                  boxShadow: "0 0 8px rgba(0,229,255,0.5)",
                }}
              />
            </div>

            <div className="mb-6 grid gap-4 sm:grid-cols-2">
              <div>
                <p className="mb-1 font-mono text-[11px] tracking-[1px] text-white/35">
                  CAPACITY
                </p>
                <p className="text-lg font-bold text-white">
                  {tank.capacityLakhLiters} Lakh Liters
                </p>
              </div>
              <div>
                <p className="mb-1 font-mono text-[11px] tracking-[1px] text-white/35">
                  USED
                </p>
                <p className="text-lg font-bold text-white">
                  {tank.capacityUsedLakhLiters} Lakh Liters
                </p>
              </div>
              <div>
                <p className="mb-1 font-mono text-[11px] tracking-[1px] text-white/35">
                  AVAILABLE
                </p>
                <p className="text-lg font-bold text-white">
                  {tank.capacityAvailableLakhLiters} Lakh Liters
                </p>
              </div>
              <div>
                <p className="mb-1 font-mono text-[11px] tracking-[1px] text-white/35">
                  TYPE
                </p>
                <p className="text-lg font-bold text-white">{tank.type}</p>
              </div>
              <div>
                <p className="mb-1 font-mono text-[11px] tracking-[1px] text-white/35">
                  WARD
                </p>
                <p className="text-sm font-semibold text-white/85">{tank.ward}</p>
              </div>
              <div>
                <p className="mb-1 font-mono text-[11px] tracking-[1px] text-white/35">
                  AREA
                </p>
                <p className="text-sm font-semibold text-white/85">
                  {tank.areaAddress}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <span
                className={`rounded-full border px-3 py-1 font-mono text-[10px] uppercase tracking-[1px] ${status.className}`}
              >
                {status.label}
              </span>
              <span className="rounded-full border border-[#00e5ff]/20 bg-[#00e5ff]/10 px-3 py-1 font-mono text-[10px] uppercase tracking-[1px] text-[#00e5ff]/80">
                Tank ID: {tank.id}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
