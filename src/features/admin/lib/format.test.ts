import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { formatClockTime } from "./format.ts";

describe("formatClockTime", () => {
  it("formats wall-clock times in 12-hour form", () => {
    assert.equal(formatClockTime("01:30:00"), "1:30 am");
    assert.equal(formatClockTime("00:05"), "12:05 am");
    assert.equal(formatClockTime("12:00:00"), "12:00 pm");
    assert.equal(formatClockTime("23:45"), "11:45 pm");
  });

  it("returns anything else unchanged", () => {
    assert.equal(formatClockTime("around noon"), "around noon");
    assert.equal(formatClockTime("25:00"), "25:00");
  });
});
