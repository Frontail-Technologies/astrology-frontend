"use client";

import { useMemo, useState } from "react";
import { CalendarCheck, CalendarClock, CalendarDays, CalendarX } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { astrologers } from "@/features/astrologers/data/astrologers";
import { formatINR } from "../../lib/format";
import { consultationSeriesConfig } from "../../insights/chart-palette";
import type { DateRange } from "../../insights/date-range";
import {
  getConsultationReport,
  type ConsultationFilters,
} from "../../insights/report-selectors";
import type { InsightsSnapshot } from "../../insights/use-insights-data";
import { AdminDataTable } from "../shared/admin-data-table";
import { AdminDataTableColumnHeader } from "../shared/admin-data-table-column-header";
import { AdminBarChart } from "../shared/admin-bar-chart";
import { AdminDonutChart } from "../shared/admin-donut-chart";
import { AdminTimeSeriesChart } from "../shared/admin-time-series-chart";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminMetricCard } from "../shared/admin-metric-card";
import { ReportFilterSelect } from "./report-controls";

type Row = ReturnType<typeof getConsultationReport>["byAstrologer"][number];

export function ReportsConsultations({ snapshot, range }: { snapshot: InsightsSnapshot; range: DateRange }) {
  const [filters, setFilters] = useState<ConsultationFilters>({ mode: "all", status: "all", astrologerId: "all" });
  const report = getConsultationReport(snapshot, range, filters);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: "name", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Astrologer" />, enableHiding: false, cell: ({ row }) => <span className="font-medium">{row.original.name}</span> },
      { accessorKey: "total", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Consultations" />, cell: ({ row }) => <span className="tabular-nums">{row.original.total}</span> },
      { accessorKey: "completed", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Completed" />, cell: ({ row }) => <span className="tabular-nums">{row.original.completed}</span> },
      { accessorKey: "cancelled", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Cancelled" />, cell: ({ row }) => <span className="tabular-nums">{row.original.cancelled}</span> },
      {
        accessorKey: "paidInPaise",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Paid value" />,
        cell: ({ row }) => (
          <span className="tabular-nums">{row.original.paidInPaise ? formatINR(row.original.paidInPaise) : "—"}</span>
        ),
      },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-2">
        <ReportFilterSelect
          label="Filter by mode"
          value={filters.mode}
          onChange={(mode) => setFilters((f) => ({ ...f, mode: mode as ConsultationFilters["mode"] }))}
          options={[{ value: "all", label: "All modes" }, ...["Chat", "Voice", "Video"].map((m) => ({ value: m, label: m }))]}
        />
        <ReportFilterSelect
          label="Filter by status"
          value={filters.status}
          onChange={(status) => setFilters((f) => ({ ...f, status: status as ConsultationFilters["status"] }))}
          options={[
            { value: "all", label: "All statuses" },
            ...["pending", "confirmed", "completed", "cancelled"].map((s) => ({ value: s, label: s[0].toUpperCase() + s.slice(1) })),
          ]}
        />
        <ReportFilterSelect
          label="Filter by astrologer"
          className="w-48"
          value={filters.astrologerId}
          onChange={(astrologerId) => setFilters((f) => ({ ...f, astrologerId }))}
          options={[{ value: "all", label: "All astrologers" }, ...astrologers.map((a) => ({ value: a.id, label: a.name }))]}
        />
      </div>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Total consultations" value={report.total} icon={CalendarDays} tone="violet" href="/admin/consultations" />
        <AdminMetricCard label="Completed" value={report.completed} icon={CalendarCheck} tone="green" />
        <AdminMetricCard label="Upcoming" value={report.upcoming} icon={CalendarClock} tone="blue" />
        <AdminMetricCard
          label="Cancelled"
          value={report.cancelled}
          secondary={report.cancellationRate === null ? undefined : `${report.cancellationRate}% of bookings`}
          icon={CalendarX}
          tone="neutral"
        />
      </div>

      <AdminInsightCard title="Consultations over time">
        <AdminTimeSeriesChart data={report.series} config={consultationSeriesConfig} />
      </AdminInsightCard>

      <div className="grid gap-4 md:grid-cols-2">
        <AdminInsightCard title="Mode distribution">
          <AdminDonutChart rows={report.modeRows} centerLabel="Consultations" />
        </AdminInsightCard>
        <AdminInsightCard title="Status distribution">
          <AdminBarChart rows={report.statusRows} />
        </AdminInsightCard>
      </div>

      <div className="space-y-2">
        <h2 className="text-sm font-semibold text-foreground">Astrologer performance</h2>
        <AdminDataTable
          columns={columns}
          data={report.byAstrologer}
          emptyState={<span>No data for this period</span>}
        />
        <p className="text-xs text-muted-foreground">
          Paid value is the sum of successful consultation payments linked to each astrologer&apos;s consultations in
          this period.
        </p>
      </div>
    </div>
  );
}
