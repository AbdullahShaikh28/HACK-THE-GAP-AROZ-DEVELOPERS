import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { TankersPageTabs, type TankerListItem } from "./TankersPageTabs";

export default async function TankersPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return (
      <Card>
        <p className="text-sm text-muted">Sign in to manage tanker requests.</p>
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

  const { data: tank } = await (supabase as any)
    .from("water_tanks")
    .select("id,name,ward")
    .eq("id", tankId)
    .single();

  const { data: tankerRows, error: tankerError } = await (supabase as any)
    .from("tanker_requests")
    .select("id,requester_name,vehicle_number,phone_number,address,supply_date,supply_time,payment_status,source,created_at")
    .eq("tank_id", tankId)
    .order("created_at", { ascending: false });

  const rows: TankerListItem[] = ((tankerRows ?? []) as Array<any>).map((row) => ({
    id: String(row.id ?? ""),
    requester_name: String(row.requester_name ?? ""),
    vehicle_number: String(row.vehicle_number ?? ""),
    phone_number: String(row.phone_number ?? ""),
    address: String(row.address ?? ""),
    supply_date: String(row.supply_date ?? ""),
    supply_time: String(row.supply_time ?? ""),
    payment_status: String(row.payment_status ?? "received"),
    source: String(row.source ?? "dashboard"),
    created_at: String(row.created_at ?? ""),
  }));

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Tankers</h1>
        <p className="text-sm text-muted">
          Add tanker request entries and view tanker list for your assigned tank only.
        </p>
      </div>

      {tankerError ? (
        <Card className="border-red-200 bg-red-50/50">
          <p className="text-sm font-medium text-red-800">Could not load tanker requests</p>
          <p className="mt-1 text-sm text-red-700">{tankerError.message}</p>
          <p className="mt-2 text-xs text-red-700/90">
            If this says relation does not exist, run{" "}
            <code className="rounded bg-red-100 px-1">sql/cei_tanker_requests.sql</code>.
          </p>
        </Card>
      ) : null}

      <TankersPageTabs
        tankName={String(tank?.name ?? `Tank #${tankId}`)}
        ward={tank?.ward ? String(tank.ward) : null}
        rows={rows}
      />
    </div>
  );
}
