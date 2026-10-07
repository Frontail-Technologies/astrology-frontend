import { filterByDateRange, type DateRange } from "./date-range";
import type { InsightsSnapshot } from "./use-insights-data";

const pad = (n: number) => String(n).padStart(2, "0");

/** Local calendar day key (YYYY-MM-DD). Charts bucket on the viewer's day. */
export const dayKey = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

export const consultationDate = (c: InsightsSnapshot["consultations"][number]) => c.createdAt ?? c.scheduledAt;

/** Every day in the range, including days with no records, so series keep their true shape. */
export function enumerateDays(range: DateRange, maxDays = 366) {
  const days: string[] = [];
  const cursor = new Date(range.from.getFullYear(), range.from.getMonth(), range.from.getDate());
  const end = new Date(range.to.getFullYear(), range.to.getMonth(), range.to.getDate());
  while (cursor <= end) {
    days.push(dayKey(cursor));
    cursor.setDate(cursor.getDate() + 1);
  }
  return days.slice(-maxDays);
}

export type DailyPoint<K extends string> = { date: string } & Record<K, number>;

function bucketTotals<T>(
  items: T[],
  getDate: (item: T) => string | undefined,
  getValue: (item: T) => number,
  range: DateRange,
) {
  const totals = new Map<string, number>();
  for (const item of filterByDateRange(items, getDate, range)) {
    const key = dayKey(new Date(getDate(item) as string));
    totals.set(key, (totals.get(key) ?? 0) + getValue(item));
  }
  return totals;
}

export function dailyCountSeries<T, K extends string>(
  items: T[],
  getDate: (item: T) => string | undefined,
  range: DateRange,
  key: K,
): DailyPoint<K>[] {
  const totals = bucketTotals(items, getDate, () => 1, range);
  return enumerateDays(range).map((date) => ({ date, [key]: totals.get(date) ?? 0 }) as DailyPoint<K>);
}

/** Sums integer paise per day and converts to rupees only for plotting. */
export function dailyValueSeries<T, K extends string>(
  items: T[],
  getDate: (item: T) => string | undefined,
  getPaise: (item: T) => number,
  range: DateRange,
  key: K,
): DailyPoint<K>[] {
  const totals = bucketTotals(items, getDate, getPaise, range);
  return enumerateDays(range).map(
    (date) => ({ date, [key]: (totals.get(date) ?? 0) / 100 }) as DailyPoint<K>,
  );
}

export function getActivitySeries(s: InsightsSnapshot, range: DateRange) {
  const consultations = bucketTotals(s.consultations, consultationDate, () => 1, range);
  const orders = bucketTotals(s.orders, (o) => o.createdAt, () => 1, range);
  const payments = bucketTotals(
    s.payments.filter((p) => p.status === "success"),
    (p) => p.createdAt,
    () => 1,
    range,
  );
  return enumerateDays(range).map((date) => ({
    date,
    consultations: consultations.get(date) ?? 0,
    orders: orders.get(date) ?? 0,
    payments: payments.get(date) ?? 0,
  }));
}
