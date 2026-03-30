import { ComplaintCharts } from "@/components/dashboard/analytics/AnalyticsCharts";
import { Card } from "@/components/ui/Card";
import type { ComplaintMetrics } from "@/services/analytics";

export function ComplaintIntelSection({
  days,
  data,
}: {
  days: 7 | 30 | 90;
  data: ComplaintMetrics;
}) {
  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground">Complaint Intelligence ({days} days)</h2>
      <p className="mb-4 text-sm text-muted">
        Backlog, severity, and aging trends for operational prioritization.
      </p>

      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
        <Metric label="Total Complaints" value={String(data.total)} />
        <Metric label="Open Backlog" value={String(data.openBacklog)} />
        <Metric label="Resolved" value={String(data.resolved)} />
        <Metric
          label="High Priority"
          value={String(data.priorityMix.find((p) => p.priority === "high")?.count ?? 0)}
        />
        <Metric
          label=">3d Aging"
          value={String(data.agingBuckets.find((a) => a.bucket === ">3d")?.count ?? 0)}
        />
      </div>

      <ComplaintCharts data={data} />

      <div className="grid gap-4 lg:grid-cols-2">
        <SmallList
          title="Priority Mix"
          rows={data.priorityMix.map((r) => ({ label: normalize(r.priority), value: r.count }))}
        />
        <SmallList
          title="Status (detail)"
          rows={data.statusMix.map((r) => ({ label: normalize(r.status), value: r.count }))}
        />
      </div>

      <div className="mt-4">
        <h3 className="mb-2 text-sm font-semibold text-foreground">Top Affected Tanks</h3>
        {data.topTanks.length === 0 ? (
          <p className="text-sm text-muted">No complaints in this period.</p>
        ) : (
          <div className="space-y-2">
            {data.topTanks.map((r) => (
              <div
                key={r.tankName}
                className="flex items-center justify-between rounded-md border border-border bg-background/60 px-3 py-2 text-sm"
              >
                <span className="text-foreground">{r.tankName}</span>
                <span className="font-semibold text-foreground">{r.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
}

function Metric({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-muted">{label}</p>
      <p className="mt-1 text-xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function SmallList({
  title,
  rows,
}: {
  title: string;
  rows: Array<{ label: string; value: number }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/60 p-3">
      <p className="mb-2 text-sm font-semibold text-foreground">{title}</p>
      <div className="space-y-1 text-sm">
        {rows.length === 0 ? (
          <p className="text-muted">No data</p>
        ) : (
          rows.map((row) => (
            <div key={row.label} className="flex items-center justify-between">
              <span className="text-muted">{row.label}</span>
              <span className="font-medium text-foreground">{row.value}</span>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

function normalize(value: string) {
  return value
    .replaceAll("_", " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}
