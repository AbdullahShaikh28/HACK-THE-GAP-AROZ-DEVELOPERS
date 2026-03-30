import Link from "next/link";
import { ValveControlPanel } from "@/components/dashboard/valve-control/ValveControlPanel";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { generateValveSchedulingInsights } from "@/services/cei-insights";

export default async function ValveControlPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await (supabase as any).from("profiles").select("tank_id").eq("id", user.id).single()
    : { data: null };

  const tankId = profile?.tank_id as number | null | undefined;

  const insights = tankId ? await generateValveSchedulingInsights(tankId) : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">AI valve control</h1>
        <p className="text-sm text-muted">
          Survey-driven suggestions for which zone valves to run, for how long, aligned with CEI
          scheduling insights for your assigned tank.
        </p>
      </div>

      {!user ? (
        <Card>
          <p className="text-sm text-muted">Sign in to view valve recommendations.</p>
        </Card>
      ) : !tankId ? (
        <Card>
          <p className="text-sm text-muted">
            No tank is assigned to your profile. Set one under{" "}
            <Link href="/dashboard/assigned-tank" className="font-medium text-primary underline">
              Assigned Tank
            </Link>{" "}
            to load survey-based valve plans.
          </p>
        </Card>
      ) : !insights ? (
        <Card>
          <p className="text-sm text-muted">Could not load tank data for valve insights.</p>
        </Card>
      ) : (
        <ValveControlPanel data={insights} />
      )}
    </div>
  );
}
