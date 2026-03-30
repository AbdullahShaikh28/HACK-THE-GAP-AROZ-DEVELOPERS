import { ZoneComposedChart } from "@/components/dashboard/analytics/AnalyticsCharts";
import { Card } from "@/components/ui/Card";
import type { ZoneMetrics } from "@/services/analytics";

export function ZoneAnalyticsSection({
  days,
  rows,
}: {
  days: 7 | 30 | 90;
  rows: ZoneMetrics;
}) {
  const maxSubmissions = Math.max(1, ...rows.map((r) => r.submissions));
  const stressedZone =
    rows.length > 0
      ? [...rows].sort((a, b) => b.lowPressurePct - a.lowPressurePct)[0]
      : null;

  return (
    <Card>
      <h2 className="text-lg font-semibold text-foreground">Zone Analytics ({days} days)</h2>
      <p className="mb-4 text-sm text-muted">
        Compare submissions, low-pressure share, and duration by zone 1-5.
      </p>

      {stressedZone ? (
        <p className="mb-3 text-sm">
          <span className="font-semibold text-foreground">Most stressed zone:</span>{" "}
          <span className="text-muted">
            Zone {stressedZone.zone} ({stressedZone.lowPressurePct.toFixed(1)}% low pressure)
          </span>
        </p>
      ) : null}

      <ZoneComposedChart rows={rows} />

      <div className="mt-6 space-y-2">
        {rows.map((row) => (
          <div
            key={row.zone}
            className="rounded-lg border border-border bg-background/60 px-3 py-2"
          >
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-foreground">Zone {row.zone}</span>
              <span className="text-muted">{row.submissions} submissions</span>
            </div>
            <div className="h-2 w-full rounded bg-muted">
              <div
                className="h-2 rounded bg-[#1a3a6e]"
                style={{ width: `${(row.submissions / maxSubmissions) * 100}%` }}
              />
            </div>
            <div className="mt-1 grid grid-cols-2 gap-2 text-xs text-muted sm:grid-cols-3">
              <span>Low pressure: {row.lowPressurePct.toFixed(1)}%</span>
              <span>Avg duration: {row.avgDurationMinutes.toFixed(1)} min</span>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
