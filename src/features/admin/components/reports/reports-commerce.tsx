"use client";

import { useMemo } from "react";
import Link from "next/link";
import { BadgePercent, CreditCard, IndianRupee, Landmark, Package, ReceiptText, RotateCcw, ShoppingBag, TrendingUp, Wallet, XCircle } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { earningStatusRows, orderStatusRows, payoutStatusRows } from "@/features/insights/constants/insights-status";
import { useFinanceReport, useStoreReport } from "@/features/insights/hooks/use-insights-admin";
import { distributionRows, paymentSuccessRate, type InsightRow } from "@/features/insights/lib/insights-view-models";
import type { RangeQuery, StoreReport } from "@/features/insights/types/insights-admin";
import { formatINR } from "../../lib/format";
import { toneClasses } from "../../insights/tones";
import { AdminBarChart } from "../shared/admin-bar-chart";
import { AdminDataTable } from "../shared/admin-data-table";
import { AdminDataTableColumnHeader } from "../shared/admin-data-table-column-header";
import { AdminDonutChart } from "../shared/admin-donut-chart";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminSectionHeading } from "../shared/admin-section-heading";
import { AdminMetricCard } from "../shared/admin-metric-card";
import { ReportQueryState } from "./report-query-state";

type ProductRow = StoreReport["topProducts"][number];
type CouponRow = StoreReport["couponUsage"][number];
type LowStockRow = StoreReport["lowStock"][number];

const num = (value: number) => <span className="tabular-nums">{value}</span>;
const money = (paise: number) => <span className="tabular-nums">{formatINR(paise)}</span>;

/** Paise amounts per status (bar charts here only format counts, so money splits are listed). */
function MoneyBreakdown({ rows, total }: { rows: InsightRow[]; total?: { label: string; value: number } }) {
  return (
    <ul className="grid gap-2 text-sm">
      {rows.map((row) => (
        <li key={row.key} className="flex items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-foreground">
            <span className={`size-2.5 rounded-[2px] ${toneClasses[row.tone].dot}`} aria-hidden="true" />
            {row.label}
          </span>
          <span className="font-medium tabular-nums">{formatINR(row.value)}</span>
        </li>
      ))}
      {total ? (
        <li className="flex items-center justify-between gap-3 border-t border-border pt-2 text-muted-foreground">
          <span>{total.label}</span>
          <span className="font-medium tabular-nums text-foreground">{formatINR(total.value)}</span>
        </li>
      ) : null}
    </ul>
  );
}

export function ReportsCommerce({ range }: { range: RangeQuery }) {
  const store = useStoreReport(range);
  const finance = useFinanceReport(range);

  const productColumns = useMemo<ColumnDef<ProductRow>[]>(
    () => [
      {
        accessorKey: "productName",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Product" />,
        enableHiding: false,
        cell: ({ row }) =>
          row.original.productId ? (
            <Link href={`/admin/store/products/${row.original.productId}`} className="font-medium hover:underline">
              {row.original.productName}
            </Link>
          ) : (
            <span className="font-medium">{row.original.productName}</span>
          ),
      },
      { accessorKey: "quantity", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Units" />, cell: ({ row }) => num(row.original.quantity) },
      { accessorKey: "revenuePaise", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Revenue" />, cell: ({ row }) => money(row.original.revenuePaise) },
    ],
    [],
  );

  const couponColumns = useMemo<ColumnDef<CouponRow>[]>(
    () => [
      {
        accessorKey: "code",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Coupon" />,
        enableHiding: false,
        cell: ({ row }) => (
          <Link href={`/admin/coupons/${row.original.couponId}`} className="font-mono text-xs font-semibold hover:underline">
            {row.original.code}
          </Link>
        ),
      },
      { accessorKey: "redemptions", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Redemptions" />, cell: ({ row }) => num(row.original.redemptions) },
      { accessorKey: "discountPaise", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Discount given" />, cell: ({ row }) => money(row.original.discountPaise) },
    ],
    [],
  );

  const lowStockColumns = useMemo<ColumnDef<LowStockRow>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Product" />,
        enableHiding: false,
        cell: ({ row }) => (
          <Link href={`/admin/store/products/${row.original.productId}`} className="font-medium hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "inventoryQuantity", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="In stock" />, cell: ({ row }) => num(row.original.inventoryQuantity) },
    ],
    [],
  );

  return (
    <ReportQueryState queries={[store, finance] as const} label="the commerce report">
      {([s, f]) => {
        const successRate = paymentSuccessRate(f);
        const earnings = distributionRows(earningStatusRows, f.earningsByStatusPaise);
        const paymentRows: InsightRow[] = [
          { key: "succeeded", label: "Succeeded", value: f.successfulPayments.count, tone: "green" },
          { key: "failed", label: "Failed", value: f.failedPayments.count, tone: "red" },
        ];
        return (
          <div className="space-y-5">
            <section className="space-y-3" aria-label="Store">
              <AdminSectionHeading title="Store" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <AdminMetricCard label="Orders" value={s.ordersCount} secondary="Placed in period, any status" icon={ShoppingBag} tone="orange" href="/admin/orders" />
                <AdminMetricCard
                  label="Revenue"
                  value={formatINR(s.finalRevenuePaise)}
                  secondary={`${formatINR(s.subtotalPaise)} subtotal + ${formatINR(s.shippingPaise)} shipping`}
                  icon={ReceiptText}
                  tone="orange"
                />
                <AdminMetricCard label="Average order value" value={formatINR(s.averageOrderValuePaise)} secondary="Confirmed to delivered orders" icon={TrendingUp} tone="blue" />
                <AdminMetricCard label="Discounts" value={formatINR(s.discountsPaise)} secondary="On revenue-counted orders" icon={BadgePercent} tone="purple" href="/admin/coupons" />
                <AdminMetricCard label="Refunded" value={formatINR(s.refundedPaise)} secondary="Order refunds recorded in period" icon={RotateCcw} tone="neutral" />
                <AdminMetricCard
                  label="Low-stock products"
                  value={s.lowStock.length}
                  secondary={`Current stock ≤ ${s.lowStockThreshold}`}
                  icon={Package}
                  tone="amber"
                  href="/admin/store/products"
                />
              </div>
              <p className="text-xs text-muted-foreground">Revenue, discounts and average order value count confirmed, processing, shipped and delivered orders.</p>
            </section>

            <div className="grid gap-4 lg:grid-cols-2">
              <AdminInsightCard title="Order status">
                <AdminDonutChart rows={distributionRows(orderStatusRows, s.ordersByStatus)} centerLabel="Orders" />
              </AdminInsightCard>
              <div className="min-w-0 space-y-2">
                <AdminInsightCard title="Top products" flush>
                <AdminDataTable className="rounded-none border-0" columns={productColumns} data={s.topProducts} emptyState={<span>No products sold in this period</span>} />
              </AdminInsightCard>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="min-w-0 space-y-2">
                <AdminInsightCard title="Coupon usage" flush>
                <AdminDataTable className="rounded-none border-0" columns={couponColumns} data={s.couponUsage} emptyState={<span>No coupon redemptions in this period</span>} />
              </AdminInsightCard>
              </div>
              <div className="min-w-0 space-y-2">
                <AdminInsightCard title="Low stock" flush>
                <AdminDataTable className="rounded-none border-0" columns={lowStockColumns} data={s.lowStock} emptyState={<span>No published products are low on stock</span>} />
              </AdminInsightCard>
              </div>
            </div>

            <section className="space-y-3" aria-label="Finance">
              <AdminSectionHeading title="Finance" />
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <AdminMetricCard
                  label="Successful payments"
                  value={formatINR(f.successfulPayments.amountPaise)}
                  secondary={`${f.successfulPayments.count} payments${successRate === null ? "" : ` · ${successRate}% success rate`}`}
                  icon={CreditCard}
                  tone="green"
                  href="/admin/payments?status=succeeded"
                />
                <AdminMetricCard
                  label="Failed payments"
                  value={f.failedPayments.count}
                  secondary={f.failedPayments.amountPaise === null ? "Created in period" : `${formatINR(f.failedPayments.amountPaise)} attempted`}
                  icon={XCircle}
                  tone="red"
                  href="/admin/payments?status=failed"
                />
                <AdminMetricCard label="Wallet top-ups" value={formatINR(f.walletTopupsPaise)} secondary={`${formatINR(f.customerWalletBalancesPaise)} held in wallets now`} icon={Wallet} tone="blue" href="/admin/wallets" />
                <AdminMetricCard label="Platform commission" value={formatINR(f.platformCommissionRevenuePaise)} secondary="Fees on paid chat earnings" icon={IndianRupee} tone="green" href="/admin/earnings" />
                <AdminMetricCard label="Payouts paid" value={formatINR(f.paidPayoutsPaise)} secondary={`${f.payoutsByStatus.paid} payouts created in period`} icon={Landmark} tone="teal" href="/admin/payouts?status=paid" />
              </div>
            </section>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AdminInsightCard title="Payment outcomes">
                <AdminBarChart rows={paymentRows} emptyLabel="No payments in this period" />
              </AdminInsightCard>
              <AdminInsightCard title="Payouts by status">
                <AdminBarChart rows={distributionRows(payoutStatusRows, f.payoutsByStatus)} emptyLabel="No payouts in this period" />
              </AdminInsightCard>
              <AdminInsightCard title="Astrologer earnings by status" className="md:col-span-2 xl:col-span-1">
                <MoneyBreakdown rows={earnings} total={{ label: "Total earned in period", value: earnings.reduce((sum, row) => sum + row.value, 0) }} />
              </AdminInsightCard>
            </div>
          </div>
        );
      }}
    </ReportQueryState>
  );
}
