import Link from "next/link";
import Image from "next/image";

type FrontendHeaderProps = {
  active?: "home" | "chat" | "tanks" | "complaints";
};

export function FrontendHeader({ active }: FrontendHeaderProps) {
  const linkClass = (key: "home" | "chat" | "tanks" | "complaints") =>
    [
      "rounded-md px-3.5 py-2 font-semibold tracking-[0.3px] transition",
      active === key
        ? "bg-[#e8610a] text-white"
        : "text-white/80 hover:bg-white/10 hover:text-white",
    ].join(" ");

  return (
    <>
      <div className="flex items-center justify-between gap-3 bg-[#e8610a] px-8 py-1.5 text-xs font-semibold tracking-[0.4px] text-white">
        <span>Updates</span>
        <div className="flex-1 overflow-hidden px-4">
          <div className="whitespace-nowrap text-center text-white/90">
            महानगरपालिका औरंगाबाद | 39 tanks active across 22 wards | Total
            capacity 756 LL across the distribution network
          </div>
        </div>
        <span>मराठी</span>
      </div>

      <header className="sticky top-0 z-40 bg-[#1a3a6e] text-white shadow-[0_2px_12px_rgba(0,0,0,0.25)]">
        <div className="mx-auto flex h-[152px] max-w-[1280px] items-center gap-5 px-6">
          <div className="flex items-center gap-3.5">
            <div className="relative h-[130px] w-[152px] overflow-hidden ">
              <Image
                src="/csmc-logo.jpeg"
                alt="Chhatrapati Sambhajinagar Corporation logo"
                fill
                className="object-contain p-1"
                priority
              />
            </div>

            <div className="border-l-2 border-white/20 pl-3.5">
              <p className="text-[15px] font-extrabold leading-[1.2] tracking-[0.5px]">
                Chhatrapati Sambhajinagar Corporation
              </p>
              <p className="text-[10.5px] uppercase tracking-[0.8px] text-white/65">
                Chhatrapati Sambhajinagar Smart City
              </p>
            </div>
          </div>

          <div className="flex-1" />

          <nav className="flex items-center gap-1 text-sm">
            <Link href="/" className={linkClass("home")}>
              Home
            </Link>
            <Link href="/chat" className={linkClass("chat")}>
              Chat
            </Link>
            <Link href="/tanks" className={linkClass("tanks")}>
              Tanks
            </Link>
            <Link href="/complaints" className={linkClass("complaints")}>
              Complaint
            </Link>
            <Link
              href="/login"
              className="ml-3 rounded-md px-3.5 py-2 font-semibold tracking-[0.3px] text-white/80 transition hover:bg-white/10 hover:text-white"
            >
              Login
            </Link>
            <Link
              href="/signup"
              className="rounded-md border border-white/25 px-3.5 py-2 font-semibold tracking-[0.3px] text-white transition hover:bg-white/10"
            >
              Sign up
            </Link>
          </nav>
        </div>
        <div className="h-1 bg-[linear-gradient(90deg,#e8610a_0%,#f5a623_50%,#f47c2e_100%)]" />
      </header>
    </>
  );
}
