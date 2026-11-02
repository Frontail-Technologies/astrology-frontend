"use client";

import Link from "next/link";
import { Fragment } from "react";
import { MoreHorizontal, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

export type AdminRowAction =
  | { label: string; icon?: LucideIcon; href: string; destructive?: boolean; separatorBefore?: boolean }
  | { label: string; icon?: LucideIcon; onSelect: () => void; destructive?: boolean; disabled?: boolean; separatorBefore?: boolean };

/**
 * Row "more" menu for list tables and mobile cards. Put the primary row action (usually View) as an
 * `AdminRowActionLink` beside it, and the rest here. `label` names the record for screen readers.
 *
 * ```tsx
 * <AdminRowActions label={`Actions for ${order.orderNumber}`} actions={[
 *   { label: "View", icon: Eye, href: `/admin/orders/${order.id}` },
 *   { label: "Cancel order", icon: XCircle, onSelect: () => confirm.open("cancelled"), destructive: true, separatorBefore: true },
 * ]} />
 * ```
 */
export function AdminRowActions({ label, actions, className }: { label: string; actions: AdminRowAction[]; className?: string }) {
  if (actions.length === 0) return null;
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className={cn("size-8 min-h-8 text-muted-foreground hover:bg-muted hover:text-foreground data-[state=open]:bg-muted", className)} aria-label={label}>
          <MoreHorizontal aria-hidden="true" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-44">
        {actions.map((action) => {
          const Icon = action.icon;
          const content = (
            <>
              {Icon ? <Icon aria-hidden="true" /> : null}
              {action.label}
            </>
          );
          const itemClass = action.destructive ? "text-destructive focus:text-destructive" : undefined;
          return (
            <Fragment key={action.label}>
              {action.separatorBefore ? <DropdownMenuSeparator /> : null}
              {"href" in action ? (
                <DropdownMenuItem asChild className={itemClass}>
                  <Link href={action.href}>{content}</Link>
                </DropdownMenuItem>
              ) : (
                <DropdownMenuItem className={itemClass} disabled={action.disabled} onSelect={action.onSelect}>
                  {content}
                </DropdownMenuItem>
              )}
            </Fragment>
          );
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
