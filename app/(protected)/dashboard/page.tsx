import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ComplaintsList } from "@/components/dashboard/ComplaintsList";
import { generateCeiInsightsForTank } from "@/services/cei-insights";

export default async function DashboardPage() {
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
  }

  async function updateComplaintMeta(formData: FormData) {
    "use server";

    const complaintId = String(formData.get("complaint_id") ?? "");
    const status = String(formData.get("status") ?? "");
    const priority = String(formData.get("priority") ?? "");

    const allowedStatus = ["open", "in_progress", "resolved", "rejected"];
    const allowedPriority = ["low", "medium", "high"];

    if (
      !complaintId ||
      !allowedStatus.includes(status) ||
      !allowedPriority.includes(priority)
    ) {
      return;
    }

    const serverSupabase = await createClient();
    await (serverSupabase as any)
      .from("complaints")
      .update({ status, priority })
      .eq("id", complaintId);

    revalidatePath("/dashboard");
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

  const { data: complaints } = profile?.tank_id
    ? await (supabase as any)
        .from("complaints")
        .select("id,name,phone_number,tank_id,issue,image_url,status,priority,created_at")
        .eq("tank_id", profile.tank_id)
        .order("created_at", { ascending: false })
    : { data: [] };

  const { data: complaintTanks } = await (supabase as any)
    .from("water_tanks")
    .select("id,name");

  const tankNameById = Object.fromEntries(
    ((complaintTanks ?? []) as Array<{ id: number; name: string }>).map((tank) => [
      tank.id,
      tank.name,
    ]),
  ) as Record<number, string>;
  const aiInsight = await generateCeiInsightsForTank(profile?.tank_id ?? null);

  return (
    <div className="flex flex-col gap-6">
          <div className="space-y-2">
            <h1 className="text-3xl font-semibold text-foreground">Dashboard</h1>
            <p className="text-sm text-muted">
              Protected starter page with session-aware user details.
            </p>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <h2 className="text-lg font-semibold text-foreground">Account</h2>
              <dl className="mt-4 space-y-3 text-sm">
                <div>
                  <dt className="text-muted">Email</dt>
                  <dd className="font-medium text-foreground">
                    {user?.email ?? "Unavailable"}
                  </dd>
                </div>
                <div>
                  <dt className="text-muted">User ID</dt>
                  <dd className="break-all font-medium text-foreground">
                    {user?.id ?? "Unavailable"}
                  </dd>
                </div>
              </dl>
            </Card>

            <Card>
              <h2 className="text-lg font-semibold text-foreground">Next steps</h2>
              <p className="mt-4 text-sm text-muted">
                Continue extending this app with maps, alerts, analytics, and
                operational intelligence features.
              </p>
            </Card>
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
            <h2 className="text-lg font-semibold text-foreground">Complaints</h2>
            <p className="mt-1 text-sm text-muted">
              Review submitted complaints and update status/priority.
            </p>

            <div className="mt-4 space-y-4">
              <ComplaintsList
                complaints={(complaints ?? []) as Array<any>}
                tankNameById={tankNameById}
                updateComplaintMeta={updateComplaintMeta}
              />
            </div>
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
