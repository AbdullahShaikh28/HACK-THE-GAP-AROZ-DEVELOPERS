import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";
import { generateCeiInsightsForTank } from "@/services/cei-insights";
import { ZoneContactsPanel } from "./ZoneContactsPanel";
import type { AssignedTankSummary, ZoneContactRow } from "./actions";

export default async function ZoneContactsPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: profile } = user
    ? await (supabase as any).from("profiles").select("tank_id").eq("id", user.id).single()
    : { data: null };

  let assignedTank: AssignedTankSummary | null = null;
  if (profile?.tank_id) {
    const { data: row } = await (supabase as any)
      .from("water_tanks")
      .select("id,name,ward")
      .eq("id", profile.tank_id)
      .single();
    if (row) {
      assignedTank = {
        id: row.id,
        name: row.name,
        ward: row.ward,
      };
    }
  }

  let initialContacts: ZoneContactRow[] = [];
  if (assignedTank) {
    const { data } = await (supabase as any)
      .from("tank_contacts")
      .select("id,name,phone_number,zone_number,source,created_at")
      .eq("tank_id", assignedTank.id)
      .order("created_at", { ascending: false });
    initialContacts = (data ?? []) as ZoneContactRow[];
  }

  const initialInsight = assignedTank
    ? await generateCeiInsightsForTank(assignedTank.id)
    : null;

  return (
    <div className="flex flex-col gap-6">
      <div className="space-y-2">
        <h1 className="text-3xl font-semibold text-foreground">Zone contacts</h1>
        <p className="text-sm text-muted">
          Survey contacts for your assigned tank and zone; broadcast AI valve scheduling and
          alternate-day zone supply over WhatsApp.
        </p>
      </div>

      {!user ? (
        <Card>
          <p className="text-sm text-muted">Sign in to manage zone contacts.</p>
        </Card>
      ) : !assignedTank ? (
        <Card>
          <p className="text-sm text-muted">
            No tank is assigned to your profile yet. Assign one from{" "}
            <Link href="/dashboard/assigned-tank" className="font-medium text-primary underline">
              Assigned Tank
            </Link>{" "}
            to manage zone contacts.
          </p>
        </Card>
      ) : (
        <ZoneContactsPanel
          assignedTank={assignedTank}
          initialContacts={initialContacts}
          initialInsight={initialInsight}
        />
      )}
    </div>
  );
}
