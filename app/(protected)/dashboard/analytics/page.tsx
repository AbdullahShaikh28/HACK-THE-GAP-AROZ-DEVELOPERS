import { AnalyticsDashboard } from "@/components/dashboard/analytics/AnalyticsDashboard";
import { getAnalyticsSnapshot } from "@/services/analytics";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import Link from "next/link";
import { Suspense } from "react";

type AnalyticsPageProps = {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
};

export default async function AnalyticsPage({ searchParams }: AnalyticsPageProps) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Card>
        <p className="text-sm text-muted">Sign in to view analytics.</p>
      </Card>
    );
  }

  const { data: profile } = await (supabase as any)
    .from("profiles")
    .select("tank_id")
    .eq("id", user.id)
    .single();

  const tankId = profile?.tank_id as number | null | undefined;
  if (!tankId) {
    return (
      <Card>
        <p className="text-sm text-muted">
          No tank is assigned to your profile. Assign one from{" "}
          <Link href="/dashboard/assigned-tank" className="font-medium text-primary underline">
            Assigned Tank
          </Link>{" "}
          first.
        </p>
      </Card>
    );
  }

  const query = (await searchParams) ?? {};
  const tabParam = typeof query.tab === "string" ? query.tab : undefined;
  const snapshot = await getAnalyticsSnapshot(tankId);
  return (
    <Suspense
      fallback={
        <Card>
          <p className="text-sm text-muted">Loading analytics…</p>
        </Card>
      }
    >
      <AnalyticsDashboard snapshot={snapshot} initialTab={tabParam} />
    </Suspense>
  );
}
