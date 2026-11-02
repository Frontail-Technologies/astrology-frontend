/**
 * `<input type="datetime-local">` value (`YYYY-MM-DDTHH:mm`, local time) <-> ISO 8601 datetime with offset.
 * Pure (no React, no `@/` aliases) so it runs under `node --test`.
 */
import { toLocalIsoWithOffset } from "./admin-list-state.ts";

const LOCAL_INPUT = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.(\d{1,3}))?)?$/;
const pad = (value: number) => String(value).padStart(2, "0");

/** ISO datetime (any offset) -> local `YYYY-MM-DDTHH:mm`; empty string for null/invalid input. */
export function isoToLocalInput(value: string | null | undefined): string {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

/**
 * Local `YYYY-MM-DDTHH:mm[:ss[.mmm]]` -> ISO with the local offset (for example `2026-11-01T09:30:00.000+05:30`).
 * Returns null for empty or invalid input, including impossible dates (2026-02-30) and times skipped by a DST jump.
 */
export function localInputToIso(value: string | null | undefined): string | null {
  const match = value ? LOCAL_INPUT.exec(value.trim()) : null;
  if (!match) return null;
  const [year, month, day, hour, minute, second = 0, ms = 0] = match.slice(1).map((part, index) =>
    part === undefined ? undefined : index === 6 ? Number(part.padEnd(3, "0")) : Number(part),
  ) as number[];
  const date = new Date(year, month - 1, day, hour, minute, second, ms);
  if (
    date.getFullYear() !== year ||
    date.getMonth() !== month - 1 ||
    date.getDate() !== day ||
    date.getHours() !== hour ||
    date.getMinutes() !== minute
  ) {
    return null;
  }
  return toLocalIsoWithOffset(date);
}

/** True when both are null/empty or denote the same instant. */
export function sameInstant(a: string | null | undefined, b: string | null | undefined): boolean {
  if (!a || !b) return !a && !b;
  return new Date(a).getTime() === new Date(b).getTime();
}
