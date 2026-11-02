"use client";

import { Area, AreaChart, Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import type { AdminGranularity } from "@/features/admin/data/admin-range";
import { cn } from "@/lib/utils";

import { formatCompactINR, formatINR } from "../../lib/format";
import { AdminChartEmpty } from "./admin-empty-state";

export type AdminSeriesFormat = "count" | "paise";

/** One plotted field of a backend bucket. `color` defaults to a CSS chart variable from a fixed rotation. */
export type AdminSeriesConfig<K extends string = string> = { key: K; label: string; format: AdminSeriesFormat; color?: string };

/** Backend series bucket: `bucketStart` (ISO, UTC bucket start) plus numeric fields. */
export type AdminSeriesBucket = { bucketStart: string };

const DEFAULT_COLORS = [
  "var(--chart-orders)",
  "var(--chart-consultations)",
  "var(--chart-payments)",
  "var(--chart-customers)",
  "var(--chart-pending)",
  "var(--chart-teal)",
];

const countFormat = new Intl.NumberFormat("en-IN");
const compactCount = new Intl.NumberFormat("en-IN", { notation: "compact", maximumFractionDigits: 1 });
// Buckets are UTC-truncated by the API (`date_trunc` at UTC), so label them in UTC to avoid off-by-one days.
const dayLabel = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", timeZone: "UTC" });
const longDayLabel = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
const monthLabel = new Intl.DateTimeFormat("en-IN", { month: "short", year: "numeric", timeZone: "UTC" });

export function formatSeriesValue(value: number, format: AdminSeriesFormat): string {
  return format === "paise" ? formatINR(Math.round(value)) : countFormat.format(value);
}

export function formatBucketLabel(bucketStart: string, granularity: AdminGranularity, long = false): string {
  const date = new Date(bucketStart);
  if (Number.isNaN(date.getTime())) return bucketStart;
  if (granularity === "month") return monthLabel.format(date);
  if (granularity === "week") return `${long ? "Week of " : ""}${dayLabel.format(date)}`;
  return long ? longDayLabel.format(date) : dayLabel.format(date);
}

/**
 * Area (default) or bar chart over backend bucket arrays such as `GET /admin/reports/revenue-series` items.
 * Values are plotted as received (paise stay paise) and formatted per series: `count` -> `1,234`,
 * `paise` -> `₹12.34`. When every series is money the axis shows compact rupees. All-zero data renders `emptyLabel`.
 *
 * ```tsx
 * <AdminCountSeriesChart data={series.items} granularity={range.granularity} series={[
 *   { key: "paidChatGrossRevenuePaise", label: "Paid chat revenue", format: "paise" },
 *   { key: "storeOrderRevenuePaise", label: "Store revenue", format: "paise" },
 * ]} />
 * ```
 */
export function AdminCountSeriesChart<T extends AdminSeriesBucket>({
  data,
  series,
  granularity = "day",
  kind = "area",
  stacked = false,
  className = "h-[260px]",
  emptyLabel = "No data for this period",
}: {
  data: readonly T[];
  series: readonly AdminSeriesConfig<Extract<keyof T, string>>[];
  granularity?: AdminGranularity;
  kind?: "area" | "bar";
  stacked?: boolean;
  className?: string;
  emptyLabel?: string;
}) {
  const config: ChartConfig = Object.fromEntries(
    series.map((item, index) => [item.key, { label: item.label, color: item.color ?? DEFAULT_COLORS[index % DEFAULT_COLORS.length] }]),
  );
  const formats = new Map<string, AdminSeriesFormat>(series.map((item) => [item.key, item.format]));
  const allMoney = series.length > 0 && series.every((item) => item.format === "paise");
  const rows = data.map((bucket) => {
    const row: Record<string, string | number> = { bucketStart: bucket.bucketStart };
    for (const item of series) {
      const raw = Number((bucket as Record<string, unknown>)[item.key]);
      row[item.key] = Number.isFinite(raw) ? raw : 0;
    }
    return row;
  });
  const hasData = rows.some((row) => series.some((item) => Number(row[item.key]) !== 0));

  if (!hasData) {
    return <AdminChartEmpty label={emptyLabel} />;
  }

  const axisFormatter = (value: number) => (allMoney ? formatCompactINR(value / 100) : compactCount.format(value));
  const common = (
    <>
      <CartesianGrid vertical={false} stroke="var(--border)" />
      <XAxis
        dataKey="bucketStart"
        tickLine={false}
        axisLine={false}
        tickMargin={8}
        minTickGap={32}
        tickFormatter={(value: string) => formatBucketLabel(value, granularity)}
      />
      <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={allMoney ? 56 : 36} tickFormatter={axisFormatter} />
      <ChartTooltip
        cursor={kind === "area" ? { strokeDasharray: "3 3" } : { fillOpacity: 0.08 }}
        content={
          <ChartTooltipContent
            labelFormatter={(value) => formatBucketLabel(String(value), granularity, true)}
            formatter={(value, name, item) => (
              <>
                <span className="size-2.5 shrink-0 rounded-[2px]" style={{ backgroundColor: item.color }} aria-hidden="true" />
                <span className="flex-1 text-muted-foreground">{config[String(name)]?.label ?? name}</span>
                <span className="font-mono font-medium tabular-nums text-foreground">
                  {formatSeriesValue(Number(value), formats.get(String(name)) ?? "count")}
                </span>
              </>
            )}
          />
        }
      />
      {series.length > 1 ? <ChartLegend content={<ChartLegendContent />} /> : null}
    </>
  );

  return (
    <ChartContainer config={config} className={cn("aspect-auto w-full", className)}>
      {kind === "bar" ? (
        // Tight gaps: with ~30 daily buckets and several grouped series, the default 4px bar gap leaves hairline bars.
        <BarChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} barGap={1} barCategoryGap="12%" accessibilityLayer>
          {common}
          {series.map((item, index) => (
            <Bar
              key={item.key}
              dataKey={item.key}
              fill={`var(--color-${item.key})`}
              radius={stacked && index < series.length - 1 ? 0 : [3, 3, 0, 0]}
              {...(stacked ? { stackId: "total" } : {})}
            />
          ))}
        </BarChart>
      ) : (
        <AreaChart data={rows} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
          {common}
          {series.map((item) => (
            <Area
              key={item.key}
              dataKey={item.key}
              type="monotone"
              stroke={`var(--color-${item.key})`}
              fill={`var(--color-${item.key})`}
              fillOpacity={0.12}
              strokeWidth={2}
              dot={false}
              {...(stacked ? { stackId: "total" } : {})}
            />
          ))}
        </AreaChart>
      )}
    </ChartContainer>
  );
}
