import { FrontendHeader } from "@/components/FrontendHeader";
import { ComplaintForm } from "@/components/ComplaintForm";
import { getWaterTanks } from "@/services/tanks";

type ComplaintsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComplaintsPage({ searchParams }: ComplaintsPageProps) {
  const tanks = await getWaterTanks();
  const query = (await searchParams) ?? {};
  const phone = typeof query.phone === "string" ? query.phone : undefined;
  const tankId =
    typeof query.tank === "string" && !Number.isNaN(Number(query.tank))
      ? Number(query.tank)
      : undefined;
  const channel =
    query.channel === "whatsapp" ? "whatsapp" : "web";

  return (
    <main className="min-h-screen bg-[#f2f5f9] text-[#1a2535]">
      <FrontendHeader active="complaints" />
      <div className="mx-auto w-full max-w-[960px] px-6 py-10">
        <div className="mb-6 space-y-2">
          <h1 className="text-3xl font-semibold">Feedback / Complaint</h1>
          <p className="text-sm text-[#6b7a94]">
            Raise a complaint related to water supply or a specific tank. You can
            also upload an image for better support resolution.
          </p>
        </div>

        <ComplaintForm
          tanks={tanks.map((tank) => ({
            id: tank.id,
            name: tank.name,
            ward: tank.ward,
          }))}
          initialPhoneNumber={phone}
          initialTankId={tankId}
          initialChannel={channel}
        />
      </div>
    </main>
  );
}
