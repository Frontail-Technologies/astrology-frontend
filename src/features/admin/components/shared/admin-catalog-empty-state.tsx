import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { Card, CardContent } from "@/components/ui/card";

export function AdminCatalogEmptyState({ icon: Icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action: ReactNode }) {
  return (
    <Card className="border-dashed bg-muted/5 shadow-none">
      <CardContent className="flex min-h-52 flex-col items-center justify-center px-6 py-8 text-center">
        <span className="grid size-11 place-items-center rounded-lg bg-muted text-muted-foreground"><Icon className="size-5" aria-hidden="true" /></span>
        <h2 className="mt-3 text-base font-semibold text-foreground">{title}</h2>
        <p className="mt-1 max-w-sm text-sm leading-6 text-muted-foreground">{description}</p>
        <div className="mt-4">{action}</div>
      </CardContent>
    </Card>
  );
}
