import type { ChartConfig } from "@/components/ui/chart";
import type { InsightTone } from "./tones";

/** Tone → admin chart CSS variable (defined once in globals.css). */
export const toneColor: Record<InsightTone, string> = {
  blue: "var(--chart-customers)",
  violet: "var(--chart-consultations)",
  orange: "var(--chart-orders)",
  green: "var(--chart-success)",
  amber: "var(--chart-pending)",
  red: "var(--chart-failed)",
  teal: "var(--chart-teal)",
  purple: "var(--chart-content)",
  neutral: "var(--chart-neutral)",
};

export const activitySeriesConfig = {
  consultations: { label: "Consultations", color: "var(--chart-consultations)" },
  orders: { label: "Orders", color: "var(--chart-orders)" },
  payments: { label: "Successful payments", color: "var(--chart-payments)" },
} satisfies ChartConfig;

export const consultationSeriesConfig = {
  consultations: { label: "Consultations", color: "var(--chart-consultations)" },
} satisfies ChartConfig;

export const orderValueSeriesConfig = {
  orderValue: { label: "Order value", color: "var(--chart-orders)" },
} satisfies ChartConfig;

export const newCustomerSeriesConfig = {
  newCustomers: { label: "New customers", color: "var(--chart-customers)" },
} satisfies ChartConfig;

export const contentStatusConfig = {
  live: { label: "Published / approved", color: "var(--chart-success)" },
  inProgress: { label: "Scheduled / pending", color: "var(--chart-pending)" },
  other: { label: "Draft / other", color: "var(--chart-neutral)" },
} satisfies ChartConfig;

export type DistributionRow = { key: string; label: string; value: number; tone: InsightTone };

export function configFromRows(rows: DistributionRow[]): ChartConfig {
  return {
    value: { label: "Count" },
    ...Object.fromEntries(rows.map((row) => [row.key, { label: row.label, color: toneColor[row.tone] }])),
  };
}

export function chartDataFromRows(rows: DistributionRow[]) {
  return rows.map((row) => ({
    key: row.key,
    label: row.label,
    value: row.value,
    fill: `var(--color-${row.key})`,
  }));
}
