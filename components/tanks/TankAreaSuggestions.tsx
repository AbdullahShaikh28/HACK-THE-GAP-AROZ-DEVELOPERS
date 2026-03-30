import type { TankAreaSuggestion, WaterTank } from "@/services/tanks";

type TankAreaSuggestionsProps = {
  tanks: WaterTank[];
  suggestions: TankAreaSuggestion[];
};

const pressureBadge: Record<"low" | "medium" | "high", string> = {
  low: "bg-red-50 text-red-700 border-red-200",
  medium: "bg-amber-50 text-amber-700 border-amber-200",
  high: "bg-emerald-50 text-emerald-700 border-emerald-200",
};

export function TankAreaSuggestions({ tanks, suggestions }: TankAreaSuggestionsProps) {
  const topTanks = [...tanks]
    .sort((a, b) => b.capacityLakhLiters - a.capacityLakhLiters)
    .slice(0, 3);

  return (
    <section className="mt-8 rounded-[14px] border border-[#dce4ef] bg-white p-6 shadow-[0_2px_8px_rgba(26,58,110,0.10)]">
      <div className="mb-4 flex items-center gap-2">
        <p className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#e8610a]">
          Tank-wise Nearby Areas
        </p>
        <span className="h-px flex-1 bg-[#dce4ef]" />
      </div>

      <div className="space-y-5">
        {topTanks.map((tank) => {
          const tankAreas = suggestions
            .filter((item) => item.tankId === tank.id)
            .slice(0, 6);

          return (
            <div key={tank.id} className="rounded-lg border border-[#dce4ef] bg-[#f9fbff] p-4">
              <p className="text-sm font-semibold text-[#1a3a6e]">
                {tank.name} ({tank.type}) - {tank.ward}
              </p>

              <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
                {tankAreas.map((area) => (
                  <div
                    key={area.id}
                    className="rounded-md border border-[#dce4ef] bg-white p-3"
                  >
                    <p className="text-sm font-semibold text-[#1a2535]">{area.areaName}</p>
                    <p className="mt-1 text-xs text-[#6b7a94]">
                      Arrival: {area.etaMinutes} min
                    </p>
                    <p className="text-xs text-[#6b7a94]">
                      Duration: {area.durationMinutes} min
                    </p>
                    <span
                      className={`mt-2 inline-flex rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase ${pressureBadge[area.pressureLevel]}`}
                    >
                      {area.pressureLevel} pressure
                    </span>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
