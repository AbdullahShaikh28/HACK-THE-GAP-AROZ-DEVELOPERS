"use client";

import type { ComplaintMetrics, ReliabilityMetrics, TankRisk, ZoneMetrics } from "@/services/analytics";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ComposedChart,
  Legend,
  Line,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const ORANGE = "#e8610a";
const NAVY = "#1a3a6e";
const TEAL = "#0d9488";
const VIOLET = "#7c3aed";
const GRID = "#e2e8f0";
const TICK = "#64748b";
const FG = "#0f172a";

const chartTooltipStyle = {
  backgroundColor: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  fontSize: "12px",
  color: FG,
  boxShadow: "0 10px 30px rgba(15, 23, 42, 0.08)",
};

function bandColor(band: TankRisk["band"]) {
  if (band === "Critical") return "#dc2626";
  if (band === "Watch") return ORANGE;
  return TEAL;
}

export function TankRiskBarChart({ rows }: { rows: TankRisk[] }) {
  const data = rows.slice(0, 10).map((r) => ({
    name: r.tankName.length > 18 ? `${r.tankName.slice(0, 16)}…` : r.tankName,
    score: Number(r.score.toFixed(1)),
    band: r.band,
  }));

  if (data.length === 0) return null;

  return (
    <div className="mt-6 rounded-xl border border-border/80 bg-gradient-to-b from-background/80 to-muted/20 p-4">
      <p className="mb-3 text-sm font-semibold text-foreground">Risk score overview</p>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart
            layout="vertical"
            data={data}
            margin={{ top: 8, right: 16, left: 4, bottom: 8 }}
          >
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} horizontal={false} />
            <XAxis type="number" domain={[0, 100]} tick={{ fill: TICK, fontSize: 11 }} />
            <YAxis
              type="category"
              dataKey="name"
              width={110}
              tick={{ fill: FG, fontSize: 11 }}
            />
            <Tooltip
              cursor={{ fill: "rgba(100, 116, 139, 0.12)" }}
              contentStyle={chartTooltipStyle}
              formatter={(value: number, _name, item) => {
                const band = (item?.payload as { band?: string })?.band;
                return [`${value}${band ? ` (${band})` : ""}`, "Score"];
              }}
            />
            <Bar dataKey="score" radius={[0, 6, 6, 0]} maxBarSize={28}>
              {data.map((entry, i) => (
                <Cell key={`cell-${i}`} fill={bandColor(entry.band as TankRisk["band"])} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

export function ReliabilityCharts({ data }: { data: ReliabilityMetrics }) {
  const quality = [
    { name: "Low pressure", pct: data.lowPressurePct },
    { name: "On-time arrival", pct: data.onTimeArrivalPct },
  ];
  const volume = [
    { name: "Submissions", value: data.totalSubmissions },
    { name: "Avg duration (min)", value: Number(data.avgDurationMinutes.toFixed(1)) },
  ];

  const empty = data.totalSubmissions === 0;

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border/80 bg-gradient-to-b from-background/80 to-muted/20 p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Pressure &amp; punctuality</p>
        <p className="mb-2 text-xs text-muted">Share of low-pressure reports and on-time arrivals (window).</p>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={quality} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: TICK, fontSize: 11 }} />
              <YAxis domain={[0, 100]} tick={{ fill: TICK, fontSize: 11 }} unit="%" />
              <Tooltip
                contentStyle={chartTooltipStyle}
                formatter={(v: number) => [`${v.toFixed(1)}%`, ""]}
              />
              <Bar dataKey="pct" fill={NAVY} radius={[6, 6, 0, 0]} maxBarSize={56} name="%" />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {empty ? (
          <p className="mt-2 text-center text-xs text-muted">No submissions in this window.</p>
        ) : null}
      </div>

      <div className="rounded-xl border border-border/80 bg-gradient-to-b from-background/80 to-muted/20 p-4">
        <p className="mb-3 text-sm font-semibold text-foreground">Volume &amp; duration</p>
        <p className="mb-2 text-xs text-muted">Survey count and average supply duration.</p>
        <div className="h-[220px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={volume} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: TICK, fontSize: 11 }} />
              <YAxis tick={{ fill: TICK, fontSize: 11 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={56}>
                <Cell fill={ORANGE} />
                <Cell fill={VIOLET} />
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}

function statusLabel(status: string) {
  return status.replaceAll("_", " ").replace(/\b\w/g, (m) => m.toUpperCase());
}

const STATUS_COLORS = [NAVY, ORANGE, TEAL, VIOLET, "#64748b"];

export function ComplaintCharts({ data }: { data: ComplaintMetrics }) {
  const pieData = data.statusMix
    .filter((s) => s.count > 0)
    .map((s) => ({
      name: statusLabel(s.status),
      value: s.count,
    }));

  const agingData = data.agingBuckets.map((a) => ({
    name: a.bucket,
    count: a.count,
  }));

  const hasComplaints = data.total > 0;

  return (
    <div className="mt-6 grid gap-4 lg:grid-cols-2">
      <div className="rounded-xl border border-border/80 bg-gradient-to-b from-background/80 to-muted/20 p-4">
        <p className="mb-1 text-sm font-semibold text-foreground">Complaints by status</p>
        <p className="mb-3 text-xs text-muted">Distribution in the selected window.</p>
        <div className="h-[260px] w-full">
          {pieData.length === 0 ? (
            <p className="flex h-full items-center justify-center text-sm text-muted">No complaints in this period.</p>
          ) : (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={56}
                  outerRadius={88}
                  paddingAngle={3}
                  dataKey="value"
                  nameKey="name"
                  stroke="#ffffff"
                  strokeWidth={2}
                >
                  {pieData.map((_, i) => (
                    <Cell key={`s-${i}`} fill={STATUS_COLORS[i % STATUS_COLORS.length]!} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend wrapperStyle={{ fontSize: "12px", color: FG }} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </div>
      </div>

      <div className="rounded-xl border border-border/80 bg-gradient-to-b from-background/80 to-muted/20 p-4">
        <p className="mb-1 text-sm font-semibold text-foreground">Aging pipeline</p>
        <p className="mb-3 text-xs text-muted">Complaints by age bucket.</p>
        <div className="h-[260px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={agingData} margin={{ top: 8, right: 8, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={GRID} vertical={false} />
              <XAxis dataKey="name" tick={{ fill: TICK, fontSize: 11 }} />
              <YAxis allowDecimals={false} tick={{ fill: TICK, fontSize: 11 }} />
              <Tooltip contentStyle={chartTooltipStyle} />
              <Bar dataKey="count" radius={[6, 6, 0, 0]} name="Count" fill={ORANGE} maxBarSize={72} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        {!hasComplaints ? (
          <p className="mt-2 text-center text-xs text-muted">No aging data for empty periods.</p>
        ) : null}
      </div>
    </div>
  );
}

export function ZoneComposedChart({ rows }: { rows: ZoneMetrics }) {
  const data = rows.map((r) => ({
    zone: `Zone ${r.zone}`,
    submissions: r.submissions,
    lowPct: r.lowPressurePct,
  }));

  return (
    <div className="mt-6 rounded-xl border border-border/80 bg-gradient-to-b from-background/80 to-muted/20 p-4">
      <p className="mb-1 text-sm font-semibold text-foreground">Zones: volume vs. stress</p>
      <p className="mb-3 text-xs text-muted">
        Bar = survey submissions; line = low-pressure share (%).
      </p>
      <div className="h-[280px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <ComposedChart data={data} margin={{ top: 8, right: 12, left: 0, bottom: 8 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={GRID} />
            <XAxis dataKey="zone" tick={{ fill: TICK, fontSize: 11 }} />
            <YAxis
              yAxisId="left"
              allowDecimals={false}
              tick={{ fill: TICK, fontSize: 11 }}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              domain={[0, 100]}
              tick={{ fill: TICK, fontSize: 11 }}
              unit="%"
            />
            <Tooltip
              contentStyle={chartTooltipStyle}
              formatter={(value: number, name: string) => {
                if (name === "lowPct") return [`${value.toFixed(1)}%`, "Low pressure"];
                return [value, "Submissions"];
              }}
            />
            <Legend
              wrapperStyle={{ fontSize: "12px", color: FG }}
              formatter={(value) =>
                value === "lowPct" ? "Low pressure %" : value === "submissions" ? "Submissions" : value
              }
            />
            <Bar yAxisId="left" dataKey="submissions" fill={NAVY} radius={[4, 4, 0, 0]} name="submissions" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="lowPct"
              stroke={ORANGE}
              strokeWidth={2.5}
              dot={{ fill: ORANGE, strokeWidth: 0, r: 4 }}
              name="lowPct"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
