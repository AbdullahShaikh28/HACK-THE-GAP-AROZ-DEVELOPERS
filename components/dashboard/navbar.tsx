"use client";

import { Header } from "@/components/dashboard/header";

type DashboardNavbarProps = {
  title?: string;
};

export function DashboardNavbar({ title = "Dashboard" }: DashboardNavbarProps) {
  return <Header title={title} />;
}
