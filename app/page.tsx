import { FrontendHeader } from "@/components/FrontendHeader";
import { HomeOverview } from "@/components/HomeOverview";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f2f5f9] text-[#1a2535]">
      <FrontendHeader active="home" />
      <HomeOverview />
    </main>
  );
}
