import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { packageFormToInput, packageToFormValues, validatePackageForm } from "./pooja-package-form.ts";

describe("pooja package form", () => {
  it("starts a new package with one name, active, at the next sort position", () => {
    assert.deepEqual(packageToFormValues(null, 3), { name: "", description: "", pricePaise: null, durationMinutes: "", maxDevotees: "1", sortOrder: "3", active: true });
  });

  it("reports every invalid field", () => {
    const errors = validatePackageForm({ name: "A", description: "", pricePaise: null, durationMinutes: "0", maxDevotees: "30", sortOrder: "-1", active: true });
    assert.deepEqual(Object.keys(errors).sort(), ["durationMinutes", "maxDevotees", "name", "pricePaise", "sortOrder"]);
  });

  it("maps valid values to the API body", () => {
    const values = { name: "  Family sankalp ", description: " Up to four names ", pricePaise: 510_000, durationMinutes: "", maxDevotees: "4", sortOrder: "1", active: false };
    assert.deepEqual(validatePackageForm(values), {});
    assert.deepEqual(packageFormToInput(values), { name: "Family sankalp", description: "Up to four names", pricePaise: 510_000, durationMinutes: null, maxDevotees: 4, sortOrder: 1, active: false });
  });
});
