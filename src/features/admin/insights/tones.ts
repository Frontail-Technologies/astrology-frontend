export type InsightTone =
  | "blue"
  | "violet"
  | "orange"
  | "green"
  | "amber"
  | "red"
  | "teal"
  | "purple"
  | "neutral";

/**
 * Accents for insight surfaces. One place so Dashboard and Reports agree.
 *
 * Icon tiles are deliberately monochrome for every tone (the admin is calm; colour is reserved for data and
 * status). `bar` / `dot` use the restrained admin chart palette (`--chart-*` in globals.css), so a tone reads the
 * same in a legend, a progress bar and a chart.
 */
const neutralTile = "bg-muted text-foreground/70";

export const toneClasses: Record<InsightTone, { tile: string; bar: string; dot: string }> = {
  blue: { tile: neutralTile, bar: "bg-[var(--chart-customers)]", dot: "bg-[var(--chart-customers)]" },
  violet: { tile: neutralTile, bar: "bg-[var(--chart-consultations)]", dot: "bg-[var(--chart-consultations)]" },
  orange: { tile: neutralTile, bar: "bg-[var(--chart-orders)]", dot: "bg-[var(--chart-orders)]" },
  green: { tile: neutralTile, bar: "bg-[var(--chart-success)]", dot: "bg-[var(--chart-success)]" },
  amber: { tile: neutralTile, bar: "bg-[var(--chart-pending)]", dot: "bg-[var(--chart-pending)]" },
  red: { tile: neutralTile, bar: "bg-[var(--chart-failed)]", dot: "bg-[var(--chart-failed)]" },
  teal: { tile: neutralTile, bar: "bg-[var(--chart-teal)]", dot: "bg-[var(--chart-teal)]" },
  purple: { tile: neutralTile, bar: "bg-[var(--chart-content)]", dot: "bg-[var(--chart-content)]" },
  neutral: { tile: neutralTile, bar: "bg-[var(--chart-neutral)]", dot: "bg-[var(--chart-neutral)]" },
};
