/**
 * Date-range presets for Admin dashboard/report reads (`/admin/dashboard/*`, `/admin/reports/*`). Pure (no React,
 * no `@/` aliases) so it runs under `node --test`.
 *
 * Same state shape as `admin/insights/date-range.ts` (`{ preset, customFrom, customTo }`, so the existing
 * `ReportRangeControl` can drive it), but resolves to what the API expects: ISO datetimes with the local offset,
 * whole local days (a "7d" range is today plus the six previous days), and a granularity suggestion for
 * `revenue-series`. The API rejects reversed ranges and ranges longer than two years; this module never builds one.
 */
import { localDayBoundary, normalizeDateRange, toLocalIsoWithOffset } from "./admin-list-state.ts";

export type AdminRangePreset = "7d" | "30d" | "90d" | "custom";
export type AdminRangeState = { preset: AdminRangePreset; customFrom: string; customTo: string };
export type AdminGranularity = "day" | "week" | "month";
export type AdminResolvedRange = {
  /** Start of the first local day, ISO with offset. */
  from: string;
  /** End of the last local day (23:59:59.999), ISO with offset. */
  to: string;
  granularity: AdminGranularity;
  /** Number of local calendar days covered. */
  days: number;
  /** The preset actually applied (`custom` falls back to `30d` when its dates are missing or invalid). */
  preset: AdminRangePreset;
};

export const ADMIN_RANGE_PRESETS = ["7d", "30d", "90d", "custom"] as const satisfies readonly AdminRangePreset[];
export const adminRangePresetLabels: Record<AdminRangePreset, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  custom: "Custom range",
};
export const defaultAdminRange: AdminRangeState = { preset: "30d", customFrom: "", customTo: "" };

/** The API allows at most two years (2 x 366 days). */
export const MAX_ADMIN_RANGE_DAYS = 732;
const presetDays = { "7d": 7, "30d": 30, "90d": 90 } as const;

/** day <= 31 days, week <= 182 days, month beyond. */
export function suggestGranularity(days: number): AdminGranularity {
  if (days <= 31) return "day";
  if (days <= 182) return "week";
  return "month";
}

const dateKey = (date: Date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

function daysBetween(fromKey: string, toKey: string): number {
  const [fy, fm, fd] = fromKey.split("-").map(Number);
  const [ty, tm, td] = toKey.split("-").map(Number);
  return Math.round((Date.UTC(ty, tm - 1, td) - Date.UTC(fy, fm - 1, fd)) / 86_400_000) + 1;
}

/** Valid custom range: both dates real, ordered, and at most `MAX_ADMIN_RANGE_DAYS` long. */
export function isValidCustomRange(customFrom: string, customTo: string): boolean {
  const range = normalizeDateRange(customFrom, customTo);
  return Boolean(range.from && range.to) && daysBetween(range.from!, range.to!) <= MAX_ADMIN_RANGE_DAYS;
}

/** Resolves a preset (relative to `now`, default the current time) to API `from`/`to` plus a granularity. */
export function resolveAdminRange(state: AdminRangeState, now: Date = new Date()): AdminResolvedRange {
  if (state.preset === "custom" && isValidCustomRange(state.customFrom, state.customTo)) {
    const days = daysBetween(state.customFrom, state.customTo);
    return {
      from: localDayBoundary(state.customFrom, "start")!,
      to: localDayBoundary(state.customTo, "end")!,
      granularity: suggestGranularity(days),
      days,
      preset: "custom",
    };
  }
  const preset = state.preset === "custom" ? "30d" : state.preset;
  const days = presetDays[preset];
  const end = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  const start = new Date(now.getFullYear(), now.getMonth(), now.getDate() - (days - 1), 0, 0, 0, 0);
  return { from: toLocalIsoWithOffset(start), to: toLocalIsoWithOffset(end), granularity: suggestGranularity(days), days, preset };
}

/** Query object for range-only endpoints: `{ from, to }`. Add `granularity` yourself for series endpoints. */
export function adminRangeQuery(state: AdminRangeState, now?: Date): { from: string; to: string } {
  const { from, to } = resolveAdminRange(state, now);
  return { from, to };
}

type ParamsLike = { get(name: string): string | null };

/** URL `?range=7d|30d|90d|custom&from=YYYY-MM-DD&to=YYYY-MM-DD` -> state; invalid values fall back to the default. */
export function parseAdminRange(params: ParamsLike, fallback: AdminRangeState = defaultAdminRange): AdminRangeState {
  const preset = params.get("range");
  if (preset === "custom") {
    const customFrom = params.get("from") ?? "";
    const customTo = params.get("to") ?? "";
    return isValidCustomRange(customFrom, customTo) ? { preset, customFrom, customTo } : fallback;
  }
  return preset === "7d" || preset === "30d" || preset === "90d" ? { preset, customFrom: "", customTo: "" } : fallback;
}

/** State -> URL params (only non-default values; custom dates only when valid). */
export function serializeAdminRange(state: AdminRangeState, fallback: AdminRangeState = defaultAdminRange): URLSearchParams {
  const params = new URLSearchParams();
  if (state.preset === "custom") {
    if (isValidCustomRange(state.customFrom, state.customTo)) {
      params.set("range", "custom");
      params.set("from", state.customFrom);
      params.set("to", state.customTo);
    }
    return params;
  }
  if (state.preset !== fallback.preset) params.set("range", state.preset);
  return params;
}

/** Today's local date key, handy as `max` for custom date inputs. */
export const todayKey = (now: Date = new Date()) => dateKey(now);
