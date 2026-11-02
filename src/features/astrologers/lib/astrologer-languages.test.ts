import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { LANGUAGES_MAX, addLanguage, hasLanguage, languageAddError, languageListError, removeLanguage } from "./astrologer-languages.ts";

describe("astrologer language list", () => {
  it("adds trimmed, single-spaced names", () => {
    assert.deepEqual(addLanguage(["Hindi"], "  Old   Tamil "), ["Hindi", "Old Tamil"]);
  });

  it("rejects duplicates ignoring case", () => {
    assert.equal(hasLanguage(["Hindi"], " hindi "), true);
    assert.deepEqual(addLanguage(["Hindi"], "HINDI"), ["Hindi"]);
    assert.match(languageAddError(["Hindi"], "hindi") ?? "", /already added/);
  });

  it("enforces the backend length and count limits", () => {
    assert.match(languageAddError([], "a") ?? "", /at least 2/);
    assert.match(languageAddError([], "x".repeat(61)) ?? "", /at most 60/);
    const full = Array.from({ length: LANGUAGES_MAX }, (_, index) => `Language ${index}`);
    assert.match(languageAddError(full, "Bengali") ?? "", /Up to 20/);
    assert.equal(languageAddError([], "Bengali"), null);
  });

  it("removes a language and validates the list before saving", () => {
    assert.deepEqual(removeLanguage(["Hindi", "English"], "Hindi"), ["English"]);
    assert.equal(languageListError([]), "Add at least one language.");
    assert.equal(languageListError(["English"]), null);
  });
});
