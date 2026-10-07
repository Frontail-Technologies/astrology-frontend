import type { ReactNode } from "react";
import { cn } from "@/lib/utils";

export function AdminDetailStickyRail({ children, className }: { children: ReactNode; className?: string }) {
  return <aside className={cn("min-w-0 space-y-4 xl:sticky xl:top-6 xl:self-start", className)}>{children}</aside>;
}
