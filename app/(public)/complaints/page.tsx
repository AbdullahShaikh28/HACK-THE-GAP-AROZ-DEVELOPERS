import Link from "next/link";
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
        <div className="mb-8 space-y-2">
          <h1 className="text-3xl font-semibold">Complaint</h1>
          <p className="text-sm text-[#6b7a94]">
            Report a service or distribution issue. Submissions are stored as complaints for follow-up.
            For supply observations only, use the separate{" "}
            <Link href="/supply-report" className="font-semibold text-[#1a3a6e] underline-offset-2 hover:underline">
              supply report
            </Link>{" "}
            page.
          </p>
        </div>

        <section className="space-y-3">
          <h2 className="text-lg font-semibold text-[#1a2535]">Submit a complaint</h2>
          <p className="text-sm text-[#6b7a94]">
            Stored as <code className="rounded bg-[#eef2f8] px-1">complaint</code> in complaints.
          </p>
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
        </section>
      </div>
    </main>
  );
}
