import type { WaterTank, TankAreaSuggestion } from "./tanks";

export const FALLBACK_WATER_TANKS_DATA = [
  { id: 1, name: "Nakshatrawadi Tank 1", type: "GSR" as const, capacity: 65, lat: 19.915, lng: 75.352, ward: "Nakshatrawadi Ward", addr: "Nakshatrawadi, Chhatrapati Sambhajinagar" },
  { id: 2, name: "Nakshatrawadi Tank 2", type: "GSR" as const, capacity: 48, lat: 19.916, lng: 75.353, ward: "Nakshatrawadi Ward", addr: "Nakshatrawadi, Chhatrapati Sambhajinagar" },
  { id: 3, name: "Nakshatrawadi Tank 3", type: "GSR" as const, capacity: 25, lat: 19.917, lng: 75.354, ward: "Nakshatrawadi Ward", addr: "Nakshatrawadi, Chhatrapati Sambhajinagar" },
  { id: 4, name: "Shahnoorwadi Tank", type: "ESR" as const, capacity: 20, lat: 19.89, lng: 75.34, ward: "Shahnoorwadi Ward", addr: "Shahnoorwadi, Chhatrapati Sambhajinagar" },
  { id: 5, name: "CIDCO N-1 Tank", type: "ESR" as const, capacity: 15, lat: 19.87, lng: 75.34, ward: "CIDCO Ward", addr: "CIDCO N-1, Chhatrapati Sambhajinagar" },
  { id: 6, name: "CIDCO N-2 Tank", type: "ESR" as const, capacity: 15, lat: 19.872, lng: 75.342, ward: "CIDCO Ward", addr: "CIDCO N-2, Chhatrapati Sambhajinagar" },
  { id: 7, name: "CIDCO N-4 Tank", type: "ESR" as const, capacity: 18, lat: 19.874, lng: 75.344, ward: "CIDCO Ward", addr: "CIDCO N-4, Chhatrapati Sambhajinagar" },
  { id: 8, name: "N-6 (AUR-1)", type: "ESR" as const, capacity: 11, lat: 19.876, lng: 75.343, ward: "CIDCO Ward", addr: "N-6, CIDCO, Chhatrapati Sambhajinagar" },
  { id: 9, name: "N-6 (AUR-2)", type: "ESR" as const, capacity: 14, lat: 19.877, lng: 75.345, ward: "CIDCO Ward", addr: "N-6, CIDCO, Chhatrapati Sambhajinagar" },
  { id: 10, name: "N-6 (AUR-3)", type: "ESR" as const, capacity: 15, lat: 19.878, lng: 75.346, ward: "CIDCO Ward", addr: "N-6, CIDCO, Chhatrapati Sambhajinagar" },
  { id: 11, name: "N-6 Sump", type: "Sump" as const, capacity: 20, lat: 19.876, lng: 75.344, ward: "CIDCO Ward", addr: "N-6 Sump, CIDCO, Chhatrapati Sambhajinagar" },
  { id: 12, name: "Satara Area Tank", type: "ESR" as const, capacity: 18, lat: 19.86, lng: 75.36, ward: "Satara Ward", addr: "Satara Area, Chhatrapati Sambhajinagar" },
  { id: 13, name: "Mukundwadi Tank", type: "ESR" as const, capacity: 20, lat: 19.876, lng: 75.372, ward: "Mukundwadi Ward", addr: "Mukundwadi, Chhatrapati Sambhajinagar" },
  { id: 14, name: "Bajajnagar Tank", type: "ESR" as const, capacity: 22, lat: 19.84, lng: 75.38, ward: "Bajajnagar Ward", addr: "Bajajnagar, Chhatrapati Sambhajinagar" },
  { id: 15, name: "Waluj Tank", type: "ESR" as const, capacity: 25, lat: 19.838, lng: 75.397, ward: "Waluj Ward", addr: "Waluj, Chhatrapati Sambhajinagar" },
  { id: 16, name: "Beed Bypass Tank", type: "ESR" as const, capacity: 18, lat: 19.89, lng: 75.36, ward: "Beed Bypass Ward", addr: "Beed Bypass, Chhatrapati Sambhajinagar" },
  { id: 17, name: "Railway Station Tank", type: "GSR" as const, capacity: 30, lat: 19.876, lng: 75.346, ward: "Station Ward", addr: "Railway Station, Station, Chhatrapati Sambhajinagar" },
  { id: 18, name: "Osmanpura Tank", type: "ESR" as const, capacity: 18, lat: 19.885, lng: 75.335, ward: "Osmanpura Ward", addr: "Osmanpura, Chhatrapati Sambhajinagar" },
  { id: 19, name: "Kranti Chowk Tank", type: "GSR" as const, capacity: 20, lat: 19.883, lng: 75.33, ward: "Kranti Chowk Ward", addr: "Kranti Chowk, Chhatrapati Sambhajinagar" },
  { id: 20, name: "Ulkanagari Tank", type: "ESR" as const, capacity: 15, lat: 19.868, lng: 75.343, ward: "Ulkanagari Ward", addr: "Ulkanagari, Chhatrapati Sambhajinagar" },
  { id: 21, name: "Garkheda Tank", type: "ESR" as const, capacity: 18, lat: 19.866, lng: 75.35, ward: "Garkheda Ward", addr: "Garkheda, Chhatrapati Sambhajinagar" },
  { id: 22, name: "Jawahar Colony Tank", type: "ESR" as const, capacity: 15, lat: 19.87, lng: 75.355, ward: "Jawahar Colony Ward", addr: "Jawahar Colony, Chhatrapati Sambhajinagar" },
  { id: 23, name: "Town Hall Tank", type: "GSR" as const, capacity: 25, lat: 19.884, lng: 75.328, ward: "Town Hall Ward", addr: "Town Hall, Chhatrapati Sambhajinagar" },
  { id: 24, name: "Delhi Gate (New)", type: "GSR" as const, capacity: 14, lat: 19.884, lng: 75.327, ward: "Old City Ward", addr: "Delhi Gate, Old City, Chhatrapati Sambhajinagar" },
  { id: 25, name: "Delhi Gate (Old)", type: "GSR" as const, capacity: 18, lat: 19.883, lng: 75.326, ward: "Old City Ward", addr: "Delhi Gate, Old City, Chhatrapati Sambhajinagar" },
  { id: 26, name: "Harsul", type: "ESR" as const, capacity: 26, lat: 19.922, lng: 75.319, ward: "Harsul Ward", addr: "Harsul, Chhatrapati Sambhajinagar" },
  { id: 27, name: "Harsul Gaon (New)", type: "ESR" as const, capacity: 8, lat: 19.924, lng: 75.318, ward: "Harsul Ward", addr: "Harsul Gaon, Chhatrapati Sambhajinagar" },
  { id: 28, name: "Harsul Gaon (Old)", type: "ESR" as const, capacity: 5, lat: 19.923, lng: 75.317, ward: "Harsul Ward", addr: "Harsul Gaon, Chhatrapati Sambhajinagar" },
  { id: 29, name: "Harsul Jail", type: "ESR" as const, capacity: 10, lat: 19.925, lng: 75.32, ward: "Harsul Ward", addr: "Harsul Jail, Chhatrapati Sambhajinagar" },
  { id: 30, name: "N-7 (AUR-1)", type: "ESR" as const, capacity: 11, lat: 19.88, lng: 75.35, ward: "CIDCO Ward", addr: "N-7, CIDCO, Chhatrapati Sambhajinagar" },
  { id: 31, name: "N-7 (AUR-2)", type: "ESR" as const, capacity: 14, lat: 19.881, lng: 75.351, ward: "CIDCO Ward", addr: "N-7, CIDCO, Chhatrapati Sambhajinagar" },
  { id: 32, name: "N-7 (AUR-3)", type: "ESR" as const, capacity: 15, lat: 19.882, lng: 75.352, ward: "CIDCO Ward", addr: "N-7, CIDCO, Chhatrapati Sambhajinagar" },
  { id: 33, name: "N-7 Sump", type: "Sump" as const, capacity: 20, lat: 19.88, lng: 75.351, ward: "CIDCO Ward", addr: "N-7 Sump, CIDCO, Chhatrapati Sambhajinagar" },
  { id: 34, name: "Harsool Extension Tank", type: "ESR" as const, capacity: 16, lat: 19.926, lng: 75.322, ward: "Harsul Ward", addr: "Harsool Extension, Harsul, Chhatrapati Sambhajinagar" },
  { id: 35, name: "Chikalthana Tank", type: "ESR" as const, capacity: 20, lat: 19.87, lng: 75.38, ward: "Chikalthana Ward", addr: "Chikalthana, Chhatrapati Sambhajinagar" },
  { id: 36, name: "Airport Area Tank", type: "ESR" as const, capacity: 18, lat: 19.862, lng: 75.395, ward: "Airport Ward", addr: "Airport Area, Airport, Chhatrapati Sambhajinagar" },
  { id: 37, name: "MIT College Tank", type: "ESR" as const, capacity: 12, lat: 19.865, lng: 75.365, ward: "MIT Ward", addr: "MIT College, MIT, Chhatrapati Sambhajinagar" },
  { id: 38, name: "Padegaon Tank", type: "ESR" as const, capacity: 17, lat: 19.895, lng: 75.31, ward: "Padegaon Ward", addr: "Padegaon, Chhatrapati Sambhajinagar" },
  { id: 39, name: "Cantonment Tank", type: "GSR" as const, capacity: 22, lat: 19.9, lng: 75.3, ward: "Cantonment Ward", addr: "Cantonment, Chhatrapati Sambhajinagar" },
];

export const FALLBACK_WATER_TANKS: WaterTank[] = FALLBACK_WATER_TANKS_DATA.map((t, idx) => {
  const used = Math.round(t.capacity * 0.45 * 10) / 10;
  return {
    id: t.id,
    name: t.name,
    type: t.type,
    capacityLakhLiters: t.capacity,
    capacityUsedLakhLiters: used,
    capacityAvailableLakhLiters: Math.max(0, t.capacity - used),
    latitude: t.lat,
    longitude: t.lng,
    ward: t.ward,
    areaAddress: t.addr,
    scheduled: idx % 3 === 0,
    nextScheduledAtIso: null,
  };
});

export const FALLBACK_TANK_AREAS: TankAreaSuggestion[] = FALLBACK_WATER_TANKS_DATA.flatMap((tank) => {
  const baseName = tank.addr.replace(/,.*$/, "");
  return [1, 2, 3, 4, 5, 6].map((i) => ({
    id: tank.id * 10 + i,
    tankId: tank.id,
    areaName: `${baseName} Zone ${i}`,
    etaMinutes: i * 15,
    durationMinutes: i in [1, 2] ? 45 : i in [3, 4] ? 35 : 25,
    pressureLevel: (i in [1, 2] ? "high" : i in [3, 4] ? "medium" : "low") as "low" | "medium" | "high",
    priorityRank: i,
  }));
});
