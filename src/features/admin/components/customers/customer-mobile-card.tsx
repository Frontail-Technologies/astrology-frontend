"use client";

import Link from "next/link";
import { Eye } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { customerStatusLabels, customerStatusVariants } from "@/features/customers/constants/customer-status";
import { personInitials, personPrimaryLabel, personSecondaryLabel, type PersonLike } from "@/features/customers/lib/customer-display";
import type { Customer } from "@/features/customers/types/customer";
import { cn } from "@/lib/utils";
import { formatDateOnly } from "../../lib/format";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminStatusBadge } from "../shared/admin-status-badge";

/**
 * Avatar + primary label + one muted line for a customer-like record. Falls back name → email → phone so a name is
 * never rendered as "—", and the initials come from whichever label is primary.
 */
export function CustomerIdentity({
  customer,
  href,
  size = "sm",
  className,
}: {
  customer: PersonLike;
  href?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const primary = personPrimaryLabel(customer);
  const secondary = personSecondaryLabel(customer);
  const avatarSize = size === "lg" ? "size-14" : size === "md" ? "size-10" : "size-8";
  return (
    <div className={cn("flex min-w-0 items-center gap-3", className)}>
      <Avatar className={cn(avatarSize, "shrink-0")}>
        <AvatarFallback className={cn("bg-accent font-semibold text-sidebar-primary", size === "lg" ? "text-base" : "text-xs")}>{personInitials(customer)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        {href ? (
          <Link href={href} className={cn("block truncate font-medium text-foreground hover:underline", size === "lg" && "text-lg font-semibold")}>
            {primary}
          </Link>
        ) : (
          <p className={cn("truncate font-medium text-foreground", size === "lg" && "text-lg font-semibold")}>{primary}</p>
        )}
        {secondary ? <p className={cn("truncate text-muted-foreground", size === "lg" ? "text-sm" : "text-xs")}>{secondary}</p> : null}
      </div>
    </div>
  );
}

export function CustomerMobileCard({ customer }: { customer: Customer }) {
  const label = personPrimaryLabel(customer);
  return (
    <article className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <CustomerIdentity customer={customer} href={`/admin/customers/${customer.id}`} size="md" />
        <AdminRowActions label={`Actions for ${label}`} actions={[{ label: "View customer", icon: Eye, href: `/admin/customers/${customer.id}` }]} className="-mr-1.5 shrink-0" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <p className="text-xs tabular-nums text-muted-foreground">{customer.createdAt ? `Joined ${formatDateOnly(customer.createdAt)}` : "Join date unknown"}</p>
        {customer.accountStatus ? <AdminStatusBadge status={customer.accountStatus} labels={customerStatusLabels} variants={customerStatusVariants} /> : null}
      </div>
    </article>
  );
}
