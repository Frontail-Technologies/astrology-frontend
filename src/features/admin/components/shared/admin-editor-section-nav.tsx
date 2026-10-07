"use client";

import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export type AdminEditorSection = { id: string; label: string; icon: LucideIcon };

export function AdminEditorSectionNav({ sections, activeId, onNavigate }: { sections: AdminEditorSection[]; activeId: string; onNavigate: (id: string) => void }) {
  return (
    <nav aria-label="Editor sections" className="min-w-0 overflow-x-auto xl:overflow-visible">
      <div className="flex min-w-max gap-1 xl:min-w-0 xl:flex-col xl:items-stretch">
        {sections.map((section) => {
          const Icon = section.icon;
          const active = activeId === section.id;
          return <Button key={section.id} type="button" variant="ghost" size="sm" aria-current={active ? "location" : undefined} onClick={() => onNavigate(section.id)} className={cn("justify-start gap-2 whitespace-nowrap text-muted-foreground xl:gap-1.5 xl:px-2 xl:text-xs xl:leading-4 xl:whitespace-normal", active && "bg-accent text-foreground") }><Icon className={cn("size-4", active && "text-primary")} aria-hidden="true" />{section.label}</Button>;
        })}
      </div>
    </nav>
  );
}
