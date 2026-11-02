/**
 * URL-driven Admin list state (page, page size, search, typed filters). Pure module so it can be unit-tested with
 * `node --test`. Unknown or invalid URL values fall back to defaults instead of reaching the API.
 *
 * Filter kinds:
 * - `filters`   per key either an allow-list of enumerated values, or a predicate for free-form values (for
 *               example a category text or a pooja id), sent as-is once accepted.
 * - `idFilters` UUID-valued keys (for example `astrologerId`), sent as-is once validated.
 * - `dateRange` URL `from`/`to` as `YYYY-MM-DD`, sent to the API as ISO datetimes with offset
 *               (`from` = start of the local day, `to` = end of the local day). An invalid date is dropped; a
 *               reversed range (`from` > `to`) drops both.
 */
/** An allow-list of enumerated values, or a predicate for free-form filter values. */
export type AdminFilterValues = readonly string[] | ((value: string) => boolean);

/** Whether `value` is acceptable for a filter defined by an allow-list or a predicate. */
export function acceptsFilterValue(allowed: AdminFilterValues | undefined, value: string): boolean {
  if (!allowed) return false;
  return typeof allowed === "function" ? allowed(value) : allowed.includes(value);
}

export type AdminListConfig<F extends string = string, I extends string = string> = {
  defaultLimit: number;
  maxLimit: number;
  /** Per filter key: allowed values, or a predicate for free-form values. Anything not accepted is ignored. */
  filters: Record<F, AdminFilterValues>;
  /** Filter keys whose value must be a UUID (same name in the URL and the API). */
  idFilters?: readonly I[];
  /** Enables the `from`/`to` local-date range. */
  dateRange?: boolean;
  /** API parameter that receives the URL `q` search text (default `"search"`). */
  searchParam?: string;
  searchMaxLength?: number;
};

export type AdminListState<F extends string = string, I extends string = string> = {
  page: number;
  limit: number;
  search: string;
  filters: Partial<Record<F, string>>;
  /** Validated UUID filters; present only when at least one is set. */
  ids?: Partial<Record<I, string>>;
  /** Local date `YYYY-MM-DD`; present only when set and valid. */
  from?: string;
  /** Local date `YYYY-MM-DD`; present only when set and valid. */
  to?: string;
};

export type AdminListPatch<F extends string = string, I extends string = string> = {
  page?: number;
  limit?: number;
  search?: string;
  filters?: Partial<Record<F, string | null>>;
  ids?: Partial<Record<I, string | null>>;
  /** `YYYY-MM-DD`; `null` or `""` clears. */
  from?: string | null;
  to?: string | null;
};

type ParamsLike = { get(name: string): string | null };

/** RFC 9562 UUID (versions 1-8) plus the nil and max UUIDs: the same shape the API's `z.string().uuid()` accepts. */
const UUID_PATTERN =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;
const DATE_PATTERN = /^(\d{4})-(\d{2})-(\d{2})$/;

export function isUuid(value: string | null | undefined): value is string {
  return typeof value === "string" && UUID_PATTERN.test(value);
}

function dateParts(value: string): [number, number, number] | null {
  const match = DATE_PATTERN.exec(value);
  if (!match) return null;
  const [year, month, day] = [Number(match[1]), Number(match[2]), Number(match[3])];
  const date = new Date(year, month - 1, day);
  // Rejects overflow such as 2026-02-30 (which `Date` would roll into March).
  if (date.getFullYear() !== year || date.getMonth() !== month - 1 || date.getDate() !== day) return null;
  return [year, month, day];
}

/** True for a real calendar date written as `YYYY-MM-DD`. */
export function isListDate(value: string | null | undefined): value is string {
  return typeof value === "string" && dateParts(value) !== null;
}

/** Drops invalid dates; if both remain and `from` is after `to`, drops both. `YYYY-MM-DD` compares lexically. */
export function normalizeDateRange(from: string | null | undefined, to: string | null | undefined): { from?: string; to?: string } {
  const validFrom = isListDate(from) ? from : undefined;
  const validTo = isListDate(to) ? to : undefined;
  if (validFrom && validTo && validFrom > validTo) return {};
  return { ...(validFrom ? { from: validFrom } : {}), ...(validTo ? { to: validTo } : {}) };
}

const pad = (value: number, length = 2) => String(Math.abs(value)).padStart(length, "0");

/** ISO 8601 datetime in local time with an explicit offset, for example `2026-11-01T00:00:00.000+05:30`. */
export function toLocalIsoWithOffset(date: Date): string {
  const offsetMinutes = -date.getTimezoneOffset();
  const sign = offsetMinutes >= 0 ? "+" : "-";
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    `T${pad(date.getHours())}:${pad(date.getMinutes())}:${pad(date.getSeconds())}.${pad(date.getMilliseconds(), 3)}` +
    `${sign}${pad(Math.trunc(offsetMinutes / 60))}:${pad(offsetMinutes % 60)}`
  );
}

/** Start (`00:00:00.000`) or end (`23:59:59.999`) of a local calendar day as an ISO datetime with offset. */
export function localDayBoundary(value: string, edge: "start" | "end"): string | null {
  const parts = dateParts(value);
  if (!parts) return null;
  const [year, month, day] = parts;
  const date = edge === "start" ? new Date(year, month - 1, day, 0, 0, 0, 0) : new Date(year, month - 1, day, 23, 59, 59, 999);
  return toLocalIsoWithOffset(date);
}

function positiveInt(value: string | null, fallback: number, max: number) {
  if (!value || !/^\d+$/.test(value)) return fallback;
  const parsed = Number(value);
  return parsed >= 1 ? Math.min(parsed, max) : fallback;
}

function sanitizeIds<I extends string>(ids: Partial<Record<I, string>> | undefined, allowed?: readonly I[]): Partial<Record<I, string>> {
  const result: Partial<Record<I, string>> = {};
  for (const [key, value] of Object.entries(ids ?? {}) as [I, string | undefined][]) {
    if (allowed && !allowed.includes(key)) continue;
    if (isUuid(value)) result[key] = value;
  }
  return result;
}

/** Adds the optional `ids`/`from`/`to` fields only when they carry a value, so default state stays minimal. */
function withOptionalFilters<F extends string, I extends string>(
  base: Omit<AdminListState<F, I>, "ids" | "from" | "to">,
  ids: Partial<Record<I, string>>,
  range: { from?: string; to?: string },
): AdminListState<F, I> {
  const state: AdminListState<F, I> = { ...base };
  if (Object.keys(ids).length) state.ids = ids;
  if (range.from) state.from = range.from;
  if (range.to) state.to = range.to;
  return state;
}

export function parseAdminListState<F extends string, I extends string = string>(
  params: ParamsLike,
  config: AdminListConfig<F, I>,
): AdminListState<F, I> {
  const search = (params.get("q") ?? "").trim().slice(0, config.searchMaxLength ?? 200);
  const filters: Partial<Record<F, string>> = {};
  for (const key of Object.keys(config.filters) as F[]) {
    const value = params.get(key);
    if (value && acceptsFilterValue(config.filters[key], value)) filters[key] = value;
  }
  const ids: Partial<Record<I, string>> = {};
  for (const key of config.idFilters ?? []) {
    const value = params.get(key);
    if (isUuid(value)) ids[key] = value;
  }
  const range = config.dateRange ? normalizeDateRange(params.get("from"), params.get("to")) : {};
  return withOptionalFilters<F, I>(
    {
      page: positiveInt(params.get("page"), 1, 100_000),
      limit: positiveInt(params.get("limit"), config.defaultLimit, config.maxLimit),
      search,
      filters,
    },
    ids,
    range,
  );
}

/** Serializes only non-default, valid values, so default state has a clean URL. */
export function serializeAdminListState<F extends string, I extends string = string>(
  state: AdminListState<F, I>,
  config: AdminListConfig<F, I>,
): string {
  const params = new URLSearchParams();
  if (state.search.trim()) params.set("q", state.search.trim());
  for (const key of Object.keys(config.filters) as F[]) {
    const value = state.filters[key];
    if (value) params.set(key, value);
  }
  for (const key of config.idFilters ?? []) {
    const value = state.ids?.[key];
    if (isUuid(value)) params.set(key, value);
  }
  if (config.dateRange) {
    const range = normalizeDateRange(state.from, state.to);
    if (range.from) params.set("from", range.from);
    if (range.to) params.set("to", range.to);
  }
  if (state.page > 1) params.set("page", String(state.page));
  if (state.limit !== config.defaultLimit) params.set("limit", String(state.limit));
  return params.toString();
}

/**
 * Any change to search, filters (enumerated, id or date) or page size returns to page 1. Non-UUID ids and invalid
 * dates are dropped; a reversed date range drops both ends.
 */
export function updateAdminListState<F extends string, I extends string = string>(
  state: AdminListState<F, I>,
  patch: AdminListPatch<F, I>,
): AdminListState<F, I> {
  const filters = { ...state.filters };
  for (const [key, value] of Object.entries(patch.filters ?? {}) as [F, string | null][]) {
    if (value) filters[key] = value;
    else delete filters[key];
  }
  const ids: Partial<Record<I, string>> = { ...state.ids };
  for (const [key, value] of Object.entries(patch.ids ?? {}) as [I, string | null][]) {
    if (value) ids[key] = value;
    else delete ids[key];
  }
  const range = normalizeDateRange(patch.from !== undefined ? patch.from : state.from, patch.to !== undefined ? patch.to : state.to);
  const resetsPage =
    patch.search !== undefined ||
    patch.limit !== undefined ||
    patch.filters !== undefined ||
    patch.ids !== undefined ||
    patch.from !== undefined ||
    patch.to !== undefined;
  return withOptionalFilters<F, I>(
    {
      page: patch.page ?? (resetsPage ? 1 : state.page),
      limit: patch.limit ?? state.limit,
      search: patch.search ?? state.search,
      filters,
    },
    sanitizeIds(ids),
    range,
  );
}

/**
 * Query parameters for the API: the search text (under `config.searchParam`, default `search`), the filters,
 * `page` and `limit`; empty or invalid values are omitted. With a config, enumerated values and id keys are
 * re-checked against it; dates become ISO datetimes with offset.
 */
export function toAdminListQuery<F extends string, I extends string = string>(
  state: AdminListState<F, I>,
  config?: AdminListConfig<F, I>,
): Record<string, string | number> {
  const query: Record<string, string | number> = { page: state.page, limit: state.limit };
  if (state.search) query[config?.searchParam ?? "search"] = state.search;
  for (const [key, value] of Object.entries(state.filters) as [F, string | undefined][]) {
    if (!value) continue;
    if (config && !acceptsFilterValue(config.filters[key], value)) continue;
    query[key] = value;
  }
  for (const [key, value] of Object.entries(sanitizeIds(state.ids, config?.idFilters)) as [string, string | undefined][]) {
    if (value) query[key] = value;
  }
  if (!config || config.dateRange) {
    const range = normalizeDateRange(state.from, state.to);
    const from = range.from ? localDayBoundary(range.from, "start") : null;
    const to = range.to ? localDayBoundary(range.to, "end") : null;
    if (from) query.from = from;
    if (to) query.to = to;
  }
  return query;
}

export function buildQueryString(query: Record<string, string | number | boolean | null | undefined>): string {
  const params = new URLSearchParams();
  for (const [key, value] of Object.entries(query)) {
    if (value === undefined || value === null || value === "") continue;
    params.set(key, String(value));
  }
  const text = params.toString();
  return text ? `?${text}` : "";
}

export type AdminPage<T> = { items: T[]; page: number; limit: number; total: number; totalPages: number };

export function hasActiveListFilters<F extends string, I extends string = string>(state: AdminListState<F, I>): boolean {
  return (
    Boolean(state.search) ||
    Object.values(state.filters).some(Boolean) ||
    Object.values(state.ids ?? {}).some(Boolean) ||
    Boolean(state.from) ||
    Boolean(state.to)
  );
}
