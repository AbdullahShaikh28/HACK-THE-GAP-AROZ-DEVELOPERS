import { FrontendHeader } from "@/components/FrontendHeader";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-[#f2f5f9] text-[#1a2535]">
      <FrontendHeader active="home" />
      <div className="mx-auto min-h-[calc(100vh-77px)] max-w-[1280px] px-6 py-10" />
    </main>
  );
}
