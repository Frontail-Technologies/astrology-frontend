"use client";

import { Pie, PieChart } from "recharts";

import { ChartContainer, ChartTooltip, ChartTooltipContent } from "@/components/ui/chart";
import { chartDataFromRows, configFromRows, type DistributionRow } from "../../insights/chart-palette";

export function AdminDonutChart({
  rows,
  centerLabel,
  centerValue,
  emptyLabel = "No data for this period",
}: {
  rows: DistributionRow[];
  centerLabel: string;
  centerValue?: string | number;
  emptyLabel?: string;
}) {
  const total = rows.reduce((sum, row) => sum + row.value, 0);

  if (total === 0) {
    return (
      <div className="grid h-[220px] place-items-center rounded-md bg-muted/30 text-sm text-muted-foreground">
        {emptyLabel}
      </div>
    );
  }

  const config = configFromRows(rows);
  const data = chartDataFromRows(rows.filter((row) => row.value > 0));

  return (
    <div className="space-y-3">
      <div className="relative mx-auto h-[180px] w-[180px]">
        <ChartContainer config={config} className="aspect-auto h-full w-full">
          <PieChart>
            <ChartTooltip content={<ChartTooltipContent hideLabel nameKey="key" />} />
            <Pie
              data={data}
              dataKey="value"
              nameKey="key"
              innerRadius="64%"
              outerRadius="92%"
              strokeWidth={2}
              paddingAngle={data.length > 1 ? 2 : 0}
            />
          </PieChart>
        </ChartContainer>
        <div className="pointer-events-none absolute inset-0 grid place-content-center text-center">
          <p className="text-2xl font-semibold leading-none tabular-nums text-foreground">{centerValue ?? total}</p>
          <p className="mt-1 text-xs text-muted-foreground">{centerLabel}</p>
        </div>
      </div>
      <ul className="grid gap-1.5 text-xs">
        {rows.map((row) => (
          <li key={row.key} className="flex items-center justify-between gap-3">
            <span className="flex min-w-0 items-center gap-2 text-foreground">
              <span
                className="size-2.5 shrink-0 rounded-[2px]"
                style={{ backgroundColor: config[row.key]?.color }}
                aria-hidden="true"
              />
              <span className="truncate">{row.label}</span>
            </span>
            <span className="shrink-0 tabular-nums text-muted-foreground">
              <span className="font-semibold text-foreground">{row.value}</span> · {Math.round((row.value / total) * 100)}%
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
