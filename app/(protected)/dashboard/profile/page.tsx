import { Card } from "@/components/ui/Card";
import { createClient } from "@/lib/supabase/server";

export default async function ProfilePage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-10">
        <div className="space-y-2">
          <h1 className="text-3xl font-semibold text-foreground">Profile</h1>
          <p className="text-sm text-muted">
            User account information and profile details.
          </p>
        </div>

        <Card>
          <h2 className="text-lg font-semibold text-foreground">
            Account details
          </h2>
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
            <div>
              <dt className="text-muted">Last sign in</dt>
              <dd className="font-medium text-foreground">
                {user?.last_sign_in_at
                  ? new Date(user.last_sign_in_at).toLocaleString()
                  : "Unavailable"}
              </dd>
            </div>
          </dl>
        </Card>
      </div>
    </main>
  );
}
