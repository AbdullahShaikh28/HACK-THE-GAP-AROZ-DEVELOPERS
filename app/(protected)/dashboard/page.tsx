import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

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
    </div>
  );
}
