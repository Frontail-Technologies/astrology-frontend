"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { FileClock, Flag, MessageSquareQuote, Newspaper } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { useContentReport } from "@/features/insights/hooks/use-insights-admin";
import { contentStatusBars, contentTableRows, type ContentTableRow } from "@/features/insights/lib/insights-view-models";
import type { RangeQuery } from "@/features/insights/types/insights-admin";
import { contentStatusConfig } from "../../insights/chart-palette";
import { AdminDataTable } from "../shared/admin-data-table";
import { AdminDataTableColumnHeader } from "../shared/admin-data-table-column-header";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminSectionHeading } from "../shared/admin-section-heading";
import { AdminMetricCard } from "../shared/admin-metric-card";
import { AdminProgressRow } from "../shared/admin-progress-row";
import { AdminSegmentedStatus } from "../shared/admin-segmented-status";
import { ReportFilterSelect } from "./report-controls";
import { ReportQueryState } from "./report-query-state";

export function ReportsContent({ range }: { range: RangeQuery }) {
  const report = useContentReport(range);
  const [type, setType] = useState("all");

  const columns = useMemo<ColumnDef<ContentTableRow>[]>(
    () => [
      { accessorKey: "type", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Content" />, enableHiding: false, cell: ({ row }) => <span className="font-medium">{row.original.type}</span> },
      { accessorKey: "ready", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Ready / live" />, cell: ({ row }) => <span className="tabular-nums">{row.original.ready}</span> },
      { accessorKey: "total", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Total" />, cell: ({ row }) => <span className="tabular-nums">{row.original.total}</span> },
      { id: "detail", enableSorting: false, header: () => <span>Detail</span>, cell: ({ row }) => <span className="text-muted-foreground">{row.original.detail}</span> },
    ],
    [],
  );

  return (
    <ReportQueryState queries={[report] as const} label="the content report">
      {([r]) => {
        const { readiness } = r;
        const tableRows = contentTableRows(r);
        const rows = type === "all" ? tableRows : tableRows.filter((row) => row.id === type);
        const horoscopeDate = readiness.horoscopes.date?.slice(0, 10);
        return (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <AdminMetricCard label="Articles published" value={r.publishedInRange} secondary="In period" icon={Newspaper} tone="purple" href="/admin/articles" />
              <AdminMetricCard label="Scheduled articles" value={readiness.articles.scheduled} secondary="Current" icon={FileClock} tone="blue" href="/admin/articles" />
              <AdminMetricCard
                label="Pending reviews"
                value={r.pendingReviews}
                secondary={`${r.reviewsInRange} received in period`}
                icon={MessageSquareQuote}
                tone="amber"
                href="/admin/reviews?status=pending"
              />
              <AdminMetricCard label="Reported reviews" value={r.reportedReviews} secondary="Current" icon={Flag} tone="red" href="/admin/reviews?status=reported" />
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <AdminInsightCard title="Content by status">
                <ChartContainer config={contentStatusConfig} className="aspect-auto h-60 w-full">
                  <BarChart data={contentStatusBars(r)} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
                    <CartesianGrid horizontal={false} strokeDasharray="3 3" />
                    <XAxis type="number" allowDecimals={false} tickLine={false} axisLine={false} />
                    <YAxis dataKey="type" type="category" tickLine={false} axisLine={false} width={84} />
                    <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<ChartTooltipContent />} />
                    <ChartLegend content={<ChartLegendContent />} />
                    <Bar dataKey="live" stackId="status" fill="var(--color-live)" maxBarSize={28} />
                    <Bar dataKey="inProgress" stackId="status" fill="var(--color-inProgress)" maxBarSize={28} />
                    <Bar dataKey="other" stackId="status" fill="var(--color-other)" radius={[0, 4, 4, 0]} maxBarSize={28} />
                  </BarChart>
                </ChartContainer>
              </AdminInsightCard>

              <AdminInsightCard title="Readiness">
                <div className="space-y-5">
                  <AdminProgressRow label="Astrologer profiles complete" value={readiness.astrologers.ready} total={readiness.astrologers.total} tone="blue" />
                  <AdminProgressRow label="Pooja content complete" value={readiness.poojas.ready} total={readiness.poojas.total} tone="orange" />
                  <AdminProgressRow
                    label="Daily horoscope coverage"
                    value={readiness.horoscopes.published}
                    total={readiness.horoscopes.total}
                    detail={horoscopeDate ? `Latest set: ${horoscopeDate}` : "No daily horoscopes yet"}
                    tone="violet"
                  />
                  <AdminSegmentedStatus
                    label="Calculators"
                    segments={[
                      { label: "with detail content", value: readiness.calculators.partial, tone: "teal" },
                      { label: "catalog only", value: readiness.calculators.catalogOnly, tone: "neutral" },
                    ]}
                  />
                </div>
              </AdminInsightCard>
            </div>

            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <AdminSectionHeading title="Content status" />
                <ReportFilterSelect
                  label="Filter by content type"
                  value={type}
                  onChange={setType}
                  options={[{ value: "all", label: "All content" }, ...tableRows.map((row) => ({ value: row.id, label: row.type }))]}
                />
              </div>
              <AdminDataTable columns={columns} data={rows} emptyState={<span>No content</span>} />
              <p className="text-xs text-muted-foreground">
                Readiness and status counts are current totals. Only figures labelled &quot;in period&quot; follow the selected range.
              </p>
            </div>
          </div>
        );
      }}
    </ReportQueryState>
  );
}
