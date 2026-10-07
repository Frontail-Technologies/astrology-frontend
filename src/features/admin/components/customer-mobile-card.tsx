"use client";

import { getInitials } from "../lib/format";
import Link from "next/link";
import { Eye, MoreHorizontal } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Customer, CustomerAccountStatus } from "@/features/customers/types/customer";

const STATUS_LABELS: Record<CustomerAccountStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  archived: "Archived",
};
const STATUS_VARIANTS: Record<CustomerAccountStatus, "online" | "unavailable" | "muted"> = {
  active: "online",
  suspended: "unavailable",
  archived: "muted",
};

export function CustomerMobileCard({ customer }: { customer: Customer }) {
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar className="size-10 shrink-0">
              <AvatarFallback className="bg-accent text-xs font-semibold text-sidebar-primary">
                {getInitials(customer.name)}
              </AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{customer.name ?? "—"}</p>
              <p className="truncate text-xs text-muted-foreground">{customer.email ?? "—"}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 shrink-0 p-0" aria-label={`Actions for ${customer.name ?? "customer"}`}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/customers/${customer.id}`}>
                  <Eye aria-hidden="true" />
                  View
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">{customer.phone ?? "—"}</p>
          {customer.accountStatus && (
            <Badge variant={STATUS_VARIANTS[customer.accountStatus]}>
              {STATUS_LABELS[customer.accountStatus]}
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
