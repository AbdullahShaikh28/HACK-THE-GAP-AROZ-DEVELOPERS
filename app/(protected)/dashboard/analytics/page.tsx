import { Card } from "@/components/ui/Card";
import { Navbar } from "@/components/Navbar";

export default function AnalyticsPage() {
  return (
    <>
      <Navbar isAuthenticated />
      <main className="min-h-screen bg-background">
        <div className="mx-auto w-full max-w-6xl px-6 py-10">
          <Card>
            <h1 className="text-2xl font-semibold text-foreground">Analytics</h1>
            <p className="mt-3 text-sm text-muted">
              Placeholder page for reporting, charts, and future insights.
            </p>
          </Card>
        </div>
      </main>
    </>
  );
}
