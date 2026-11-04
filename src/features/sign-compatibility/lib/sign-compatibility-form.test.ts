import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { compatibilityFormErrors, entryToForm, formToInput, orderedPair, pairKey } from "./sign-compatibility-form.ts";

describe("sign compatibility form", () => {
  it("orders pairs like the API", () => {
    assert.deepEqual(orderedPair("pisces", "aries"), ["aries", "pisces"]);
    assert.equal(pairKey("leo", "aries"), pairKey("aries", "leo"));
  });

  it("validates scores and summary length", () => {
    const empty = entryToForm(undefined);
    assert.deepEqual(Object.keys(compatibilityFormErrors(empty)).sort(), ["communication", "love", "score", "summary", "trust"]);
    const valid = { score: "72", love: "80", trust: "0", communication: "100", summary: "Warm and loyal, with patience needed.", published: true };
    assert.deepEqual(compatibilityFormErrors(valid), {});
    assert.equal(compatibilityFormErrors({ ...valid, love: "101" }).love, "Use a whole number from 0 to 100.");
    assert.deepEqual(formToInput(valid), { score: 72, love: 80, trust: 0, communication: 100, summary: "Warm and loyal, with patience needed.", published: true });
  });
});
