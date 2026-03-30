"use client";

import { useRouter } from "next/navigation";
import type { ButtonHTMLAttributes } from "react";
import { createClient } from "@/lib/supabase/client";
import { cn } from "@/utils/helpers";

type SignOutButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;

export function SignOutButton({
  className,
  type = "button",
  ...props
}: SignOutButtonProps) {
  const router = useRouter();

  async function handleSignOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/login");
    router.refresh();
  }

  return (
    <button
      type={type}
      onClick={handleSignOut}
      className={cn(
        "text-sm text-muted transition hover:text-foreground",
        className,
      )}
      {...props}
    >
      Sign out
    </button>
  );
}
