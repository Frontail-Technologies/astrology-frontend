import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { parseAdminListState, serializeAdminListState, toAdminListQuery } from "../../admin/data/admin-list-state.ts";
import { isPoojaFilterText, poojaRequestListConfig } from "./pooja-request-list-state.ts";

describe("pooja request list state", () => {
  it("maps q to customer and keeps the pooja text filter in the URL", () => {
    const state = parseAdminListState(new URLSearchParams("q=Kavya&pooja=Ganesh&status=accepted"), poojaRequestListConfig);
    const query = toAdminListQuery(state, poojaRequestListConfig);
    assert.equal(query.customer, "Kavya");
    assert.equal(query.pooja, "Ganesh");
    assert.equal(query.status, "accepted");
    assert.equal("search" in query, false);
    assert.equal(serializeAdminListState(state, poojaRequestListConfig), "q=Kavya&status=accepted&pooja=Ganesh");
  });

  it("rejects blank, padded or too-long pooja text and unknown statuses", () => {
    assert.equal(isPoojaFilterText(""), false);
    assert.equal(isPoojaFilterText(" a"), false);
    assert.equal(isPoojaFilterText("x".repeat(181)), false);
    const state = parseAdminListState(new URLSearchParams(`pooja=${"x".repeat(181)}&status=confirmed`), poojaRequestListConfig);
    assert.deepEqual(state.filters, {});
  });
});
