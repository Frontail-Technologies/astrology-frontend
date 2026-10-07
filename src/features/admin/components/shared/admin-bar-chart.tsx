"use client";

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { cn } from "@/lib/utils";
import { chartDataFromRows, configFromRows, type DistributionRow } from "../../insights/chart-palette";

export function AdminBarChart({
  rows,
  horizontal = false,
  className = "h-[220px]",
  emptyLabel = "No data for this period",
}: {
  rows: DistributionRow[];
  horizontal?: boolean;
  className?: string;
  emptyLabel?: string;
}) {
  if (rows.every((row) => row.value === 0)) {
    return (
      <div className={cn("grid place-items-center rounded-md bg-muted/30 text-sm text-muted-foreground", className)}>
        {emptyLabel}
      </div>
    );
  }

  const config = configFromRows(rows);
  const data = chartDataFromRows(rows);

  return (
    <ChartContainer config={config} className={cn("aspect-auto w-full", className)}>
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{ top: 8, right: 8, left: 0, bottom: 0 }}
        accessibilityLayer
      >
        <CartesianGrid vertical={horizontal} horizontal={!horizontal} strokeDasharray="3 3" />
        {horizontal ? (
          <>
            <XAxis type="number" tickLine={false} axisLine={false} allowDecimals={false} />
            <YAxis dataKey="label" type="category" tickLine={false} axisLine={false} width={96} />
          </>
        ) : (
          <>
            <XAxis dataKey="label" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis tickLine={false} axisLine={false} allowDecimals={false} width={28} />
          </>
        )}
        <ChartTooltip cursor={{ fill: "var(--muted)", opacity: 0.5 }} content={<ChartTooltipContent hideLabel nameKey="key" />} />
        <Bar dataKey="value" radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={44} />
      </BarChart>
    </ChartContainer>
  );
}
