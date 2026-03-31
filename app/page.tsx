import { FrontendFooter } from "@/components/FrontendFooter";
import { FrontendHeader } from "@/components/FrontendHeader";
import { HomeOverview } from "@/components/HomeOverview";
import { createClient } from "@/lib/supabase/server";
import { getHomeScheduledTanksForUser } from "@/services/valve-schedules";

export default async function HomePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const scheduledRows = await getHomeScheduledTanksForUser(user?.id ?? null);

  return (
    <div className="flex min-h-screen flex-col bg-[#f2f5f9] text-[#1a2535]">
      <main className="flex-1">
        <FrontendHeader active="home" />
        <HomeOverview scheduledRows={scheduledRows} />
      </main>
      <FrontendFooter />
    </div>
  );
}
