"use client";

import { ReliabilityCharts } from "@/components/dashboard/analytics/AnalyticsCharts";
import { Card } from "@/components/ui/Card";
import type { ReliabilityMetrics } from "@/services/analytics";

export function ReliabilitySection({
  days,
  data,
}: {
  days: 7 | 30 | 90;
  data: ReliabilityMetrics;
}) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground">Supply Reliability ({days} days)</h2>
      <p className="mb-4 text-sm text-muted">
        Service consistency from field surveys and supply reports.
      </p>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <MetricCard label="Submissions" value={String(data.totalSubmissions)} />
        <MetricCard
          label="Avg Duration"
          value={`${data.avgDurationMinutes.toFixed(1)} min`}
        />
        <MetricCard
          label="Low Pressure"
          value={`${data.lowPressurePct.toFixed(1)}%`}
        />
        <MetricCard
          label="On-time Arrival"
          value={`${data.onTimeArrivalPct.toFixed(1)}%`}
        />
      </div>

      <ReliabilityCharts data={data} />
    </Card>
  );
}

function MetricCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}
