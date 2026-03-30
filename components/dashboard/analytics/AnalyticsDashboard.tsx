"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useMemo, useState } from "react";
import { TankRiskSection } from "@/components/dashboard/analytics/TankRiskSection";
import { ReliabilitySection } from "@/components/dashboard/analytics/ReliabilitySection";
import { ComplaintIntelSection } from "@/components/dashboard/analytics/ComplaintIntelSection";
import { ZoneAnalyticsSection } from "@/components/dashboard/analytics/ZoneAnalyticsSection";
import type { AnalyticsSnapshot } from "@/services/analytics";

const WINDOW_OPTIONS = [7, 30, 90] as const;
const TAB_OPTIONS = ["tank-risk", "reliability", "complaints", "zones"] as const;
type AnalyticsTab = (typeof TAB_OPTIONS)[number];

function safeTab(value: string | undefined): AnalyticsTab {
  if (value && TAB_OPTIONS.includes(value as AnalyticsTab)) {
    return value as AnalyticsTab;
  }
  return "tank-risk";
}

export function AnalyticsDashboard({
  snapshot,
  initialTab,
}: {
  snapshot: AnalyticsSnapshot;
  initialTab?: string;
}) {
  const searchParams = useSearchParams();
  const tab = safeTab(searchParams.get("tab") ?? initialTab);
  const [days, setDays] = useState<(typeof WINDOW_OPTIONS)[number]>(30);
  const current = useMemo(() => snapshot.windowed[days], [snapshot.windowed, days]);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Analytics</h1>
        <p className="text-sm text-muted">
          Operational analytics for your assigned tank:{" "}
          <span className="font-medium text-foreground">
            {snapshot.tankScope.tankName}
          </span>{" "}
          <span>({snapshot.tankScope.ward})</span>.
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground">View:</span>
        {TAB_OPTIONS.map((opt) => (
          <Link
            key={opt}
            href={`/dashboard/analytics?tab=${opt}`}
            scroll={false}
            className={[
              "inline-flex rounded-md px-3 py-1.5 text-sm transition",
              tab === opt
                ? "bg-[#e8610a] text-white"
                : "bg-white text-foreground hover:bg-muted border border-border",
            ].join(" ")}
          >
            {opt === "tank-risk"
              ? "Tank Risk"
              : opt === "reliability"
                ? "Reliability"
                : opt === "complaints"
                  ? "Complaint Intel"
                  : "Zone Analytics"}
          </Link>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <span className="text-sm font-medium text-foreground">Time window:</span>
        {WINDOW_OPTIONS.map((opt) => (
          <button
            key={opt}
            type="button"
            onClick={() => setDays(opt)}
            className={[
              "rounded-md px-3 py-1.5 text-sm transition",
              days === opt
                ? "bg-[#1a3a6e] text-white"
                : "bg-white text-foreground hover:bg-muted border border-border",
            ].join(" ")}
          >
            {opt}d
          </button>
        ))}
        <span className="ml-auto text-xs text-muted">
          Generated: {new Date(snapshot.generatedAtIso).toISOString().slice(0, 16).replace("T", " ")}
          {" "}UTC
        </span>
      </div>

      {tab === "tank-risk" ? <TankRiskSection rows={snapshot.tankRisk} /> : null}
      {tab === "reliability" ? <ReliabilitySection days={days} data={current.reliability} /> : null}
      {tab === "complaints" ? <ComplaintIntelSection days={days} data={current.complaint} /> : null}
      {tab === "zones" ? <ZoneAnalyticsSection days={days} rows={current.zone} /> : null}
    </div>
  );
}
