import type { HTMLAttributes } from "react";
import { cn } from "@/utils/helpers";

type CardProps = HTMLAttributes<HTMLDivElement>;

export function Card({ className, ...props }: CardProps) {
  return (
    <div
      className={cn(
        "rounded-2xl border border-border bg-white p-6 shadow-card",
        className,
      )}
      {...props}
    />
  );
}
