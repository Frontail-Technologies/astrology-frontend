import type { ReactNode } from "react";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";

export function AdminInsightCard({
  title,
  action,
  children,
  className,
  flush = false,
}: {
  title: string;
  action?: ReactNode;
  children: ReactNode;
  className?: string;
  flush?: boolean;
}) {
  return (
    <Card className={cn("min-w-0 shadow-sm", className)}>
      <CardHeader className="flex flex-row items-center justify-between gap-3 border-b border-border px-4 py-3">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className={flush ? "p-0" : "p-4"}>{children}</CardContent>
    </Card>
  );
}
