import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { revalidatePath } from "next/cache";
import { ComplaintsList } from "@/components/dashboard/ComplaintsList";

export default async function ComplaintsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    revalidatePath("/dashboard/complaints");
  }

  const { data: profile } = user
    ? await (supabase as any)
        .from("profiles")
        .select("tank_id")
        .eq("id", user.id)
        .single()
    : { data: null };

  const { data: complaints, error: complaintsError } = profile?.tank_id
    ? await (supabase as any)
        .from("complaints")
        .select("*")
        .eq("tank_id", profile.tank_id)
        .order("created_at", { ascending: false })
    : { data: [], error: null };

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Complaints</h1>
        <p className="text-sm text-muted">
          Complaints for your assigned tank, newest first. Update status and priority
          as you work them.
        </p>
      </div>

      <Card>
        <h2 className="text-lg font-semibold text-foreground">List</h2>
        <p className="mt-1 text-sm text-muted">
          {(complaints ?? []).length} complaint
          {(complaints ?? []).length === 1 ? "" : "s"}
          {profile?.tank_id ? "" : " — assign a tank to see complaints."}
        </p>
        {complaintsError ? (
          <p className="mt-2 text-sm text-red-600">
            Could not load complaints: {complaintsError.message}
          </p>
        ) : null}

        <div className="mt-4">
          <ComplaintsList
            complaints={(complaints ?? []) as Array<Record<string, unknown>>}
            updateComplaintMeta={updateComplaintMeta}
          />
        </div>
      </Card>
    </div>
  );
}
