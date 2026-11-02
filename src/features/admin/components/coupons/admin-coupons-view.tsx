"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Check, Copy, Eye, Pencil, Plus, Ticket } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import { couponActiveLabels, couponDateStateLabels, couponDiscountTypeLabels } from "@/features/coupons/constants/coupon-status";
import { useCouponList } from "@/features/coupons/hooks/use-coupon-admin";
import type { ManagedCoupon } from "@/features/coupons/types/coupon-admin";
import { useCopyToClipboard } from "../../hooks/use-copy-to-clipboard";
import { CatalogMobileCard } from "../catalog/catalog-pills";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { CouponStateBadge, CouponSwatch, discountText, scopeText, usageText, validityText } from "./coupon-display";

function NewCouponButton() {
  return (
    <Button asChild variant="conversion" size="sm">
      <Link href="/admin/coupons/new">
        <Plus aria-hidden="true" />
        New coupon
      </Link>
    </Button>
  );
}

export function AdminCouponsView() {
  const list = useCouponList();
  const { copied, copy } = useCopyToClipboard({ label: "Coupon code" });

  const columns = useMemo<ColumnDef<ManagedCoupon>[]>(
    () => [
      {
        id: "coupon",
        header: "Coupon",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex min-w-48 items-center gap-2.5">
            <CouponSwatch color={row.original.color} />
            <div className="min-w-0">
              <div className="flex items-center gap-1">
                <Link href={`/admin/coupons/${row.original.id}`} className="font-mono text-xs font-semibold tracking-wide hover:underline">
                  {row.original.code}
                </Link>
                <Button variant="ghost" size="sm" className="size-6 p-0 text-muted-foreground" aria-label={`Copy coupon code ${row.original.code}`} onClick={() => void copy(row.original.code)}>
                  {copied === row.original.code ? <Check className="size-3.5" aria-hidden="true" /> : <Copy className="size-3.5" aria-hidden="true" />}
                </Button>
              </div>
              <p className="truncate text-xs text-muted-foreground">{row.original.name}</p>
            </div>
          </div>
        ),
      },
      { id: "discount", header: "Discount", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm font-medium tabular-nums">{discountText(row.original)}</span> },
      { id: "scope", header: "Applies to", enableSorting: false, cell: ({ row }) => <span className="text-sm text-muted-foreground">{scopeText(row.original)}</span> },
      { id: "usage", header: "Usage", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground tabular-nums">{usageText(row.original)}</span> },
      { id: "validity", header: "Validity", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground tabular-nums">{validityText(row.original)}</span> },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <CouponStateBadge coupon={row.original} /> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/coupons/${row.original.id}`} label={`View ${row.original.code}`} icon={Eye} />
            <AdminRowActions
              label={`More actions for ${row.original.code}`}
              actions={[
                { label: "Edit", icon: Pencil, href: `/admin/coupons/${row.original.id}/edit` },
                { label: "Copy code", icon: Copy, onSelect: () => void copy(row.original.code) },
              ]}
            />
          </div>
        ),
      },
    ],
    [copied, copy],
  );

  return (
    <AdminServerList
      title="Coupons"
      description="Discount codes for store orders and consultations."
      noun="coupons"
      primaryAction={<NewCouponButton />}
      list={list}
      columns={columns}
      searchPlaceholder="Search by code or name…"
      searchMaxLength={180}
      filters={[
        { key: "active", allLabel: "Active and inactive", options: couponActiveLabels },
        { key: "dateState", allLabel: "Any dates", options: couponDateStateLabels },
        { key: "discountType", allLabel: "All discount types", options: couponDiscountTypeLabels },
      ]}
      initialColumnVisibility={{ scope: false }}
      emptyLabel="No coupons yet"
      emptyDescription="Create a coupon code to offer a discount on store orders or consultations."
      emptyIcon={Ticket}
      emptyAction={<NewCouponButton />}
      renderMobileCard={(coupon) => (
        <CatalogMobileCard key={coupon.id} className="space-y-2">
            <div className="flex items-start justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                <CouponSwatch color={coupon.color} />
                <Link href={`/admin/coupons/${coupon.id}`} className="font-mono text-sm font-semibold tracking-wide hover:underline">
                  {coupon.code}
                </Link>
              </div>
              <div className="flex items-center gap-1">
                <CouponStateBadge coupon={coupon} />
                <AdminRowActions
                  label={`Actions for ${coupon.code}`}
                  actions={[
                    { label: "View", icon: Eye, href: `/admin/coupons/${coupon.id}` },
                    { label: "Edit", icon: Pencil, href: `/admin/coupons/${coupon.id}/edit` },
                    { label: "Copy code", icon: Copy, onSelect: () => void copy(coupon.code) },
                  ]}
                />
              </div>
            </div>
            <p className="truncate text-sm text-muted-foreground">{coupon.name}</p>
            <div className="flex justify-between text-xs text-muted-foreground tabular-nums">
              <span className="font-medium text-foreground">{discountText(coupon)}</span>
              <span>{usageText(coupon)}</span>
            </div>
            <p className="text-xs text-muted-foreground tabular-nums">{validityText(coupon)}</p>
        </CatalogMobileCard>
      )}
    />
  );
}
