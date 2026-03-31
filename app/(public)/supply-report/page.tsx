import { FrontendHeader } from "@/components/FrontendHeader";
import { SupplyReportForm } from "@/components/SupplyReportForm";
import { getWaterTanks } from "@/services/tanks";

type SupplyReportPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function SupplyReportPage({
  searchParams,
}: SupplyReportPageProps) {
  const tanks = await getWaterTanks();
  const query = (await searchParams) ?? {};
  const phone = typeof query.phone === "string" ? query.phone : undefined;
  const tankId =
    typeof query.tank === "string" && !Number.isNaN(Number(query.tank))
      ? Number(query.tank)
      : undefined;
  const channel = query.channel === "whatsapp" ? "whatsapp" : "web";

  return (
    <main className="flex flex-1 flex-col bg-[#f2f5f9] text-[#1a2535]">
      <FrontendHeader active="supply_report" />
      <div className="mx-auto w-full max-w-[960px] px-6 py-10">
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold">Supply report</h1>
          <p className="text-sm text-[#6b7a94]">
            Share what you observed about supply timing or pressure. Submissions are saved in{" "}
            <code className="rounded bg-[#eef2f8] px-1">field_surveys</code> with kind{" "}
            <code className="rounded bg-[#eef2f8] px-1">supply_report</code> (same table as staff
            field surveys).
          </p>
        </div>

        <SupplyReportForm
          tanks={tanks.map((tank) => ({
            id: tank.id,
            name: tank.name,
            ward: tank.ward,
            latitude: tank.latitude,
            longitude: tank.longitude,
          }))}
          initialPhoneNumber={phone}
          initialTankId={tankId}
          initialChannel={channel}
        />
      </div>
    </main>
  );
}

