import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { defaultGridDate, horoscopeGridQuery, normalizeGridDate, parseHoroscopeGridState } from "../state/horoscope-grid-state.ts";
import { emptyHoroscopeForm, horoscopeFormSchema, toHoroscopeCreateInput, toHoroscopeSections, toHoroscopeUpdateInput } from "./horoscope-form.ts";

describe("horoscope form mapping", () => {
  it("omits empty sections and sends null when all are empty", () => {
    assert.equal(toHoroscopeSections({ love: " ", career: "", health: "" }), null);
    assert.deepEqual(toHoroscopeSections({ love: " Talk ", career: "", health: "Rest" }), { love: "Talk", health: "Rest" });
  });

  it("builds create and update bodies", () => {
    const values = { ...emptyHoroscopeForm, overview: " Steady week ", career: "Plan", periodEnd: "2026-11-08", status: "published" as const };
    assert.deepEqual(toHoroscopeCreateInput(values, { period: "weekly", sign: "leo", date: "2026-11-02" }), {
      period: "weekly",
      zodiacSign: "leo",
      periodStart: "2026-11-02",
      periodEnd: "2026-11-08",
      guidance: "Steady week",
      sections: { career: "Plan" },
      status: "published",
    });
    assert.deepEqual(toHoroscopeUpdateInput({ ...values, periodEnd: "", career: "" }), { periodEnd: null, guidance: "Steady week", sections: null });
  });

  it("rejects an end date before the start", () => {
    const schema = horoscopeFormSchema("2026-11-02");
    assert.equal(schema.safeParse({ ...emptyHoroscopeForm, overview: "x", periodEnd: "2026-11-01" }).success, false);
    assert.equal(schema.safeParse({ ...emptyHoroscopeForm, overview: "x", periodEnd: "2026-11-02" }).success, true);
    assert.equal(schema.safeParse({ ...emptyHoroscopeForm, overview: "  " }).success, false);
  });
});

describe("horoscope grid state", () => {
  const today = new Date(2026, 10, 5); // Thursday 5 Nov 2026 (local)

  it("defaults to today, this Monday or the first of the month", () => {
    assert.equal(defaultGridDate("daily", today), "2026-11-05");
    assert.equal(defaultGridDate("weekly", today), "2026-11-02");
    assert.equal(defaultGridDate("weekly", new Date(2026, 10, 1)), "2026-10-26");
    assert.equal(defaultGridDate("monthly", today), "2026-11-01");
  });

  it("normalizes monthly dates to the first of the month and rejects invalid dates", () => {
    assert.equal(normalizeGridDate("monthly", "2026-11"), "2026-11-01");
    assert.equal(normalizeGridDate("monthly", "2026-11-19"), "2026-11-01");
    assert.equal(normalizeGridDate("monthly", "2026-13"), null);
    assert.equal(normalizeGridDate("daily", "2026-02-30"), null);
    assert.equal(normalizeGridDate("weekly", "2026-11-04"), "2026-11-04");
  });

  it("parses the URL and builds the grid query", () => {
    const state = parseHoroscopeGridState(new URLSearchParams("period=monthly&date=2026-12-15"), today);
    assert.deepEqual(state, { period: "monthly", date: "2026-12-01" });
    assert.deepEqual(horoscopeGridQuery(state), { period: "monthly", from: "2026-12-01", to: "2026-12-01", page: 1, limit: 12 });
    assert.deepEqual(parseHoroscopeGridState(new URLSearchParams("period=yearly&date=nope"), today), { period: "daily", date: "2026-11-05" });
  });
});
