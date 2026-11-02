"use client";

import { useMemo } from "react";
import Link from "next/link";
import { CalendarCheck, CalendarDays, CalendarX, IndianRupee, MessagesSquare, Percent } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { useAstrologerPicker } from "@/features/astrologers/hooks/use-astrologer-admin";
import { consultationModeLabels, consultationStatusLabels, lifecycleRows, modeRows } from "@/features/insights/constants/insights-status";
import { useConsultationReport } from "@/features/insights/hooks/use-insights-admin";
import { distributionRows, percentOf, toDayBuckets } from "@/features/insights/lib/insights-view-models";
import {
  consultationReportModes,
  consultationReportStatuses,
  type ConsultationReport,
  type ConsultationReportFilters,
  type ConsultationReportMode,
  type ConsultationReportStatus,
  type RangeQuery,
} from "@/features/insights/types/insights-admin";
import { formatDuration, formatINR } from "../../lib/format";
import { AdminBarChart } from "../shared/admin-bar-chart";
import { AdminCountSeriesChart } from "../shared/admin-count-series-chart";
import { AdminDataTable } from "../shared/admin-data-table";
import { AdminDataTableColumnHeader } from "../shared/admin-data-table-column-header";
import { AdminDonutChart } from "../shared/admin-donut-chart";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminMetricCard } from "../shared/admin-metric-card";
import { ReportFilterSelect } from "./report-controls";
import { ReportQueryState } from "./report-query-state";

type Row = ConsultationReport["astrologerPerformance"][number];
const ALL = "all";

export function ReportsConsultations({
  range,
  filters,
  onFiltersChange,
}: {
  range: RangeQuery;
  filters: ConsultationReportFilters;
  onFiltersChange: (next: ConsultationReportFilters) => void;
}) {
  const report = useConsultationReport(range, filters);
  const picker = useAstrologerPicker(true);

  const astrologerOptions = useMemo(() => {
    const names = new Map<string, string>();
    for (const astrologer of picker.data?.items ?? []) names.set(astrologer.id, astrologer.displayName);
    for (const row of report.data?.astrologerPerformance ?? []) if (!names.has(row.astrologerId)) names.set(row.astrologerId, row.displayName);
    if (filters.astrologerId && !names.has(filters.astrologerId)) names.set(filters.astrologerId, "Selected astrologer");
    return [{ value: ALL, label: "All astrologers" }, ...[...names].map(([value, label]) => ({ value, label })).sort((a, b) => a.label.localeCompare(b.label))];
  }, [picker.data, report.data, filters.astrologerId]);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      {
        accessorKey: "displayName",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Astrologer" />,
        enableHiding: false,
        cell: ({ row }) => (
          <Link href={`/admin/astrologers/${row.original.astrologerId}`} className="font-medium hover:underline">
            {row.original.displayName}
          </Link>
        ),
      },
      { accessorKey: "consultations", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Consultations" />, cell: ({ row }) => <span className="tabular-nums">{row.original.consultations}</span> },
      { accessorKey: "completed", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Completed" />, cell: ({ row }) => <span className="tabular-nums">{row.original.completed}</span> },
      { accessorKey: "cancelled", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Cancelled" />, cell: ({ row }) => <span className="tabular-nums">{row.original.cancelled}</span> },
      {
        accessorKey: "grossChargedPaise",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Paid chat gross" />,
        cell: ({ row }) => <span className="tabular-nums">{row.original.grossChargedPaise ? formatINR(row.original.grossChargedPaise) : "—"}</span>,
      },
    ],
    [],
  );

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <ReportFilterSelect
          label="Filter by mode"
          value={filters.mode ?? ALL}
          onChange={(mode) => onFiltersChange({ ...filters, mode: mode === ALL ? null : (mode as ConsultationReportMode) })}
          options={[{ value: ALL, label: "All modes" }, ...consultationReportModes.map((mode) => ({ value: mode, label: consultationModeLabels[mode] }))]}
        />
        <ReportFilterSelect
          label="Filter by status"
          value={filters.status ?? ALL}
          onChange={(status) => onFiltersChange({ ...filters, status: status === ALL ? null : (status as ConsultationReportStatus) })}
          options={[{ value: ALL, label: "All statuses" }, ...consultationReportStatuses.map((status) => ({ value: status, label: consultationStatusLabels[status] }))]}
        />
        <ReportFilterSelect
          label="Filter by astrologer"
          className="w-52"
          value={filters.astrologerId ?? ALL}
          onChange={(astrologerId) => onFiltersChange({ ...filters, astrologerId: astrologerId === ALL ? null : astrologerId })}
          options={astrologerOptions}
        />
      </div>

      <ReportQueryState queries={[report] as const} label="the consultation report">
        {([r]) => {
          const cancellationRate = percentOf(r.byStatus.cancelled, r.totalConsultations);
          return (
            <>
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                <AdminMetricCard label="Consultations" value={r.totalConsultations} secondary="Created in period" icon={CalendarDays} tone="violet" href="/admin/consultations" />
                <AdminMetricCard
                  label="Completed"
                  value={r.byStatus.completed}
                  secondary={`${r.byStatus.inProgress} in progress · ${r.byStatus.scheduled} scheduled`}
                  icon={CalendarCheck}
                  tone="green"
                />
                <AdminMetricCard
                  label="Cancelled or rejected"
                  value={r.byStatus.cancelled + r.byStatus.rejected}
                  secondary={cancellationRate === null ? undefined : `${cancellationRate}% cancelled`}
                  icon={CalendarX}
                  tone="neutral"
                />
                <AdminMetricCard
                  label="Paid chat sessions"
                  value={r.paidChatSessions}
                  secondary={`Average billed ${formatDuration(r.averageBilledDurationSeconds)}`}
                  icon={MessagesSquare}
                  tone="blue"
                  href="/admin/chat-sessions"
                />
                <AdminMetricCard label="Gross charged" value={formatINR(r.grossChargedPaise)} secondary="Paid chat earnings in period" icon={IndianRupee} tone="orange" />
                <AdminMetricCard
                  label="Platform fee"
                  value={formatINR(r.platformFeePaise)}
                  secondary={`${formatINR(r.astrologerEarningsPaise)} to astrologers`}
                  icon={Percent}
                  tone="green"
                  href="/admin/earnings"
                />
              </div>

              <AdminInsightCard title="Consultations over time">
                <AdminCountSeriesChart
                  data={toDayBuckets(r.series)}
                  granularity="day"
                  series={[
                    { key: "created", label: "Created", format: "count", color: "var(--chart-consultations)" },
                    { key: "completed", label: "Completed", format: "count", color: "var(--chart-success)" },
                    { key: "cancelled", label: "Cancelled", format: "count", color: "var(--chart-neutral)" },
                  ]}
                />
              </AdminInsightCard>

              <div className="grid gap-4 md:grid-cols-2">
                <AdminInsightCard title="Mode distribution">
                  <AdminDonutChart rows={distributionRows(modeRows, r.byMode)} centerLabel="Consultations" />
                </AdminInsightCard>
                <AdminInsightCard title="Status distribution">
                  <AdminBarChart rows={distributionRows(lifecycleRows, r.byStatus)} />
                </AdminInsightCard>
              </div>

              <div className="space-y-2">
                <AdminInsightCard title="Astrologer performance" flush>
                <AdminDataTable className="rounded-none border-0" columns={columns} data={r.astrologerPerformance} emptyState={<span>No consultations in this period</span>} />
              </AdminInsightCard>
                <p className="text-xs text-muted-foreground">Top 50 astrologers by consultations. Paid chat gross is billed chat earnings in the period.</p>
              </div>
            </>
          );
        }}
      </ReportQueryState>
    </div>
  );
}
