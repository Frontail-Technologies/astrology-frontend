import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { normalizeAdminError, shouldRetryAdminRead } from "./admin-errors.ts";
import {
  buildQueryString,
  hasActiveListFilters,
  isListDate,
  isUuid,
  localDayBoundary,
  normalizeDateRange,
  parseAdminListState,
  serializeAdminListState,
  toAdminListQuery,
  toLocalIsoWithOffset,
  updateAdminListState,
  type AdminListConfig,
  type AdminListState,
} from "./admin-list-state.ts";
import { adminKeys, createAdminQueryKeys } from "./query-keys.ts";

/** Run with `pnpm test` (Node's built-in test runner; no extra dependencies). */
const config: AdminListConfig<"status"> = { defaultLimit: 20, maxLimit: 100, filters: { status: ["active", "suspended", "archived"] } };
const params = (query: string) => new URLSearchParams(query);

describe("admin list state", () => {
  it("parses defaults from an empty URL", () => {
    assert.deepEqual(parseAdminListState(params(""), config), { page: 1, limit: 20, search: "", filters: {} });
  });

  it("parses page, limit, search and allow-listed filters, ignoring invalid values", () => {
    assert.deepEqual(parseAdminListState(params("q=%20asha%20&status=suspended&page=3&limit=50"), config), {
      page: 3,
      limit: 50,
      search: "asha",
      filters: { status: "suspended" },
    });
    assert.deepEqual(parseAdminListState(params("status=deleted&page=-2&limit=5000&evil=1"), config), {
      page: 1,
      limit: 100,
      search: "",
      filters: {},
    });
    assert.equal(parseAdminListState(params("page=abc"), config).page, 1);
  });

  it("serializes only non-default values and round-trips", () => {
    assert.equal(serializeAdminListState({ page: 1, limit: 20, search: "", filters: {} }, config), "");
    const state = { page: 2, limit: 50, search: "asha", filters: { status: "active" } };
    const text = serializeAdminListState(state, config);
    assert.equal(text, "q=asha&status=active&page=2&limit=50");
    assert.deepEqual(parseAdminListState(params(text), config), state);
  });

  it("resets to page 1 when search, filters or page size change", () => {
    const state = { page: 4, limit: 20, search: "", filters: {} };
    assert.equal(updateAdminListState(state, { search: "x" }).page, 1);
    assert.equal(updateAdminListState(state, { filters: { status: "active" } }).page, 1);
    assert.equal(updateAdminListState(state, { limit: 50 }).page, 1);
    assert.equal(updateAdminListState(state, { page: 5 }).page, 5);
    assert.deepEqual(updateAdminListState({ ...state, filters: { status: "active" } }, { filters: { status: null } }).filters, {});
  });

  it("builds API queries without empty values", () => {
    assert.deepEqual(toAdminListQuery({ page: 2, limit: 20, search: "", filters: { status: "active" } }), { page: 2, limit: 20, status: "active" });
    assert.equal(buildQueryString({ page: 1, limit: 20, search: "a b", status: undefined, empty: "" }), "?page=1&limit=20&search=a+b");
    assert.equal(buildQueryString({}), "");
    assert.equal(hasActiveListFilters({ page: 1, limit: 20, search: "", filters: {} }), false);
    assert.equal(hasActiveListFilters({ page: 1, limit: 20, search: "", filters: { status: "active" } }), true);
  });
});

const UUID_A = "3f2b8c1e-7a4d-4e5f-9b6a-1c2d3e4f5a6b";
const UUID_B = "a1b2c3d4-e5f6-4a7b-8c9d-0e1f2a3b4c5d";
/** Same shape the API's `z.iso.datetime({ offset: true })` accepts for our output. */
const ISO_WITH_OFFSET = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}[+-]\d{2}:\d{2}$/;
type TypedIds = "astrologerId" | "customerUserId";
const typedConfig: AdminListConfig<"status", TypedIds> = {
  defaultLimit: 20,
  maxLimit: 100,
  filters: { status: ["scheduled", "completed"] },
  idFilters: ["astrologerId", "customerUserId"],
  dateRange: true,
};
const base: AdminListState<"status", TypedIds> = { page: 3, limit: 20, search: "", filters: {} };
const empty = { page: 1, limit: 20, search: "", filters: {} };

describe("typed list filters: ids", () => {
  it("validates UUIDs like the API", () => {
    assert.equal(isUuid(UUID_A), true);
    assert.equal(isUuid(UUID_A.toUpperCase()), true);
    assert.equal(isUuid("00000000-0000-0000-0000-000000000000"), true);
    assert.equal(isUuid("not-a-uuid"), false);
    assert.equal(isUuid("3f2b8c1e-7a4d-0e5f-9b6a-1c2d3e4f5a6b"), false, "version 0 is rejected");
    assert.equal(isUuid("3f2b8c1e-7a4d-4e5f-7b6a-1c2d3e4f5a6b"), false, "bad variant is rejected");
    assert.equal(isUuid(` ${UUID_A}`), false);
    assert.equal(isUuid(""), false);
    assert.equal(isUuid(null), false);
  });

  it("parses only configured id filters with valid UUIDs", () => {
    const state = parseAdminListState(params(`astrologerId=${UUID_A}&customerUserId=bogus&consultationId=${UUID_B}`), typedConfig);
    assert.deepEqual(state, { ...empty, ids: { astrologerId: UUID_A } });
    assert.equal("ids" in parseAdminListState(params("astrologerId=1"), typedConfig), false);
  });

  it("ignores id params for configs without idFilters", () => {
    assert.deepEqual(parseAdminListState(params(`astrologerId=${UUID_A}`), config), empty);
  });

  it("serializes and round-trips id filters", () => {
    const state = { ...base, page: 2, ids: { customerUserId: UUID_B, astrologerId: UUID_A } };
    const text = serializeAdminListState(state, typedConfig);
    assert.equal(text, `astrologerId=${UUID_A}&customerUserId=${UUID_B}&page=2`);
    assert.deepEqual(parseAdminListState(params(text), typedConfig), { ...base, page: 2, ids: { astrologerId: UUID_A, customerUserId: UUID_B } });
  });

  it("never serializes an invalid id into the URL", () => {
    assert.equal(serializeAdminListState({ ...base, page: 1, ids: { astrologerId: "x" } }, typedConfig), "");
  });

  it("sets, clears and rejects ids on update and resets the page", () => {
    const set = updateAdminListState(base, { ids: { astrologerId: UUID_A } });
    assert.equal(set.page, 1);
    assert.deepEqual(set.ids, { astrologerId: UUID_A });
    const cleared = updateAdminListState({ ...set, page: 4 }, { ids: { astrologerId: null } });
    assert.equal(cleared.page, 1);
    assert.equal("ids" in cleared, false);
    const rejected = updateAdminListState(base, { ids: { astrologerId: "drop table" } });
    assert.equal("ids" in rejected, false);
    assert.equal(rejected.page, 1);
    assert.deepEqual(updateAdminListState(set, { filters: { status: "completed" } }).ids, { astrologerId: UUID_A }, "other patches keep ids");
  });

  it("sends only valid, configured ids to the API", () => {
    const state = { ...base, page: 1, ids: { astrologerId: UUID_A, customerUserId: "bad" } };
    assert.deepEqual(toAdminListQuery(state, typedConfig), { page: 1, limit: 20, astrologerId: UUID_A });
    const foreign: AdminListState<"status", string> = { ...base, page: 1, ids: { consultationId: UUID_B } };
    assert.deepEqual(toAdminListQuery(foreign, typedConfig as AdminListConfig<"status", string>), { page: 1, limit: 20 });
  });

  it("counts ids as active filters", () => {
    assert.equal(hasActiveListFilters({ ...base, ids: { astrologerId: UUID_A } }), true);
    assert.equal(hasActiveListFilters({ ...base, ids: {} }), false);
  });
});

describe("typed list filters: date range", () => {
  it("accepts only real YYYY-MM-DD calendar dates", () => {
    assert.equal(isListDate("2026-11-01"), true);
    assert.equal(isListDate("2024-02-29"), true);
    assert.equal(isListDate("2026-02-29"), false);
    assert.equal(isListDate("2026-02-30"), false);
    assert.equal(isListDate("2026-13-01"), false);
    assert.equal(isListDate("2026-00-10"), false);
    assert.equal(isListDate("2026-1-5"), false);
    assert.equal(isListDate("2026-11-01T00:00:00Z"), false);
    assert.equal(isListDate("yesterday"), false);
    assert.equal(isListDate(""), false);
  });

  it("drops invalid ends and drops both when from is after to", () => {
    assert.deepEqual(normalizeDateRange("2026-01-01", "2026-01-31"), { from: "2026-01-01", to: "2026-01-31" });
    assert.deepEqual(normalizeDateRange("2026-01-05", "2026-01-05"), { from: "2026-01-05", to: "2026-01-05" });
    assert.deepEqual(normalizeDateRange("2026-02-01", "2026-01-31"), {});
    assert.deepEqual(normalizeDateRange("bad", "2026-01-31"), { to: "2026-01-31" });
    assert.deepEqual(normalizeDateRange("2026-01-01", "2026-02-31"), { from: "2026-01-01" });
    assert.deepEqual(normalizeDateRange(null, undefined), {});
  });

  it("parses from/to from the URL only when the config enables it", () => {
    assert.deepEqual(parseAdminListState(params("from=2026-01-01&to=2026-01-31"), typedConfig), { ...empty, from: "2026-01-01", to: "2026-01-31" });
    assert.deepEqual(parseAdminListState(params("from=2026-01-01&to=2026-01-31"), config), empty);
    assert.deepEqual(parseAdminListState(params("from=2026-03-01&to=2026-01-31"), typedConfig), empty);
    assert.deepEqual(parseAdminListState(params("from=2026-02-30&to=2026-03-31"), typedConfig), { ...empty, to: "2026-03-31" });
  });

  it("serializes the range in URL order and round-trips", () => {
    const state = { ...base, page: 1, filters: { status: "completed" }, ids: { astrologerId: UUID_A }, from: "2026-01-01", to: "2026-01-31" };
    const text = serializeAdminListState(state, typedConfig);
    assert.equal(text, `status=completed&astrologerId=${UUID_A}&from=2026-01-01&to=2026-01-31`);
    assert.deepEqual(parseAdminListState(params(text), typedConfig), state);
    assert.equal(serializeAdminListState({ ...base, page: 1, from: "2026-02-01", to: "2026-01-01" }, typedConfig), "");
    assert.equal(serializeAdminListState({ ...empty, from: "2026-02-01" }, config), "", "range ignored when not configured");
  });

  it("updates the range, resets the page and drops a reversed range", () => {
    const withFrom = updateAdminListState(base, { from: "2026-01-10" });
    assert.equal(withFrom.page, 1);
    assert.equal(withFrom.from, "2026-01-10");
    const both = updateAdminListState({ ...withFrom, page: 5 }, { to: "2026-01-20" });
    assert.deepEqual([both.page, both.from, both.to], [1, "2026-01-10", "2026-01-20"]);
    const reversed = updateAdminListState(both, { to: "2026-01-01" });
    assert.equal("from" in reversed, false);
    assert.equal("to" in reversed, false);
    const cleared = updateAdminListState(both, { from: null, to: "" });
    assert.equal("from" in cleared || "to" in cleared, false);
    const invalid = updateAdminListState(base, { from: "2026-02-30" });
    assert.equal("from" in invalid, false);
    assert.equal(invalid.page, 1);
    assert.equal(updateAdminListState({ ...both, page: 5 }, { page: 6 }).from, "2026-01-10", "paging keeps the range");
  });

  it("formats local datetimes with an explicit offset", () => {
    const date = new Date(2026, 10, 1, 9, 5, 7, 42);
    const text = toLocalIsoWithOffset(date);
    assert.match(text, ISO_WITH_OFFSET);
    assert.ok(text.startsWith("2026-11-01T09:05:07.042"));
    assert.equal(new Date(text).getTime(), date.getTime());
  });

  it("maps from/to to the start and end of the local day", () => {
    const start = localDayBoundary("2026-01-05", "start");
    const end = localDayBoundary("2026-01-05", "end");
    assert.ok(start && end);
    assert.match(start, ISO_WITH_OFFSET);
    assert.match(end, ISO_WITH_OFFSET);
    assert.ok(start.startsWith("2026-01-05T00:00:00.000"));
    assert.ok(end.startsWith("2026-01-05T23:59:59.999"));
    assert.equal(new Date(start).getTime(), new Date(2026, 0, 5, 0, 0, 0, 0).getTime());
    assert.equal(new Date(end).getTime(), new Date(2026, 0, 5, 23, 59, 59, 999).getTime());
    assert.equal(localDayBoundary("2026-02-30", "start"), null);
  });

  it("sends ISO datetimes to the API and omits invalid or reversed ranges", () => {
    const query = toAdminListQuery({ ...base, page: 1, from: "2026-01-01", to: "2026-01-31" }, typedConfig);
    assert.deepEqual(Object.keys(query), ["page", "limit", "from", "to"]);
    assert.equal(new Date(String(query.from)).getTime(), new Date(2026, 0, 1).getTime());
    assert.equal(new Date(String(query.to)).getTime(), new Date(2026, 0, 31, 23, 59, 59, 999).getTime());
    assert.deepEqual(toAdminListQuery({ ...base, page: 1, from: "2026-02-01", to: "2026-01-01" }, typedConfig), { page: 1, limit: 20 });
    assert.deepEqual(toAdminListQuery({ ...base, page: 1, from: "nope" }, typedConfig), { page: 1, limit: 20 });
    assert.deepEqual(toAdminListQuery({ ...base, page: 1, from: "2026-01-01" }, { ...typedConfig, dateRange: false }), { page: 1, limit: 20 });
  });

  it("counts dates as active filters", () => {
    assert.equal(hasActiveListFilters({ ...base, from: "2026-01-01" }), true);
    assert.equal(hasActiveListFilters({ ...base, to: "2026-01-01" }), true);
  });
});

describe("list config: search parameter and enum re-validation", () => {
  const state = { ...empty, search: "AB-123" };

  it("sends search under `search` by default and under searchParam when configured", () => {
    assert.deepEqual(toAdminListQuery(state), { page: 1, limit: 20, search: "AB-123" });
    assert.deepEqual(toAdminListQuery(state, config), { page: 1, limit: 20, search: "AB-123" });
    assert.deepEqual(toAdminListQuery(state, { ...config, searchParam: "orderNumber" }), { page: 1, limit: 20, orderNumber: "AB-123" });
    assert.deepEqual(toAdminListQuery(state, { ...config, searchParam: "customer" }), { page: 1, limit: 20, customer: "AB-123" });
    assert.deepEqual(toAdminListQuery(empty, { ...config, searchParam: "user" }), { page: 1, limit: 20 });
  });

  it("drops enumerated values the config does not allow", () => {
    assert.deepEqual(toAdminListQuery({ ...empty, filters: { status: "deleted" } }, config), { page: 1, limit: 20 });
    assert.deepEqual(toAdminListQuery({ ...empty, filters: { status: "active" } }, config), { page: 1, limit: 20, status: "active" });
  });

  it("combines every filter kind into one API query", () => {
    const full = { page: 2, limit: 50, search: "", filters: { status: "completed" }, ids: { customerUserId: UUID_B }, from: "2026-01-01" };
    const query = toAdminListQuery(full, typedConfig);
    assert.equal(query.status, "completed");
    assert.equal(query.customerUserId, UUID_B);
    assert.equal(query.page, 2);
    assert.equal(query.limit, 50);
    assert.match(String(query.from), ISO_WITH_OFFSET);
    assert.equal(query.to, undefined);
  });
});

describe("admin query keys", () => {
  const keys = createAdminQueryKeys("consultations");

  it("matches the legacy adminKeys arrays exactly", () => {
    assert.deepEqual(keys.all, adminKeys.domain("consultations"));
    assert.deepEqual(keys.list(empty), adminKeys.list("consultations", empty));
    assert.deepEqual(keys.detail("id-1"), adminKeys.detail("consultations", "id-1"));
    assert.deepEqual(keys.scoped("summary"), [...adminKeys.domain("consultations"), "summary"]);
    assert.deepEqual(keys.scoped("related", "astrologerId", UUID_A, 5), ["admin", "consultations", "related", "astrologerId", UUID_A, 5]);
  });

  it("keeps every key under the admin and domain prefix", () => {
    for (const key of [keys.all, keys.list(empty), keys.detail("x"), keys.scoped("a", 1)]) {
      assert.deepEqual(key.slice(0, 2), ["admin", "consultations"]);
    }
  });
});

describe("admin error normalization", () => {
  const apiError = (status: number, code: string, details?: unknown) => Object.assign(new Error(`${code} message`), { status, code, details });

  it("maps HTTP statuses to stable kinds", () => {
    const cases: [number, string][] = [
      [401, "unauthorized"],
      [403, "forbidden"],
      [404, "not_found"],
      [400, "validation"],
      [422, "validation"],
      [409, "conflict"],
      [429, "rate_limited"],
      [503, "unavailable"],
    ];
    for (const [status, kind] of cases) assert.equal(normalizeAdminError(apiError(status, "X")).kind, kind);
  });

  it("extracts field errors from API validation details", () => {
    const error = normalizeAdminError(apiError(400, "VALIDATION_ERROR", [{ path: ["body", "reason"], message: "Too small" }]));
    assert.deepEqual(error.fieldErrors, [{ path: "reason", message: "Too small" }]);
  });

  it("retries only transient read failures, never audit-unavailable or client errors", () => {
    assert.equal(normalizeAdminError(apiError(503, "SERVICE_UNAVAILABLE")).retryable, true);
    assert.equal(normalizeAdminError(apiError(503, "AUDIT_UNAVAILABLE")).retryable, false);
    assert.equal(normalizeAdminError(apiError(409, "CONFLICT")).retryable, false);
    assert.equal(normalizeAdminError(new TypeError("fetch failed")).kind, "network");
    assert.equal(shouldRetryAdminRead(0, new TypeError("fetch failed")), true);
    assert.equal(shouldRetryAdminRead(2, new TypeError("fetch failed")), false);
    assert.equal(shouldRetryAdminRead(0, apiError(404, "NOT_FOUND")), false);
  });

  it("treats aborted requests as non-retryable", () => {
    const aborted = Object.assign(new Error("aborted"), { name: "AbortError" });
    assert.equal(normalizeAdminError(aborted).code, "ABORTED");
    assert.equal(normalizeAdminError(aborted).retryable, false);
  });
});
