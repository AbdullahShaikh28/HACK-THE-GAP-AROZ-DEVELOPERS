import { cookies } from "next/headers";
import { DashboardSidebarLayout } from "@/components/dashboard/dashboard-sidebar-layout";

export default async function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const defaultOpen = cookieStore.get("sidebar:state")?.value !== "false";

  return (
    <DashboardSidebarLayout defaultOpen={defaultOpen}>
      {children}
    </DashboardSidebarLayout>
  );
}
