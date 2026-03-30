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

export async function getWaterTanks() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("water_tanks")
    .select("*")
    .order("id", { ascending: true });

  if (error) {
    throw new Error(`Failed to load tanks: ${error.message}`);
  }

  return ((data ?? []) as Array<any>).map((row) => {
    const total = Number(row.capacity_lakh_liters ?? 0);
    const used = Number(row.capacity_used_lakh_liters ?? 0);

    return {
      id: row.id,
      name: row.name,
      type: row.type,
      capacityLakhLiters: total,
      capacityUsedLakhLiters: used,
      // Keep frontend display consistent: available is derived from total-used.
      capacityAvailableLakhLiters: Math.max(0, total - used),
      latitude: row.latitude,
      longitude: row.longitude,
      ward: row.ward,
      areaAddress: row.area_address,
    };
  }) satisfies WaterTank[];
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

export async function getTankAreaSuggestions() {
  const supabase = await createClient();
  const { data, error } = await (supabase as any)
    .from("tank_areas")
    .select("*")
    .order("tank_id", { ascending: true })
    .order("priority_rank", { ascending: true });

  if (error) {
    throw new Error(`Failed to load tank areas: ${error.message}`);
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
}
