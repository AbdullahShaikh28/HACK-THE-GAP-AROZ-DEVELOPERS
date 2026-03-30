import Link from "next/link";
import { SignOutButton } from "@/components/SignOutButton";

type NavbarProps = {
  isAuthenticated?: boolean;
};

export function Navbar({ isAuthenticated = false }: NavbarProps) {
  return (
    <header className="border-b border-border bg-white">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link href="/chat" className="text-lg font-semibold text-foreground">
          Starter App
        </Link>
        <nav className="flex items-center gap-4 text-sm text-muted">
          {isAuthenticated ? (
            <>
              <Link href="/dashboard" className="hover:text-foreground">
                Dashboard
              </Link>
              <SignOutButton />
            </>
          ) : (
            <>
              <Link href="/login" className="hover:text-foreground">
                Login
              </Link>
              <Link href="/signup" className="hover:text-foreground">
                Sign up
              </Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
