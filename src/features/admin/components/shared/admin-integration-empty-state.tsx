import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";

export function AdminIntegrationEmptyState({ icon: Icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="flex min-h-52 flex-col items-center justify-center border border-dashed border-border/80 px-6 py-8 text-center">
        <span className="grid size-11 place-items-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-5" aria-hidden="true" /></span>
        <h2 className="mt-3 text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 max-w-md text-sm leading-6 text-muted-foreground">{description}</p>
      </CardContent>
    </Card>
  );
}
