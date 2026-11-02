import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { consultationModeLabel, consultationModeLabels, textDirectionLabels } from "./master-data-entities.ts";

describe("master data option labels", () => {
  it("labels the built-in consultation modes and falls back to the code", () => {
    assert.deepEqual(Object.keys(consultationModeLabels), ["chat", "voice", "video"]);
    assert.equal(consultationModeLabel("voice"), "Voice call");
    assert.equal(consultationModeLabel("other"), "other");
    assert.equal(consultationModeLabel(null), "");
  });

  it("covers both text directions", () => {
    assert.deepEqual(Object.keys(textDirectionLabels), ["ltr", "rtl"]);
  });
});
