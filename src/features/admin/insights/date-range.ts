export type RangePreset = "7d" | "30d" | "90d" | "custom";
export type RangeState = { preset: RangePreset; customFrom: string; customTo: string };
export type DateRange = { from: Date; to: Date };

export const defaultRangeState: RangeState = { preset: "30d", customFrom: "", customTo: "" };

const DAY_MS = 24 * 60 * 60 * 1000;
const presetDays = { "7d": 7, "30d": 30, "90d": 90 } as const;

export function resolveRange(state: RangeState, now: Date): DateRange {
  if (state.preset === "custom" && state.customFrom && state.customTo) {
    return {
      from: new Date(`${state.customFrom}T00:00:00`),
      to: new Date(`${state.customTo}T23:59:59.999`),
    };
  }
  const days = presetDays[state.preset === "custom" ? "30d" : state.preset];
  const to = new Date(now);
  to.setHours(23, 59, 59, 999);
  return { from: new Date(to.getTime() - days * DAY_MS), to };
}

export function isDateInRange(value: string | undefined, range: DateRange) {
  if (!value) return false;
  const time = new Date(value).getTime();
  return time >= range.from.getTime() && time <= range.to.getTime();
}

export function filterByDateRange<T>(
  items: T[],
  getDate: (item: T) => string | undefined,
  range: DateRange,
) {
  return items.filter((item) => isDateInRange(getDate(item), range));
}
