import { Card } from "@/components/ui/Card";

export default function AlertsPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto w-full max-w-6xl px-6 py-10">
        <Card>
          <h1 className="text-2xl font-semibold text-foreground">Alerts</h1>
          <p className="mt-3 text-sm text-muted">
            Placeholder page for alerting workflows and notifications.
          </p>
        </Card>
      </div>
    </main>
  );
}
