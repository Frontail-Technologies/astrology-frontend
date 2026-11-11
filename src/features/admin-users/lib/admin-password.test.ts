import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { generateTemporaryPassword, isEmail, passwordProblem } from "./admin-password.ts";

describe("admin passwords", () => {
  it("mirrors the API length rule", () => {
    assert.equal(passwordProblem("short"), "Use at least 12 characters.");
    assert.equal(passwordProblem("x".repeat(12)), null);
    assert.equal(passwordProblem("x".repeat(129)), "Use at most 128 characters.");
  });

  it("generates 16 unambiguous characters that pass the rule", () => {
    const password = generateTemporaryPassword((values) => values.map((_, index) => index * 7));
    assert.equal(password.length, 16);
    assert.equal(/[0O1lI]/.test(password), false);
    assert.equal(passwordProblem(password), null);
  });

  it("checks email shape", () => {
    assert.equal(isEmail("ops@example.com"), true);
    assert.equal(isEmail("ops@"), false);
  });
});
