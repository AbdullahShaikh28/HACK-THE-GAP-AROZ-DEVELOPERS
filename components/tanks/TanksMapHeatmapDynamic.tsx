"use client";

import dynamic from "next/dynamic";
import type { WaterTank } from "@/services/tanks";

const TanksMapHeatmap = dynamic(
  () => import("./TanksMapHeatmap").then((m) => m.TanksMapHeatmap),
  { ssr: false, loading: () => <MapLoading /> },
);

function MapLoading() {
  return (
    <div className="flex h-[min(72vh,640px)] items-center justify-center rounded-[14px] border border-[#dce4ef] bg-[#f2f5f9] text-sm text-[#6b7a94]">
      Loading map…
    </div>
  );
}

export function TanksMapHeatmapDynamic({ tanks }: { tanks: WaterTank[] }) {
  return <TanksMapHeatmap tanks={tanks} />;
}
