import { TanksMapHeatmapDynamic } from "@/components/tanks/TanksMapHeatmapDynamic";
import { getWaterTanks } from "@/services/tanks";

export default async function DashboardMapPage() {
  const waterTanks = await getWaterTanks();

  return (
    <div className="flex max-w-full flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Map view</h1>
        <p className="text-sm text-muted">
          Stress heatmap by available capacity across all tanks. Click markers for tank details.
        </p>
      </div>

      <TanksMapHeatmapDynamic tanks={waterTanks} />
    </div>
  );
}
