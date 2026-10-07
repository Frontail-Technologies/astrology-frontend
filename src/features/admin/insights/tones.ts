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

/** Soft accents for insight surfaces. One place so Dashboard and Reports agree. */
export const toneClasses: Record<InsightTone, { tile: string; bar: string; dot: string }> = {
  blue: { tile: "bg-sky-500/10 text-sky-700 dark:text-sky-300", bar: "bg-sky-500", dot: "bg-sky-500" },
  violet: { tile: "bg-violet-500/10 text-violet-700 dark:text-violet-300", bar: "bg-violet-500", dot: "bg-violet-500" },
  orange: { tile: "bg-primary/10 text-primary", bar: "bg-primary", dot: "bg-primary" },
  green: { tile: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300", bar: "bg-emerald-500", dot: "bg-emerald-500" },
  amber: { tile: "bg-amber-500/12 text-amber-700 dark:text-amber-300", bar: "bg-amber-500", dot: "bg-amber-500" },
  red: { tile: "bg-red-500/10 text-red-700 dark:text-red-300", bar: "bg-red-500", dot: "bg-red-500" },
  teal: { tile: "bg-teal-500/10 text-teal-700 dark:text-teal-300", bar: "bg-teal-500", dot: "bg-teal-500" },
  purple: { tile: "bg-purple-500/10 text-purple-700 dark:text-purple-300", bar: "bg-purple-500", dot: "bg-purple-500" },
  neutral: { tile: "bg-muted text-muted-foreground", bar: "bg-muted-foreground/40", dot: "bg-muted-foreground/50" },
};

export const orderStatusTone = {
  pending: "amber",
  processing: "blue",
  shipped: "violet",
  delivered: "green",
  cancelled: "neutral",
  returned: "red",
} as const satisfies Record<string, InsightTone>;

export const paymentStatusTone = {
  success: "green",
  pending: "amber",
  failed: "red",
  refunded: "neutral",
  "partially-refunded": "orange",
} as const satisfies Record<string, InsightTone>;

export const consultationStatusTone = {
  pending: "amber",
  confirmed: "blue",
  completed: "green",
  cancelled: "neutral",
} as const satisfies Record<string, InsightTone>;

export const consultationModeTone = {
  Chat: "blue",
  Voice: "green",
  Video: "violet",
} as const satisfies Record<string, InsightTone>;
