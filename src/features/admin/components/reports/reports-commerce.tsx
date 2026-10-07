"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { CreditCard, Package, ReceiptText, RotateCcw, ShoppingBag, TrendingUp } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Badge } from "@/components/ui/badge";
import { formatCompactINR, formatINR } from "../../lib/format";
import { orderValueSeriesConfig } from "../../insights/chart-palette";
import type { DateRange } from "../../insights/date-range";
import { getCommerceReport, type CommerceFilters } from "../../insights/report-selectors";
import type { InsightsSnapshot } from "../../insights/use-insights-data";
import { AdminDataTable } from "../shared/admin-data-table";
import { AdminDataTableColumnHeader } from "../shared/admin-data-table-column-header";
import { AdminBarChart } from "../shared/admin-bar-chart";
import { AdminDonutChart } from "../shared/admin-donut-chart";
import { AdminTimeSeriesChart } from "../shared/admin-time-series-chart";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminMetricCard } from "../shared/admin-metric-card";
import { ReportFilterSelect } from "./report-controls";

type Report = ReturnType<typeof getCommerceReport>;
type ProductRow = Report["topProducts"][number];
type CouponRow = Report["coupons"][number];

const label = (value: string) => value[0].toUpperCase() + value.slice(1).replace("-", " ");

export function ReportsCommerce({ snapshot, range }: { snapshot: InsightsSnapshot; range: DateRange }) {
  const [filters, setFilters] = useState<CommerceFilters>({ orderStatus: "all", paymentStatus: "all" });
  const report = getCommerceReport(snapshot, range, filters);
  const hasProductChart = report.topProducts.length >= 2;
  const productChartRows = report.topProducts.slice(0, 6).map((product) => ({
    key: product.id,
    label: product.name,
    value: product.units,
    tone: "orange" as const,
  }));

  const productColumns = useMemo<ColumnDef<ProductRow>[]>(
    () => [
      { accessorKey: "name", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Product" />, enableHiding: false, cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
      { accessorKey: "units", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Units sold" />, cell: ({ row }) => <span className="tabular-nums">{row.original.units}</span> },
      { accessorKey: "valueInPaise", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Order value" />, cell: ({ row }) => <span className="tabular-nums">{formatINR(row.original.valueInPaise)}</span> },
    ],
    [],
  );

  const couponColumns = useMemo<ColumnDef<CouponRow>[]>(
    () => [
      { accessorKey: "code", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Coupon" />, enableHiding: false, cell: ({ row }) => <span className="font-mono text-xs font-semibold">{row.original.code}</span> },
      { accessorKey: "uses", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Uses" />, cell: ({ row }) => <span className="tabular-nums">{row.original.uses}</span> },
      {
        id: "discount",
        enableSorting: false,
        header: () => <span>Discount</span>,
        cell: ({ row }) => (
          <span>{row.original.discountType === "percentage" ? `${row.original.discountValue}%` : formatINR(row.original.discountValue)}</span>
        ),
      },
      { accessorKey: "status", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Status" />, cell: ({ row }) => <Badge variant={row.original.status === "active" ? "online" : "muted"}>{label(row.original.status)}</Badge> },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <ReportFilterSelect
          label="Filter by order status"
          value={filters.orderStatus}
          onChange={(orderStatus) => setFilters((f) => ({ ...f, orderStatus: orderStatus as CommerceFilters["orderStatus"] }))}
          options={[
            { value: "all", label: "All order statuses" },
            ...["pending", "processing", "shipped", "delivered", "cancelled", "returned"].map((s) => ({ value: s, label: label(s) })),
          ]}
          className="w-48"
        />
        <ReportFilterSelect
          label="Filter by payment status"
          value={filters.paymentStatus}
          onChange={(paymentStatus) => setFilters((f) => ({ ...f, paymentStatus: paymentStatus as CommerceFilters["paymentStatus"] }))}
          options={[
            { value: "all", label: "All payment statuses" },
            ...["success", "pending", "failed", "refunded", "partially-refunded"].map((s) => ({ value: s, label: label(s) })),
          ]}
          className="w-52"
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard label="Orders" value={report.orderCount} icon={ShoppingBag} tone="orange" href="/admin/orders" />
        <AdminMetricCard
          label="Gross order value"
          value={formatINR(report.grossInPaise)}
          secondary="Excludes cancelled and returned"
          icon={ReceiptText}
          tone="orange"
        />
        <AdminMetricCard
          label="Average order value"
          value={report.averageOrderInPaise === null ? "—" : formatINR(report.averageOrderInPaise)}
          icon={TrendingUp}
          tone="blue"
        />
        <AdminMetricCard
          label="Successful payments"
          value={formatINR(report.successVolumeInPaise)}
          secondary={`${report.successCount} transactions`}
          icon={CreditCard}
          tone="green"
          href="/admin/payments"
        />
        <AdminMetricCard label="Refunded amount" value={formatINR(report.refundedInPaise)} icon={RotateCcw} tone="neutral" />
        <AdminMetricCard
          label="Low-stock products"
          value={report.lowStock}
          secondary="Current stock"
          icon={Package}
          tone="amber"
          href="/admin/store/products"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <AdminInsightCard title="Order value over time" className="xl:col-span-2">
          <AdminTimeSeriesChart
            data={report.valueSeries}
            config={orderValueSeriesConfig}
            valueFormatter={(rupees) => formatINR(Math.round(rupees * 100))}
            axisFormatter={formatCompactINR}
          />
        </AdminInsightCard>
        <AdminInsightCard title="Order status">
          <AdminDonutChart rows={report.orderRows} centerLabel="Orders" />
        </AdminInsightCard>
      </div>

      <div className={`grid gap-4 ${hasProductChart ? "md:grid-cols-2" : ""}`}>
        <AdminInsightCard title="Payment status">
          <AdminBarChart rows={report.paymentRows} />
        </AdminInsightCard>
        {hasProductChart ? (
          <AdminInsightCard title="Top products by units sold">
            <AdminBarChart horizontal rows={productChartRows} />
          </AdminInsightCard>
        ) : null}
      </div>

      <div className="grid gap-4 xl:grid-cols-2">
        <div className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold text-foreground">Top products</h2>
          <AdminDataTable columns={productColumns} data={report.topProducts} emptyState={<span>No data for this period</span>} />
        </div>
        <div className="min-w-0 space-y-2">
          <h2 className="text-sm font-semibold text-foreground">
            Coupon usage{" "}
            <span className="font-normal text-muted-foreground">
              · {report.couponUses} total uses, all time. <Link href="/admin/coupons" className="underline underline-offset-2">Manage</Link>
            </span>
          </h2>
          <AdminDataTable columns={couponColumns} data={report.coupons} emptyState={<span>No coupons</span>} />
        </div>
      </div>
    </div>
  );
}
