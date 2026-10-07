import Link from "next/link";
import type { LucideIcon } from "lucide-react";

import { Card, CardContent } from "@/components/ui/card";
import { toneClasses, type InsightTone } from "@/features/admin/insights/tones";
import { cn } from "@/lib/utils";

export function AdminMetricCard({
  label,
  value,
  secondary,
  icon: Icon,
  tone,
  href,
}: {
  label: string;
  value: string | number;
  secondary?: string;
  icon: LucideIcon;
  tone: InsightTone;
  href?: string;
}) {
  const card = (
    <Card className={cn("shadow-sm", href && "transition-colors group-hover:border-primary/40")}>
      <CardContent className="flex items-start gap-3 p-3.5">
        <span className={cn("grid size-9 shrink-0 place-items-center rounded-md", toneClasses[tone].tile)}>
          <Icon className="size-4" aria-hidden="true" />
        </span>
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground">{label}</p>
          <p className="mt-0.5 text-xl font-semibold leading-7 tabular-nums tracking-tight text-foreground">
            {value}
          </p>
          {secondary ? <p className="mt-0.5 truncate text-xs text-muted-foreground">{secondary}</p> : null}
        </div>
      </CardContent>
    </Card>
  );

  if (!href) return card;
  return (
    <Link
      href={href}
      className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring"
      aria-label={`${label}: ${value}${secondary ? `, ${secondary}` : ""}`}
    >
      {card}
    </Link>
  );
}
