import type { InputHTMLAttributes } from "react";
import { cn } from "@/utils/helpers";

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export function Input({ className, ...props }: InputProps) {
  return (
    <input
      className={cn(
        "w-full rounded-md border border-border bg-white px-3 py-2 text-sm text-foreground shadow-sm placeholder:text-muted focus:border-slate-400",
        className,
      )}
      {...props}
    />
  );
}
