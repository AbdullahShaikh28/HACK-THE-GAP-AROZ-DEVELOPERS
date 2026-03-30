import { createClient } from "@/lib/supabase/server";

type WindowDays = 7 | 30 | 90;

export type ReliabilityMetrics = {
  totalSubmissions: number;
  avgDurationMinutes: number;
  lowPressurePct: number;
  onTimeArrivalPct: number;
};

export type ComplaintMetrics = {
  total: number;
  openBacklog: number;
  resolved: number;
  statusMix: Array<{ status: string; count: number }>;
  priorityMix: Array<{ priority: string; count: number }>;
  agingBuckets: Array<{ bucket: string; count: number }>;
  topTanks: Array<{ tankName: string; count: number }>;
};

export type ZoneMetrics = Array<{
  zone: number;
  submissions: number;
  lowPressurePct: number;
  avgDurationMinutes: number;
}>;

export type TankRisk = {
  tankId: number;
  tankName: string;
  ward: string;
  score: number;
  band: "Critical" | "Watch" | "Stable";
  utilizationPct: number;
  complaintsLast30d: number;
  lowPressurePct30d: number;
};

export type AnalyticsSnapshot = {
  tankScope: {
    tankId: number;
    tankName: string;
    ward: string;
  };
  generatedAtIso: string;
  tankRisk: TankRisk[];
  windowed: Record<
    WindowDays,
    {
      reliability: ReliabilityMetrics;
      complaint: ComplaintMetrics;
      zone: ZoneMetrics;
    }
  >;
};

function toPct(value: number) {
  return Number((value * 100).toFixed(1));
}

function toAvg(value: number) {
  return Number(value.toFixed(1));
}

function cutoffDate(days: WindowDays) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() - days + 1);
  return d;
}

function parseTimeToMinutes(value: string | null | undefined) {
  if (!value) return null;
  const [hh, mm] = value.split(":");
  if (!hh || !mm) return null;
  const h = Number(hh);
  const m = Number(mm);
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  return h * 60 + m;
}

function reliabilityForWindow(rows: Array<any>): ReliabilityMetrics {
  const totalSubmissions = rows.length;
  if (!totalSubmissions) {
    return {
      totalSubmissions: 0,
      avgDurationMinutes: 0,
      lowPressurePct: 0,
      onTimeArrivalPct: 0,
    };
  }

  const durations = rows
    .map((r) => Number(r.duration_minutes))
    .filter((n) => !Number.isNaN(n) && n >= 0);
  const avgDurationMinutes = durations.length
    ? toAvg(durations.reduce((a, b) => a + b, 0) / durations.length)
    : 0;

  const lowCount = rows.filter((r) => r.pressure_level === "low").length;

  // On-time proxy: arrivals between 05:00 and 09:30.
  const arrivalMins = rows
    .map((r) => parseTimeToMinutes(r.arrival_time))
    .filter((v): v is number => v !== null);
  const onTimeCount = arrivalMins.filter((m) => m >= 300 && m <= 570).length;

  return {
    totalSubmissions,
    avgDurationMinutes,
    lowPressurePct: toPct(lowCount / totalSubmissions),
    onTimeArrivalPct: arrivalMins.length ? toPct(onTimeCount / arrivalMins.length) : 0,
  };
}

function complaintForWindow(rows: Array<any>, tankNameById: Map<number, string>): ComplaintMetrics {
  const total = rows.length;
  const openBacklog = rows.filter((r) => r.status === "open" || r.status === "in_progress").length;
  const resolved = rows.filter((r) => r.status === "resolved").length;

  const byStatus = new Map<string, number>();
  const byPriority = new Map<string, number>();
  const byTank = new Map<number, number>();
  const now = Date.now();
  let lt24h = 0;
  let d1to3 = 0;
  let gt3d = 0;

  for (const r of rows) {
    const s = String(r.status ?? "unknown");
    byStatus.set(s, (byStatus.get(s) ?? 0) + 1);
    const p = String(r.priority ?? "unknown");
    byPriority.set(p, (byPriority.get(p) ?? 0) + 1);

    const tankId = Number(r.tank_id);
    if (!Number.isNaN(tankId)) byTank.set(tankId, (byTank.get(tankId) ?? 0) + 1);

    const created = new Date(r.created_at ?? 0).getTime();
    if (!Number.isNaN(created) && created > 0) {
      const ageHours = (now - created) / (1000 * 60 * 60);
      if (ageHours < 24) lt24h += 1;
      else if (ageHours <= 72) d1to3 += 1;
      else gt3d += 1;
    }
  }

  const topTanks = [...byTank.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([tankId, count]) => ({
      tankName: tankNameById.get(tankId) ?? `Tank #${tankId}`,
      count,
    }));

  return {
    total,
    openBacklog,
    resolved,
    statusMix: [...byStatus.entries()]
      .map(([status, count]) => ({ status, count }))
      .sort((a, b) => b.count - a.count),
    priorityMix: [...byPriority.entries()]
      .map(([priority, count]) => ({ priority, count }))
      .sort((a, b) => b.count - a.count),
    agingBuckets: [
      { bucket: "<24h", count: lt24h },
      { bucket: "1-3d", count: d1to3 },
      { bucket: ">3d", count: gt3d },
    ],
    topTanks,
  };
}

function zoneForWindow(rows: Array<any>): ZoneMetrics {
  const zoneRows = new Map<number, Array<any>>();
  for (let i = 1; i <= 5; i += 1) zoneRows.set(i, []);
  for (const r of rows) {
    const z = Number(r.zone_number);
    if (z >= 1 && z <= 5) {
      zoneRows.get(z)?.push(r);
    }
  }

  const out: ZoneMetrics = [];
  for (let zone = 1; zone <= 5; zone += 1) {
    const list = zoneRows.get(zone) ?? [];
    const submissions = list.length;
    const low = list.filter((r) => r.pressure_level === "low").length;
    const durations = list
      .map((r) => Number(r.duration_minutes))
      .filter((n) => !Number.isNaN(n) && n >= 0);
    out.push({
      zone,
      submissions,
      lowPressurePct: submissions ? toPct(low / submissions) : 0,
      avgDurationMinutes: durations.length
        ? toAvg(durations.reduce((a, b) => a + b, 0) / durations.length)
        : 0,
    });
  }
  return out;
}

function riskBand(score: number): "Critical" | "Watch" | "Stable" {
  if (score >= 70) return "Critical";
  if (score >= 40) return "Watch";
  return "Stable";
}

export async function getAnalyticsSnapshot(tankId: number): Promise<AnalyticsSnapshot> {
  const supabase = await createClient();

  const [{ data: tanks }, { data: complaints }, { data: surveys }] = await Promise.all([
    (supabase as any)
      .from("water_tanks")
      .select("id,name,ward,capacity_lakh_liters,capacity_used_lakh_liters")
      .eq("id", tankId)
      .order("id", { ascending: true }),
    (supabase as any)
      .from("complaints")
      .select("tank_id,status,priority,created_at")
      .eq("tank_id", tankId)
      .order("created_at", { ascending: false }),
    (supabase as any)
      .from("field_surveys")
      .select("tank_id,zone_number,pressure_level,duration_minutes,arrival_time,created_at")
      .eq("tank_id", tankId)
      .order("created_at", { ascending: false }),
  ]);

  const tankRows = (tanks ?? []) as Array<any>;
  const scopedTank = tankRows[0];
  if (!scopedTank) {
    return {
      tankScope: {
        tankId,
        tankName: `Tank #${tankId}`,
        ward: "Unknown Ward",
      },
      generatedAtIso: new Date().toISOString(),
      tankRisk: [],
      windowed: {
        7: {
          reliability: reliabilityForWindow([]),
          complaint: complaintForWindow([], new Map<number, string>()),
          zone: zoneForWindow([]),
        },
        30: {
          reliability: reliabilityForWindow([]),
          complaint: complaintForWindow([], new Map<number, string>()),
          zone: zoneForWindow([]),
        },
        90: {
          reliability: reliabilityForWindow([]),
          complaint: complaintForWindow([], new Map<number, string>()),
          zone: zoneForWindow([]),
        },
      },
    };
  }

  const complaintRows = (complaints ?? []) as Array<any>;
  const surveyRows = (surveys ?? []) as Array<any>;

  const tankNameById = new Map<number, string>();
  for (const t of tankRows) {
    tankNameById.set(Number(t.id), String(t.name ?? `Tank #${t.id}`));
  }

  const c30Cut = cutoffDate(30).getTime();
  const c30 = complaintRows.filter((r) => new Date(r.created_at ?? 0).getTime() >= c30Cut);
  const s30 = surveyRows.filter((r) => new Date(r.created_at ?? 0).getTime() >= c30Cut);
  const complaintMax = Math.max(
    1,
    ...tankRows.map((t) => c30.filter((r) => Number(r.tank_id) === Number(t.id)).length),
  );

  const tankRisk: TankRisk[] = tankRows.map((t) => {
    const tankId = Number(t.id);
    const total = Number(t.capacity_lakh_liters ?? 0);
    const used = Number(t.capacity_used_lakh_liters ?? 0);
    const utilization = total > 0 ? Math.min(1, Math.max(0, used / total)) : 0;

    const tankComplaints = c30.filter((r) => Number(r.tank_id) === tankId).length;
    const complaintPressure = Math.min(1, tankComplaints / complaintMax);

    const tankSurveys = s30.filter((r) => Number(r.tank_id) === tankId);
    const lowPressure = tankSurveys.filter((r) => r.pressure_level === "low").length;
    const lowRatio = tankSurveys.length ? lowPressure / tankSurveys.length : 0;

    const score = toAvg(utilization * 50 + complaintPressure * 30 + lowRatio * 20);
    return {
      tankId,
      tankName: String(t.name ?? `Tank #${tankId}`),
      ward: String(t.ward ?? "Unknown Ward"),
      score,
      band: riskBand(score),
      utilizationPct: toPct(utilization),
      complaintsLast30d: tankComplaints,
      lowPressurePct30d: toPct(lowRatio),
    };
  });

  tankRisk.sort((a, b) => b.score - a.score);

  const windows: WindowDays[] = [7, 30, 90];
  const windowed: AnalyticsSnapshot["windowed"] = {
    7: {
      reliability: reliabilityForWindow([]),
      complaint: complaintForWindow([], tankNameById),
      zone: zoneForWindow([]),
    },
    30: {
      reliability: reliabilityForWindow([]),
      complaint: complaintForWindow([], tankNameById),
      zone: zoneForWindow([]),
    },
    90: {
      reliability: reliabilityForWindow([]),
      complaint: complaintForWindow([], tankNameById),
      zone: zoneForWindow([]),
    },
  };

  for (const w of windows) {
    const cut = cutoffDate(w).getTime();
    const cRows = complaintRows.filter((r) => new Date(r.created_at ?? 0).getTime() >= cut);
    const sRows = surveyRows.filter((r) => new Date(r.created_at ?? 0).getTime() >= cut);
    windowed[w] = {
      reliability: reliabilityForWindow(sRows),
      complaint: complaintForWindow(cRows, tankNameById),
      zone: zoneForWindow(sRows),
    };
  }

  return {
    tankScope: {
      tankId: Number(scopedTank.id),
      tankName: String(scopedTank.name ?? `Tank #${tankId}`),
      ward: String(scopedTank.ward ?? "Unknown Ward"),
    },
    generatedAtIso: new Date().toISOString(),
    tankRisk,
    windowed,
  };
}
