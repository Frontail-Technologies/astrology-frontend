"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarDays, ShoppingBag, UserPlus, UsersRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { formatINR } from "../../lib/format";
import { newCustomerSeriesConfig } from "../../insights/chart-palette";
import type { DateRange } from "../../insights/date-range";
import { getCustomerReport } from "../../insights/report-selectors";
import type { InsightsSnapshot } from "../../insights/use-insights-data";
import { AdminDataTable } from "../shared/admin-data-table";
import { AdminDataTableColumnHeader } from "../shared/admin-data-table-column-header";
import { AdminDonutChart } from "../shared/admin-donut-chart";
import { AdminTimeSeriesChart } from "../shared/admin-time-series-chart";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminMetricCard } from "../shared/admin-metric-card";

type Row = ReturnType<typeof getCustomerReport>["rows"][number];

export function ReportsCustomers({ snapshot, range }: { snapshot: InsightsSnapshot; range: DateRange }) {
  const report = getCustomerReport(snapshot, range);

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
        accessorKey: "orderValueInPaise",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Order value" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.orderValueInPaise ? formatINR(row.original.orderValueInPaise) : "—"}</span>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Total customers" value={report.total} icon={UsersRound} tone="blue" href="/admin/customers" />
        <AdminMetricCard label="New in period" value={report.newInRange} icon={UserPlus} tone="blue" />
        <AdminMetricCard label="With consultations" value={report.withConsultations} secondary="In period" icon={CalendarDays} tone="violet" />
        <AdminMetricCard
          label="With orders"
          value={report.withOrders}
          secondary={`${report.both} did both`}
          icon={ShoppingBag}
          tone="orange"
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-3">
        <AdminInsightCard title="New customers over time" className="xl:col-span-2">
          <AdminTimeSeriesChart data={report.newSeries} config={newCustomerSeriesConfig} />
        </AdminInsightCard>
        <AdminInsightCard title="Customer activity in period">
          <AdminDonutChart rows={report.segmentRows} centerLabel="Customers" />
        </AdminInsightCard>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Customer activity</h2>
        <AdminDataTable columns={columns} data={report.rows} emptyState={<span>No data for this period</span>} />
      </div>
    </div>
  );
}
