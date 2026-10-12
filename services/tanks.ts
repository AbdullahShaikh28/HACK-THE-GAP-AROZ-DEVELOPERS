export type WaterTank = {
  id: number;
  name: string;
  type: "ESR" | "GSR" | "Sump";
  capacityLakhLiters: number;
  capacityUsedLakhLiters: number;
  capacityAvailableLakhLiters: number;
  latitude: number;
  longitude: number;
  ward: string;
  areaAddress: string;
  /** Included in public supply / valve schedule (see Scheduled tab). */
  scheduled: boolean;
  /** Earliest upcoming backend-created schedule for this tank (if any). */
  nextScheduledAtIso: string | null;
};

export type TankAreaSuggestion = {
  id: number;
  tankId: number;
  areaName: string;
  etaMinutes: number;
  durationMinutes: number;
  pressureLevel: "low" | "medium" | "high";
  priorityRank: number;
};

import { createClient } from "@/lib/supabase/server";
import { FALLBACK_WATER_TANKS, FALLBACK_TANK_AREAS } from "./fallback-tanks";

export async function getWaterTanks(): Promise<WaterTank[]> {
  try {
    const supabase = await createClient();
    const [tanksRes, schedulesRes] = await Promise.all([
      (supabase as any).from("water_tanks").select("*").order("id", { ascending: true }),
      (supabase as any)
        .from("valve_opening_schedules")
        .select("tank_id,status,created_source,schedule_date,open_at")
        .in("status", ["scheduled", "opened"])
        .in("created_source", ["backend_ai", "backend_manual"]),
    ]);

    if (tanksRes.error || !tanksRes.data || tanksRes.data.length === 0) {
      if (tanksRes.error) {
        console.warn("Could not load tanks from Supabase, using fallback dataset:", tanksRes.error.message);
      }
      return FALLBACK_WATER_TANKS;
    }

    const scheduledTankIds = new Set<number>();
    const nextScheduledByTank = new Map<number, Date>();
    const now = new Date();
    if (schedulesRes.data) {
      for (const row of schedulesRes.data as Array<any>) {
        const datePart = String(row.schedule_date ?? "");
        const timePart = String(row.open_at ?? "00:00:00");
        const d = new Date(`${datePart}T${timePart}`);
        if (!Number.isNaN(d.getTime()) && d >= now) {
          const tid = Number(row.tank_id);
          scheduledTankIds.add(tid);
          const existing = nextScheduledByTank.get(tid);
          if (!existing || d < existing) nextScheduledByTank.set(tid, d);
        }
      }
    }

    return ((tanksRes.data ?? []) as Array<any>).map((row) => {
      const total = Number(row.capacity_lakh_liters ?? 0);
      const used = Number(row.capacity_used_lakh_liters ?? 0);

      return {
        id: row.id,
        name: row.name,
        type: row.type,
        capacityLakhLiters: total,
        capacityUsedLakhLiters: used,
        capacityAvailableLakhLiters: Math.max(0, total - used),
        latitude: row.latitude,
        longitude: row.longitude,
        ward: row.ward,
        areaAddress: row.area_address,
        scheduled: scheduledTankIds.has(Number(row.id)) || Boolean(row.scheduled),
        nextScheduledAtIso: nextScheduledByTank.get(Number(row.id))?.toISOString() ?? null,
      };
    }) satisfies WaterTank[];
  } catch (err) {
    console.warn("Supabase connection error in getWaterTanks, using fallback dataset:", err);
    return FALLBACK_WATER_TANKS;
  }
}

export function buildWaterTankSummary(waterTanks: WaterTank[]) {
  return {
    totalTanks: waterTanks.length,
    totalCapacityLakhLiters: waterTanks.reduce(
      (sum, tank) => sum + tank.capacityLakhLiters,
      0,
    ),
    esrCount: waterTanks.filter((tank) => tank.type === "ESR").length,
    gsrCount: waterTanks.filter((tank) => tank.type === "GSR").length,
    sumpCount: waterTanks.filter((tank) => tank.type === "Sump").length,
    totalWards: new Set(waterTanks.map((tank) => tank.ward)).size,
  };
}

export function getTopCapacityTanks(waterTanks: WaterTank[], limit = 5) {
  return [...waterTanks]
    .sort((a, b) => b.capacityLakhLiters - a.capacityLakhLiters)
    .slice(0, limit);
}

export async function getTankAreaSuggestions(): Promise<TankAreaSuggestion[]> {
  try {
    const supabase = await createClient();
    const { data, error } = await (supabase as any)
      .from("tank_areas")
      .select("*")
      .order("tank_id", { ascending: true })
      .order("priority_rank", { ascending: true });

    if (error || !data || data.length === 0) {
      if (error) {
        console.warn("Could not load tank areas from Supabase, using fallback suggestions:", error.message);
      }
      return FALLBACK_TANK_AREAS;
    }

    return ((data ?? []) as Array<any>).map((row) => ({
      id: row.id,
      tankId: row.tank_id,
      areaName: row.area_name,
      etaMinutes: row.eta_minutes,
      durationMinutes: row.duration_minutes,
      pressureLevel: row.pressure_level,
      priorityRank: row.priority_rank,
    })) satisfies TankAreaSuggestion[];
  } catch (err) {
    console.warn("Supabase connection error in getTankAreaSuggestions, using fallback suggestions:", err);
    return FALLBACK_TANK_AREAS;
  }
}
