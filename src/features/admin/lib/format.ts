export function getInitials(name?: string) {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  return parts.length >= 2
    ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    : parts[0].slice(0, 2).toUpperCase();
}

export const slugify = (value: string) =>
  value
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");

const dateOnly = /^\d{4}-\d{2}-\d{2}$/;

/** Medium date (12 Oct 2026). Date-only strings are parsed as local dates. */
export function formatAdminDate(value?: string, fallback = "Not set") {
  if (!value) return fallback;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(dateOnly.test(value) ? `${value}T00:00:00` : value));
}

/** Integer paise → ₹ string. Only format at the presentation boundary. */
export function formatINR(paise: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: paise % 100 === 0 ? 0 : 2,
  }).format(paise / 100);
}

export function formatAdminDateTime(value?: string, fallback = "—") {
  if (!value) return fallback;
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(value));
}

export function formatCompactINR(rupees: number) {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(rupees);
}

/** Medium date + short time (12 Oct 2026, 4:30 pm). */
export function formatDateTime(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));
}

/** Like `formatDateTime`, but renders `fallback` for a missing value. */
export function formatOptionalDateTime(value: string | null | undefined, fallback = "—") {
  return value ? formatDateTime(value) : fallback;
}

/** Medium date only (12 Oct 2026). */
export function formatDateOnly(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium" }).format(new Date(value));
}

/** Long date only (12 October 2026). */
export function formatDateLong(value: string) {
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(value));
}

/** Wall-clock "HH:MM[:SS]" (birth time, no time zone) → "1:30 am"; anything else is returned as given. */
export function formatClockTime(value: string) {
  const match = /^(\d{1,2}):(\d{2})(?::\d{2})?$/.exec(value.trim());
  if (!match) return value;
  const hours = Number(match[1]);
  if (hours > 23) return value;
  return `${hours % 12 || 12}:${match[2]} ${hours < 12 ? "am" : "pm"}`;
}

/** Whole seconds → "4m 05s". */
export function formatDuration(seconds: number) {
  return `${Math.floor(seconds / 60)}m ${String(seconds % 60).padStart(2, "0")}s`;
}
