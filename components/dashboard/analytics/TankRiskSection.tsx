import { TankRiskBarChart } from "@/components/dashboard/analytics/AnalyticsCharts";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/badge";
import type { TankRisk } from "@/services/analytics";

function bandVariant(scoreBand: TankRisk["band"]) {
  if (scoreBand === "Critical") return "priorityHigh";
  if (scoreBand === "Watch") return "priorityMedium";
  return "priorityLow";
}

export function TankRiskSection({ rows }: { rows: TankRisk[] }) {
  const top = rows.slice(0, 8);

  return (
    <Card>
      <div className="mb-4 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-foreground">Tank Risk Ranking</h2>
          <p className="text-sm text-muted">
            Risk is derived from utilization, recent complaints, and low-pressure reports.
          </p>
        </div>
      </div>

      {top.length === 0 ? (
        <p className="text-sm text-muted">No tank records available for ranking.</p>
      ) : (
        <>
        <TankRiskBarChart rows={rows} />
        <div className="space-y-3">
          {top.map((row, idx) => (
            <div
              key={row.tankId}
              className="rounded-lg border border-border bg-background/60 p-3"
            >
              <div className="mb-2 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold text-muted">#{idx + 1}</span>
                  <span className="font-medium text-foreground">
                    {row.tankName}
                  </span>
                  <span className="text-xs text-muted">({row.ward})</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={bandVariant(row.band)}>{row.band}</Badge>
                  <span className="text-sm font-semibold text-foreground">
                    {row.score.toFixed(1)}
                  </span>
                </div>
              </div>
              <div className="grid gap-2 text-xs text-muted md:grid-cols-3">
                <div>Utilization: {row.utilizationPct.toFixed(1)}%</div>
                <div>Complaints (30d): {row.complaintsLast30d}</div>
                <div>Low pressure (30d): {row.lowPressurePct30d.toFixed(1)}%</div>
              </div>
            </div>
          ))}
        </div>
        </>
      )}
    </Card>
  );
}
