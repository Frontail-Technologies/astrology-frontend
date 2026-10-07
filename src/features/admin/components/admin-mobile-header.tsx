"use client";

import type { ReactNode } from "react";
import { SidebarTrigger } from "@/components/ui/sidebar";

export function AdminMobileHeader({
  title,
  actions,
}: {
  title: string;
  actions?: ReactNode;
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 shrink-0 items-center gap-2 border-b border-border bg-background px-3 lg:hidden">
      <SidebarTrigger className="size-9" aria-label="Open admin navigation" />
      <p className="min-w-0 flex-1 truncate text-sm font-semibold tracking-tight text-foreground">
        {title}
      </p>
      {actions ? <div className="flex shrink-0 items-center gap-1.5">{actions}</div> : null}
    </header>
  );
}
