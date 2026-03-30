export type WaterTank = {
  id: number;
  name: string;
  type: "ESR" | "GSR" | "Sump";
  capacityLakhLiters: number;
  latitude: number;
  longitude: number;
  ward: string;
  areaAddress: string;
};

type RawWaterTank = Omit<WaterTank, "areaAddress">;

function formatAreaAddress(name: string, ward: string) {
  const cleanWard = ward.replace(/\s+Ward$/i, "");
  const areaFromName = name
    .replace(/\s+Tank$/i, "")
    .replace(/\s+\d+$/i, "")
    .replace(/\s+\((?:New|Old|AUR-\d+)\)$/i, "")
    .trim();

  if (areaFromName.toLowerCase().includes(cleanWard.toLowerCase())) {
    return `${areaFromName}, Chhatrapati Sambhajinagar`;
  }

  return `${areaFromName}, ${cleanWard}, Chhatrapati Sambhajinagar`;
}

const rawWaterTanks: RawWaterTank[] = [
  {
    id: 1,
    name: "Nakshatrawadi Tank 1",
    type: "GSR",
    capacityLakhLiters: 65,
    latitude: 19.915,
    longitude: 75.352,
    ward: "Nakshatrawadi Ward",
  },
  {
    id: 2,
    name: "Nakshatrawadi Tank 2",
    type: "GSR",
    capacityLakhLiters: 48,
    latitude: 19.916,
    longitude: 75.353,
    ward: "Nakshatrawadi Ward",
  },
  {
    id: 3,
    name: "Nakshatrawadi Tank 3",
    type: "GSR",
    capacityLakhLiters: 25,
    latitude: 19.917,
    longitude: 75.354,
    ward: "Nakshatrawadi Ward",
  },
  {
    id: 4,
    name: "Shahnoorwadi Tank",
    type: "ESR",
    capacityLakhLiters: 20,
    latitude: 19.89,
    longitude: 75.34,
    ward: "Shahnoorwadi Ward",
  },
  {
    id: 5,
    name: "CIDCO N-1 Tank",
    type: "ESR",
    capacityLakhLiters: 15,
    latitude: 19.87,
    longitude: 75.34,
    ward: "CIDCO Ward",
  },
  {
    id: 6,
    name: "CIDCO N-2 Tank",
    type: "ESR",
    capacityLakhLiters: 15,
    latitude: 19.872,
    longitude: 75.342,
    ward: "CIDCO Ward",
  },
  {
    id: 7,
    name: "CIDCO N-4 Tank",
    type: "ESR",
    capacityLakhLiters: 18,
    latitude: 19.874,
    longitude: 75.344,
    ward: "CIDCO Ward",
  },
  {
    id: 8,
    name: "N-6 (AUR-1)",
    type: "ESR",
    capacityLakhLiters: 11,
    latitude: 19.876,
    longitude: 75.343,
    ward: "CIDCO Ward",
  },
  {
    id: 9,
    name: "N-6 (AUR-2)",
    type: "ESR",
    capacityLakhLiters: 14,
    latitude: 19.877,
    longitude: 75.345,
    ward: "CIDCO Ward",
  },
  {
    id: 10,
    name: "N-6 (AUR-3)",
    type: "ESR",
    capacityLakhLiters: 15,
    latitude: 19.878,
    longitude: 75.346,
    ward: "CIDCO Ward",
  },
  {
    id: 11,
    name: "N-6 Sump",
    type: "Sump",
    capacityLakhLiters: 20,
    latitude: 19.876,
    longitude: 75.344,
    ward: "CIDCO Ward",
  },
  {
    id: 12,
    name: "Satara Area Tank",
    type: "ESR",
    capacityLakhLiters: 18,
    latitude: 19.86,
    longitude: 75.36,
    ward: "Satara Ward",
  },
  {
    id: 13,
    name: "Mukundwadi Tank",
    type: "ESR",
    capacityLakhLiters: 20,
    latitude: 19.876,
    longitude: 75.372,
    ward: "Mukundwadi Ward",
  },
  {
    id: 14,
    name: "Bajajnagar Tank",
    type: "ESR",
    capacityLakhLiters: 22,
    latitude: 19.84,
    longitude: 75.38,
    ward: "Bajajnagar Ward",
  },
  {
    id: 15,
    name: "Waluj Tank",
    type: "ESR",
    capacityLakhLiters: 25,
    latitude: 19.838,
    longitude: 75.397,
    ward: "Waluj Ward",
  },
  {
    id: 16,
    name: "Beed Bypass Tank",
    type: "ESR",
    capacityLakhLiters: 18,
    latitude: 19.89,
    longitude: 75.36,
    ward: "Beed Bypass Ward",
  },
  {
    id: 17,
    name: "Railway Station Tank",
    type: "GSR",
    capacityLakhLiters: 30,
    latitude: 19.876,
    longitude: 75.346,
    ward: "Station Ward",
  },
  {
    id: 18,
    name: "Osmanpura Tank",
    type: "ESR",
    capacityLakhLiters: 18,
    latitude: 19.885,
    longitude: 75.335,
    ward: "Osmanpura Ward",
  },
  {
    id: 19,
    name: "Kranti Chowk Tank",
    type: "GSR",
    capacityLakhLiters: 20,
    latitude: 19.883,
    longitude: 75.33,
    ward: "Kranti Chowk Ward",
  },
  {
    id: 20,
    name: "Ulkanagari Tank",
    type: "ESR",
    capacityLakhLiters: 15,
    latitude: 19.868,
    longitude: 75.343,
    ward: "Ulkanagari Ward",
  },
  {
    id: 21,
    name: "Garkheda Tank",
    type: "ESR",
    capacityLakhLiters: 18,
    latitude: 19.866,
    longitude: 75.35,
    ward: "Garkheda Ward",
  },
  {
    id: 22,
    name: "Jawahar Colony Tank",
    type: "ESR",
    capacityLakhLiters: 15,
    latitude: 19.87,
    longitude: 75.355,
    ward: "Jawahar Colony Ward",
  },
  {
    id: 23,
    name: "Town Hall Tank",
    type: "GSR",
    capacityLakhLiters: 25,
    latitude: 19.884,
    longitude: 75.328,
    ward: "Town Hall Ward",
  },
  {
    id: 24,
    name: "Delhi Gate (New)",
    type: "GSR",
    capacityLakhLiters: 14,
    latitude: 19.884,
    longitude: 75.327,
    ward: "Old City Ward",
  },
  {
    id: 25,
    name: "Delhi Gate (Old)",
    type: "GSR",
    capacityLakhLiters: 18,
    latitude: 19.883,
    longitude: 75.326,
    ward: "Old City Ward",
  },
  {
    id: 26,
    name: "Harsul",
    type: "ESR",
    capacityLakhLiters: 26,
    latitude: 19.922,
    longitude: 75.319,
    ward: "Harsul Ward",
  },
  {
    id: 27,
    name: "Harsul Gaon (New)",
    type: "ESR",
    capacityLakhLiters: 8,
    latitude: 19.924,
    longitude: 75.318,
    ward: "Harsul Ward",
  },
  {
    id: 28,
    name: "Harsul Gaon (Old)",
    type: "ESR",
    capacityLakhLiters: 5,
    latitude: 19.923,
    longitude: 75.317,
    ward: "Harsul Ward",
  },
  {
    id: 29,
    name: "Harsul Jail",
    type: "ESR",
    capacityLakhLiters: 10,
    latitude: 19.925,
    longitude: 75.32,
    ward: "Harsul Ward",
  },
  {
    id: 30,
    name: "N-7 (AUR-1)",
    type: "ESR",
    capacityLakhLiters: 11,
    latitude: 19.88,
    longitude: 75.35,
    ward: "CIDCO Ward",
  },
  {
    id: 31,
    name: "N-7 (AUR-2)",
    type: "ESR",
    capacityLakhLiters: 14,
    latitude: 19.881,
    longitude: 75.351,
    ward: "CIDCO Ward",
  },
  {
    id: 32,
    name: "N-7 (AUR-3)",
    type: "ESR",
    capacityLakhLiters: 15,
    latitude: 19.882,
    longitude: 75.352,
    ward: "CIDCO Ward",
  },
  {
    id: 33,
    name: "N-7 Sump",
    type: "Sump",
    capacityLakhLiters: 20,
    latitude: 19.88,
    longitude: 75.351,
    ward: "CIDCO Ward",
  },
  {
    id: 34,
    name: "Harsool Extension Tank",
    type: "ESR",
    capacityLakhLiters: 16,
    latitude: 19.926,
    longitude: 75.322,
    ward: "Harsul Ward",
  },
  {
    id: 35,
    name: "Chikalthana Tank",
    type: "ESR",
    capacityLakhLiters: 20,
    latitude: 19.87,
    longitude: 75.38,
    ward: "Chikalthana Ward",
  },
  {
    id: 36,
    name: "Airport Area Tank",
    type: "ESR",
    capacityLakhLiters: 18,
    latitude: 19.862,
    longitude: 75.395,
    ward: "Airport Ward",
  },
  {
    id: 37,
    name: "MIT College Tank",
    type: "ESR",
    capacityLakhLiters: 12,
    latitude: 19.865,
    longitude: 75.365,
    ward: "MIT Ward",
  },
  {
    id: 38,
    name: "Padegaon Tank",
    type: "ESR",
    capacityLakhLiters: 17,
    latitude: 19.895,
    longitude: 75.31,
    ward: "Padegaon Ward",
  },
  {
    id: 39,
    name: "Cantonment Tank",
    type: "GSR",
    capacityLakhLiters: 22,
    latitude: 19.9,
    longitude: 75.3,
    ward: "Cantonment Ward",
  },
];

export const waterTanks: WaterTank[] = rawWaterTanks.map((tank) => ({
  ...tank,
  areaAddress: formatAreaAddress(tank.name, tank.ward),
}));

export const waterTankSummary = {
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

export const topCapacityTanks = [...waterTanks]
  .sort((a, b) => b.capacityLakhLiters - a.capacityLakhLiters)
  .slice(0, 5);
