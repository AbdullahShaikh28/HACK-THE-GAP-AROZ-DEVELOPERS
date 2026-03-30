import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { generateCeiInsightsForTank } from "@/services/cei-insights";

export default async function AssignedTankPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  async function updateTankLevels(formData: FormData) {
    "use server";

    const usedValue = Number(formData.get("capacity_used_lakh_liters"));

    if (Number.isNaN(usedValue) || usedValue < 0) {
      return;
    }

    const serverSupabase = await createClient();
    const {
      data: { user: actionUser },
    } = await serverSupabase.auth.getUser();

    if (!actionUser) return;

    const { data: profile } = await (serverSupabase as any)
      .from("profiles")
      .select("tank_id")
      .eq("id", actionUser.id)
      .single();

    if (!profile?.tank_id) return;

    const { data: tankRow } = await (serverSupabase as any)
      .from("water_tanks")
      .select("capacity_lakh_liters")
      .eq("id", profile.tank_id)
      .single();

    const totalCapacity = Number(tankRow?.capacity_lakh_liters ?? 0);
    const safeUsed = Math.min(usedValue, totalCapacity);
    const computedAvailable = Math.max(0, totalCapacity - safeUsed);

    await (serverSupabase as any)
      .from("water_tanks")
      .update({
        capacity_used_lakh_liters: safeUsed,
        capacity_available_lakh_liters: computedAvailable,
      })
      .eq("id", profile.tank_id);

    revalidatePath("/dashboard");
    revalidatePath("/dashboard/assigned-tank");
  }

  const { data: profile } = user
    ? await (supabase as any)
        .from("profiles")
        .select("tank_id")
        .eq("id", user.id)
        .single()
    : { data: null };

  const { data: assignedTank } = profile?.tank_id
    ? await (supabase as any)
        .from("water_tanks")
        .select(
          "id,name,type,ward,capacity_lakh_liters,capacity_used_lakh_liters,capacity_available_lakh_liters",
        )
        .eq("id", profile.tank_id)
        .single()
    : { data: null };

  const totalCapacity = Number(assignedTank?.capacity_lakh_liters ?? 0);
  const usedCapacity = Number(assignedTank?.capacity_used_lakh_liters ?? 0);
  const availableCapacity = Math.max(0, totalCapacity - usedCapacity);

  const aiInsight = await generateCeiInsightsForTank(profile?.tank_id ?? null);

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Assigned Tank</h1>
        <p className="text-sm text-muted">
          Your profile&apos;s water tank: levels, details, and scheduling insight.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-foreground">Assigned Tank</h2>
        {assignedTank ? (
          <>
            <div className="mt-4 grid gap-4 md:grid-cols-3">
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs text-muted">Total Capacity</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {totalCapacity} LL
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs text-muted">Capacity Used</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {usedCapacity} LL
                </p>
              </div>
              <div className="rounded-lg border border-border bg-background p-4">
                <p className="text-xs text-muted">Capacity Available</p>
                <p className="mt-1 text-2xl font-semibold text-foreground">
                  {availableCapacity} LL
                </p>
              </div>
            </div>

            <p className="mt-4 text-sm text-muted">
              {assignedTank.name} ({assignedTank.type}) - {assignedTank.ward}
            </p>

            <form action={updateTankLevels} className="mt-4 grid gap-3 md:grid-cols-2">
              <div className="space-y-1">
                <label
                  htmlFor="capacity_used_lakh_liters"
                  className="text-xs font-medium text-foreground"
                >
                  Capacity Used (LL)
                </label>
                <input
                  id="capacity_used_lakh_liters"
                  name="capacity_used_lakh_liters"
                  type="number"
                  min="0"
                  step="0.01"
                  defaultValue={usedCapacity}
                  className="h-10 w-full rounded-lg border border-border bg-background px-3 text-sm text-foreground outline-none"
                  required
                />
              </div>
              <div className="flex items-end">
                <button
                  type="submit"
                  className="h-10 rounded-lg bg-primary px-4 text-sm font-medium text-primary-foreground transition hover:opacity-90"
                >
                  Update Tank
                </button>
              </div>
            </form>
          </>
        ) : (
          <p className="mt-4 text-sm text-muted">
            No tank is assigned to your profile yet.
          </p>
        )}
      </Card>

      <Card>
        <h2 className="text-lg font-semibold text-foreground">AI Scheduling Insights</h2>
        {aiInsight ? (
          <div className="mt-4 space-y-3 text-sm">
            <p className="text-foreground">
              <span className="font-semibold">{aiInsight.tankName}</span>: open valve at{" "}
              <span className="font-semibold">{aiInsight.recommendedOpenTime}</span> for{" "}
              <span className="font-semibold">
                {aiInsight.recommendedDurationMinutes} minutes
              </span>
              .
            </p>
            <p className="text-muted">{aiInsight.reasoningSummary}</p>
            <p className="text-muted">
              Target areas:{" "}
              {aiInsight.targetAreas.length > 0
                ? aiInsight.targetAreas.join(", ")
                : "No nearby areas available yet."}
            </p>
            <p className="text-muted">
              Confidence: {Math.round(aiInsight.confidence * 100)}%
            </p>
            <p className="text-muted">
              Risks:{" "}
              {aiInsight.riskFlags.length > 0
                ? aiInsight.riskFlags.join(", ")
                : "No major risk flags detected."}
            </p>
          </div>
        ) : (
          <p className="mt-4 text-sm text-muted">
            Insight will appear once a tank is assigned and reports are available.
          </p>
        )}
      </Card>
    </div>
  );
}
