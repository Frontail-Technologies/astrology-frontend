import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { paiseToRupeesInput, rupeesToPaise } from "./money.ts";

describe("admin money conversion", () => {
  it("converts rupee input to integer paise", () => {
    assert.equal(rupeesToPaise("499"), 49_900);
    assert.equal(rupeesToPaise("12.5"), 1_250);
    assert.equal(rupeesToPaise("0.05"), 5);
    assert.equal(rupeesToPaise(" 1,250.75 "), 125_075);
    assert.equal(rupeesToPaise("0"), 0);
  });

  it("rejects invalid or over-precise input", () => {
    for (const value of ["", "-1", "1.234", "abc", "1e3", "."]) assert.equal(rupeesToPaise(value), null, value);
  });

  it("formats paise back to an editable rupee string", () => {
    assert.equal(paiseToRupeesInput(49_900), "499");
    assert.equal(paiseToRupeesInput(1_250), "12.50");
    assert.equal(paiseToRupeesInput(5), "0.05");
    assert.equal(paiseToRupeesInput(null), "");
  });
});
