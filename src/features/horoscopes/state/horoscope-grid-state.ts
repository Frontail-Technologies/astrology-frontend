import { isListDate } from "../../admin/data/admin-list-state.ts";
import { isHoroscopePeriod } from "../constants/horoscope-status.ts";
import type { HoroscopePeriod } from "../types/horoscope-admin.ts";

/**
 * URL state for the period/date/sign grid (`?period=weekly&date=2026-11-02`). Pure so it runs under `node --test`.
 * The grid reads `GET /admin/horoscopes?period=…&from=date&to=date&limit=12` (one entry per sign at most).
 */
export type HoroscopeGridState = { period: HoroscopePeriod; date: string };

const pad = (value: number) => String(value).padStart(2, "0");
const localDate = (date: Date) => `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;

/** Default start date per period: today, the Monday of this week, or the first of this month (local time). */
export function defaultGridDate(period: HoroscopePeriod, today: Date): string {
  if (period === "monthly") return `${today.getFullYear()}-${pad(today.getMonth() + 1)}-01`;
  if (period === "weekly") {
    const monday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    monday.setDate(monday.getDate() - ((monday.getDay() + 6) % 7));
    return localDate(monday);
  }
  return localDate(today);
}

/**
 * Valid start date for the period, or `null`. Monthly entries always start on the first of the month, so
 * `YYYY-MM` and any `YYYY-MM-DD` in that month normalize to `YYYY-MM-01`.
 */
export function normalizeGridDate(period: HoroscopePeriod, value: string | null | undefined): string | null {
  if (!value) return null;
  if (period === "monthly") {
    const match = /^(\d{4})-(\d{2})(?:-\d{2})?$/.exec(value);
    if (!match) return null;
    const first = `${match[1]}-${match[2]}-01`;
    return isListDate(first) && (value.length === 7 || isListDate(value)) ? first : null;
  }
  return isListDate(value) ? value : null;
}

export function parseHoroscopeGridState(params: { get(name: string): string | null }, today: Date): HoroscopeGridState {
  const rawPeriod = params.get("period") ?? "";
  const period: HoroscopePeriod = isHoroscopePeriod(rawPeriod) ? rawPeriod : "daily";
  return { period, date: normalizeGridDate(period, params.get("date")) ?? defaultGridDate(period, today) };
}

export function serializeHoroscopeGridState(state: HoroscopeGridState): string {
  return new URLSearchParams({ period: state.period, date: state.date }).toString();
}

/** API query for one grid page: every sign's entry for the period starting exactly on `date`. */
export function horoscopeGridQuery(state: HoroscopeGridState): Record<string, string | number> {
  return { period: state.period, from: state.date, to: state.date, page: 1, limit: 12 };
}

/** `YYYY-MM` for `<input type="month">`. */
export const monthInputValue = (date: string) => date.slice(0, 7);
