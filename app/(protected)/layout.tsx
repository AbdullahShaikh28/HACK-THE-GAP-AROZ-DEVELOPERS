import { ProtectedSidebar } from "@/components/ProtectedSidebar";

export default function ProtectedLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="min-h-screen bg-background">
      <div className="grid min-h-screen lg:grid-cols-[280px_1fr]">
        <div className="hidden lg:block">
          <ProtectedSidebar />
        </div>
        <div className="border-b border-border bg-white px-4 py-4 lg:hidden">
          <p className="text-sm font-semibold text-foreground">Water Ops</p>
          <p className="text-xs text-muted">
            Dashboard sidebar is available on larger screens
          </p>
        </div>
        <div>{children}</div>
      </div>
    </div>
  );
}
