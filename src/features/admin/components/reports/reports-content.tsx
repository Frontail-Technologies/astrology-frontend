"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { FileClock, Flag, MessageSquareQuote, Newspaper } from "lucide-react";
import { ChartContainer, ChartLegend, ChartLegendContent, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { contentStatusConfig } from "../../insights/chart-palette";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import type { DateRange } from "../../insights/date-range";
import { getContentReport } from "../../insights/report-selectors";
import type { InsightsSnapshot } from "../../insights/use-insights-data";
import { AdminDataTable } from "../shared/admin-data-table";
import { AdminDataTableColumnHeader } from "../shared/admin-data-table-column-header";
import { AdminSegmentedStatus } from "../shared/admin-segmented-status";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminMetricCard } from "../shared/admin-metric-card";
import { AdminProgressRow } from "../shared/admin-progress-row";
import { ReportFilterSelect } from "./report-controls";

type Row = ReturnType<typeof getContentReport>["tableRows"][number];

export function ReportsContent({ snapshot, range }: { snapshot: InsightsSnapshot; range: DateRange }) {
  const report = getContentReport(snapshot, range);
  const [type, setType] = useState("all");
  const { readiness } = report;
  const rows = type === "all" ? report.tableRows : report.tableRows.filter((row) => row.id === type);

  const columns = useMemo<ColumnDef<Row>[]>(
    () => [
      { accessorKey: "type", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Content" />, enableHiding: false, cell: ({ row }) => <span className="font-medium">{row.original.type}</span> },
      { accessorKey: "ready", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Ready" />, cell: ({ row }) => <span className="tabular-nums">{row.original.ready}</span> },
      { accessorKey: "total", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Total" />, cell: ({ row }) => <span className="tabular-nums">{row.original.total}</span> },
      { id: "detail", enableSorting: false, header: () => <span>Detail</span>, cell: ({ row }) => <span className="text-muted-foreground">{row.original.detail}</span> },
    ],
    [],
  );

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <AdminMetricCard label="Articles published" value={report.publishedInRange} secondary="In period" icon={Newspaper} tone="purple" href="/admin/articles" />
        <AdminMetricCard label="Scheduled articles" value={readiness.articles.scheduled} secondary="Current" icon={FileClock} tone="blue" />
        <AdminMetricCard label="Pending reviews" value={report.pendingReviews} secondary={`${report.reviewsInRange} received in period`} icon={MessageSquareQuote} tone="amber" href="/admin/reviews" />
        <AdminMetricCard label="Reported reviews" value={report.reportedReviews} secondary="Current" icon={Flag} tone="red" href="/admin/reviews" />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <AdminInsightCard title="Content by status">
          <ChartContainer config={contentStatusConfig} className="aspect-auto h-[240px] w-full">
            <BarChart data={report.statusBars} layout="vertical" margin={{ top: 4, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
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
          <div className="space-y-4">
            <AdminProgressRow label="Astrologer profiles complete" value={readiness.astrologers.ready} total={readiness.astrologers.total} tone="blue" />
            <AdminProgressRow label="Pooja content complete" value={readiness.poojas.ready} total={readiness.poojas.total} tone="orange" />
            <AdminProgressRow
              label="Daily horoscope coverage"
              value={readiness.horoscopes.published}
              total={readiness.horoscopes.total}
              detail={readiness.horoscopes.date ? `Latest set: ${readiness.horoscopes.date}` : undefined}
              tone="violet"
            />
            <AdminSegmentedStatus
              label="Calculator implementation"
              segments={[
                { label: "partial", value: readiness.calculators.partial, tone: "teal" },
                { label: "catalog only", value: readiness.calculators.catalogOnly, tone: "neutral" },
              ]}
            />
          </div>
        </AdminInsightCard>
      </div>

      <div className="space-y-2">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <h2 className="text-sm font-semibold text-foreground">Content status</h2>
          <ReportFilterSelect
            label="Filter by content type"
            value={type}
            onChange={setType}
            options={[{ value: "all", label: "All content" }, ...report.tableRows.map((row) => ({ value: row.id, label: row.type }))]}
          />
        </div>
        <AdminDataTable columns={columns} data={rows} emptyState={<span>No content</span>} />
        <p className="text-xs text-muted-foreground">
          Readiness and current-state counts are not date-filtered. Only figures labelled &quot;in period&quot; follow
          the selected range.
        </p>
      </div>
    </div>
  );
}
