import { Montserrat, Noto_Sans, Tiro_Devanagari_Hindi } from "next/font/google";
import { FrontendHeader } from "@/components/FrontendHeader";
import { TanksInventory } from "@/components/TanksInventory";
import {
  topCapacityTanks,
  waterTanks,
  waterTankSummary,
} from "@/services/tanks";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800", "900"],
  variable: "--font-montserrat",
});

const notoSans = Noto_Sans({
  subsets: ["latin"],
  weight: ["400", "600", "700"],
  variable: "--font-noto-sans",
});

const tiro = Tiro_Devanagari_Hindi({
  subsets: ["latin"],
  weight: ["400"],
  variable: "--font-tiro",
});

export default function TanksPage() {
  return (
    <main
      className={`${montserrat.variable} ${notoSans.variable} ${tiro.variable} min-h-screen bg-[#f2f5f9] text-[#1a2535]`}
      style={{ fontFamily: "var(--font-noto-sans)" }}
    >
      <FrontendHeader active="tanks" />

      <section className="relative overflow-hidden bg-[linear-gradient(135deg,#1a3a6e_0%,#1e4d8c_55%,#0f2a52_100%)] px-6 py-10 text-white">
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_600px_300px_at_80%_50%,rgba(232,97,10,0.18)_0%,transparent_70%)]" />
        <div className="relative mx-auto max-w-[1280px]">
          <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-[#e8610a]/50 bg-[#e8610a]/20 px-4 py-1 text-[11px] font-bold uppercase tracking-[1px] text-[#f5a623]">
            <span className="text-[8px]">●</span>
            Live Tank Monitoring
          </div>

          <h1
            className="text-[28px] font-extrabold tracking-[-0.3px]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            Aurangabad AMC <span className="text-[#f5a623]">Water Tanks</span>
          </h1>
          <p className="mt-2 max-w-[560px] text-[13.5px] leading-7 text-white/70">
            Dedicated frontend view for the tank inventory extracted from your
            uploaded PDF. This page uses the AMC theme without reusing the
            dashboard layout.
          </p>

          <div className="mt-6 flex flex-wrap gap-6 text-xs text-white/60">
            <div>
              <span className="font-semibold text-white/85">
                {waterTankSummary.totalTanks}
              </span>{" "}
              Active Tanks
            </div>
            <div>
              <span className="font-semibold text-white/85">
                {waterTankSummary.totalWards}
              </span>{" "}
              Wards Covered
            </div>
            <div>
              <span className="font-semibold text-white/85">
                {waterTankSummary.totalCapacityLakhLiters} LL
              </span>{" "}
              Total Capacity
            </div>
            <div>
              <span className="font-semibold text-white/85">
                {waterTankSummary.esrCount} ESR / {waterTankSummary.gsrCount} GSR
              </span>{" "}
              Tank Types
            </div>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-[1280px] px-6 pb-16 pt-8">
        <section className="relative overflow-hidden rounded-[14px] border border-[#dce4ef] bg-white px-7 py-6 shadow-[0_2px_8px_rgba(26,58,110,0.10)]">
          <span className="absolute left-0 top-0 h-full w-[5px] rounded-l-[14px] bg-[linear-gradient(180deg,#e8610a,#f5a623)]" />

          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p
                className="mb-1 text-[11px] font-bold uppercase tracking-[1.2px] text-[#e8610a]"
                style={{ fontFamily: "var(--font-montserrat)" }}
              >
                Dataset Summary
              </p>
              <p className="max-w-[420px] text-[12.5px] text-[#6b7a94]">
                The dataset includes 39 tanks with type, capacity, inferred area
                address, and ward coverage information.
              </p>
            </div>
            <p className="max-w-[320px] rounded-lg border border-[#dce4ef] bg-[#f2f5f9] px-4 py-3 text-[11.5px] leading-5 text-[#6b7a94]">
              Source note: capacities come from the PDF, while location mapping
              is derived from the provided ward and tank naming details.
            </p>
          </div>

          <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {[
              {
                icon: "🏗️",
                label: "Total Tanks",
                value: `${waterTankSummary.totalTanks}`,
                caption: "Across the distribution network",
                color: "#1a3a6e",
              },
              {
                icon: "💧",
                label: "Total Capacity",
                value: `${waterTankSummary.totalCapacityLakhLiters} LL`,
                caption: "Lakh litres across the listed network",
                color: "#e8610a",
              },
              {
                icon: "🔢",
                label: "Tank Types",
                value: `${waterTankSummary.esrCount + waterTankSummary.gsrCount + waterTankSummary.sumpCount}`,
                caption: `${waterTankSummary.esrCount} ESR / ${waterTankSummary.gsrCount} GSR / ${waterTankSummary.sumpCount} Sump`,
                color: "#1e7e34",
              },
              {
                icon: "🏘️",
                label: "Covered Wards",
                value: `${waterTankSummary.totalWards}`,
                caption: "Municipal ward coverage",
                color: "#f5a623",
              },
            ].map((stat) => (
              <div
                key={stat.label}
                className="relative overflow-hidden rounded-[10px] border border-[#dce4ef] bg-[#f2f5f9] px-4 py-4"
              >
                <p className="mb-2 text-xl">{stat.icon}</p>
                <p className="mb-1 text-[10.5px] font-bold uppercase tracking-[0.8px] text-[#6b7a94]">
                  {stat.label}
                </p>
                <p
                  className="font-[var(--font-montserrat)] text-[30px] font-extrabold leading-none"
                  style={{ color: stat.color }}
                >
                  {stat.value}
                </p>
                <p className="mt-1 text-[11px] text-[#6b7a94]">{stat.caption}</p>
                <span
                  className="absolute bottom-0 left-0 h-[3px] w-full"
                  style={{ backgroundColor: stat.color }}
                />
              </div>
            ))}
          </div>
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center gap-2">
            <p
              className="text-[11px] font-bold uppercase tracking-[1.2px] text-[#e8610a]"
              style={{ fontFamily: "var(--font-montserrat)" }}
            >
              Highest Capacity Tanks
            </p>
            <span className="h-px flex-1 bg-[#dce4ef]" />
          </div>

          <div className="flex flex-wrap gap-3">
            {topCapacityTanks.map((tank, index) => (
              <div
                key={tank.id}
                className={[
                  "relative flex min-w-[180px] flex-1 items-center gap-3 overflow-hidden rounded-[10px] border-[1.5px] px-4 py-3 shadow-[0_2px_8px_rgba(26,58,110,0.10)] transition duration-200 hover:-translate-y-0.5 hover:shadow-[0_4px_20px_rgba(26,58,110,0.14)]",
                  index === 0
                    ? "border-[#f5a623] bg-[linear-gradient(135deg,#fffbf0,#fff)]"
                    : "border-[#dce4ef] bg-white",
                ].join(" ")}
              >
                <div
                  className="flex h-[46px] w-[46px] flex-shrink-0 flex-col items-center justify-center rounded-full text-white shadow-[0_2px_8px_rgba(26,58,110,0.25)]"
                  style={{
                    background:
                      index === 0
                        ? "linear-gradient(135deg,#b8860b,#f5a623)"
                        : "#1a3a6e",
                    fontFamily: "var(--font-montserrat)",
                  }}
                >
                  <span className="text-[15px] font-extrabold leading-none">
                    {tank.capacityLakhLiters}
                  </span>
                  <span className="text-[8px] font-semibold opacity-75">LL</span>
                </div>
                <div>
                  <p className="text-[12.5px] font-bold text-[#1a2535]">
                    {tank.name}
                  </p>
                  <p className="text-[11px] text-[#6b7a94]">
                    {tank.ward} · {tank.type}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <TanksInventory tanks={waterTanks} />
      </div>
    </main>
  );
}
