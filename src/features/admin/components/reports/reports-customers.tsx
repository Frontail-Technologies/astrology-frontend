"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarDays, ShoppingBag, UserPlus, UsersRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { customerSegmentRows } from "@/features/insights/constants/insights-status";
import { useCustomerReport } from "@/features/insights/hooks/use-insights-admin";
import { distributionRows, toDayBuckets } from "@/features/insights/lib/insights-view-models";
import type { CustomerReport, RangeQuery } from "@/features/insights/types/insights-admin";
import { formatINR } from "../../lib/format";
import { AdminCountSeriesChart } from "../shared/admin-count-series-chart";
import { AdminDataTable } from "../shared/admin-data-table";
import { AdminDataTableColumnHeader } from "../shared/admin-data-table-column-header";
import { AdminDonutChart } from "../shared/admin-donut-chart";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminMetricCard } from "../shared/admin-metric-card";
import { ReportQueryState } from "./report-query-state";

type Row = CustomerReport["rows"][number];

export function ReportsCustomers({ range }: { range: RangeQuery }) {
  const report = useCustomerReport(range);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Customer" />,
        enableHiding: false,
        cell: ({ row }) => (
          <Link href={`/admin/customers/${row.original.id}`} className="font-medium hover:underline">
            {row.original.name}
          </Link>
        ),
      },
      { accessorKey: "consultations", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Consultations" />, cell: ({ row }) => <span className="tabular-nums">{row.original.consultations}</span> },
      { accessorKey: "orders", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Orders" />, cell: ({ row }) => <span className="tabular-nums">{row.original.orders}</span> },
      {
        accessorKey: "orderValuePaise",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Order value" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.orderValuePaise ? formatINR(row.original.orderValuePaise) : "—"}</span>,
      },
    ],
    [],
  );

  return (
    <ReportQueryState queries={[report] as const} label="the customer report">
      {([r]) => (
        <div className="space-y-5">
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <AdminMetricCard label="Total customers" value={r.total} secondary="All time" icon={UsersRound} tone="blue" href="/admin/customers" />
            <AdminMetricCard label="New in period" value={r.newInRange} icon={UserPlus} tone="blue" />
            <AdminMetricCard label="With consultations" value={r.withConsultations} secondary="In period" icon={CalendarDays} tone="violet" />
            <AdminMetricCard label="With orders" value={r.withOrders} secondary={`${r.both} did both`} icon={ShoppingBag} tone="orange" />
          </div>

          <div className="grid gap-4 xl:grid-cols-3">
            <AdminInsightCard title="New customers over time" className="xl:col-span-2">
              <AdminCountSeriesChart
                data={toDayBuckets(r.newSeries)}
                granularity="day"
                series={[{ key: "newCustomers", label: "New customers", format: "count", color: "var(--chart-customers)" }]}
                emptyLabel="No new customers in this period"
              />
            </AdminInsightCard>
            <AdminInsightCard title="Customer activity in period">
              <AdminDonutChart rows={distributionRows(customerSegmentRows, r.segments)} centerLabel="Customers" emptyLabel="No customers yet" />
            </AdminInsightCard>
          </div>

          <div className="space-y-2">
            <AdminInsightCard title="Most active customers" flush>
                <AdminDataTable className="rounded-none border-0" columns={columns} data={r.rows} emptyState={<span>No customer activity in this period</span>} />
              </AdminInsightCard>
            <p className="text-xs text-muted-foreground">Top 100 customers with a consultation or order in the period, by order value.</p>
          </div>
        </div>
      )}
    </ReportQueryState>
  );
}
