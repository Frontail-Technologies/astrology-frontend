"use client";

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";

import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { cn } from "@/lib/utils";

const shortDate = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short" });
const longDate = new Intl.DateTimeFormat("en-IN", { weekday: "short", day: "numeric", month: "short", year: "numeric" });
const parseDay = (key: string) => new Date(`${key}T00:00:00`);

export function AdminTimeSeriesChart<T extends { date: string }>({
  data,
  config,
  valueFormatter,
  axisFormatter,
  className = "h-[260px]",
  emptyLabel = "No data for this period",
}: {
  data: T[];
  config: ChartConfig;
  valueFormatter?: (value: number) => string;
  axisFormatter?: (value: number) => string;
  className?: string;
  emptyLabel?: string;
}) {
  const keys = Object.keys(config);
  const hasData = data.some((point) =>
    keys.some((key) => Number((point as Record<string, unknown>)[key]) > 0),
  );

  if (!hasData) {
    return (
      <div className={cn("grid w-full place-items-center rounded-md bg-muted/30 text-sm text-muted-foreground", className)}>
        {emptyLabel}
      </div>
    );
  }

  return (
    <ChartContainer config={config} className={cn("aspect-auto w-full", className)}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }} accessibilityLayer>
        <CartesianGrid vertical={false} strokeDasharray="3 3" />
        <XAxis
          dataKey="date"
          tickLine={false}
          axisLine={false}
          tickMargin={8}
          minTickGap={32}
          tickFormatter={(value: string) => shortDate.format(parseDay(value))}
        />
        <YAxis
          tickLine={false}
          axisLine={false}
          allowDecimals={false}
          width={axisFormatter ? 48 : 28}
          tickFormatter={axisFormatter}
        />
        <ChartTooltip
          cursor={{ strokeDasharray: "3 3" }}
          content={
            <ChartTooltipContent
              labelFormatter={(value) => longDate.format(parseDay(String(value)))}
              formatter={
                valueFormatter
                  ? (value, name, item) => (
                      <>
                        <span
                          className="size-2.5 shrink-0 rounded-[2px]"
                          style={{ backgroundColor: item.color }}
                          aria-hidden="true"
                        />
                        <span className="flex-1 text-muted-foreground">
                          {config[String(name)]?.label ?? name}
                        </span>
                        <span className="font-mono font-medium tabular-nums text-foreground">
                          {valueFormatter(Number(value))}
                        </span>
                      </>
                    )
                  : undefined
              }
            />
          }
        />
        {keys.length > 1 ? <ChartLegend content={<ChartLegendContent />} /> : null}
        {keys.map((key) => (
          <Area
            key={key}
            dataKey={key}
            type="monotone"
            stroke={`var(--color-${key})`}
            fill={`var(--color-${key})`}
            fillOpacity={0.12}
            strokeWidth={2}
            dot={false}
          />
        ))}
      </AreaChart>
    </ChartContainer>
  );
}
