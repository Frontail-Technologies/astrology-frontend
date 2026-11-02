import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { masterDataKey } from "../constants/master-data-entities.ts";
import { masterDataListConfigs } from "../state/master-data-list-state.ts";
import type { AdminMasterDataRecord } from "../types/master-data-admin.ts";
import {
  emptyMasterDataForm,
  masterDataFormFromRecord,
  masterDataSlug,
  missingConsultationModes,
  toMasterDataCreatePayload,
  toMasterDataUpdatePayload,
  type MasterDataFormValues,
} from "./master-data-payload.ts";

const COUNTRY = "6f1c2e2a-1b7d-4c55-9a51-0e6a1c1f8b10";
const STATE = "1c9a7b52-3f0e-4a3b-8c1d-2e4f6a8b0c12";

const form = (patch: Partial<MasterDataFormValues>): MasterDataFormValues => ({ ...emptyMasterDataForm(), ...patch });

const record = (patch: Partial<AdminMasterDataRecord>): AdminMasterDataRecord => ({
  id: STATE,
  code: null,
  name: "Maharashtra",
  slug: "maharashtra",
  active: true,
  sortOrder: 3,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
  countryId: null,
  stateId: null,
  isDefault: null,
  protected: null,
  usageCount: 0,
  ...patch,
});

describe("toMasterDataCreatePayload", () => {
  it("sends only language fields, with blank native name as null", () => {
    assert.deepEqual(toMasterDataCreatePayload("languages", form({ name: " Hindi ", code: "hi", nativeName: " ", direction: "ltr", isDefault: true, slug: "ignored", sortOrder: 2 })), {
      name: "Hindi",
      active: true,
      sortOrder: 2,
      code: "hi",
      nativeName: null,
      direction: "ltr",
      isDefault: true,
    });
  });

  it("maps countries with an optional phone code", () => {
    assert.deepEqual(toMasterDataCreatePayload("countries", form({ name: "India", slug: "india", code: "IN", phoneCode: "+91" })), {
      name: "India",
      active: true,
      sortOrder: 0,
      slug: "india",
      code: "IN",
      phoneCode: "+91",
    });
    assert.equal(toMasterDataCreatePayload("countries", form({ name: "X", slug: "x", code: "X" })).phoneCode, null);
  });

  it("omits a blank state code (optional, not nullable) and sends the country", () => {
    const payload = toMasterDataCreatePayload("states", form({ name: "Goa", slug: "goa", countryId: COUNTRY }));
    assert.deepEqual(payload, { name: "Goa", active: true, sortOrder: 0, slug: "goa", countryId: COUNTRY });
    assert.equal(toMasterDataCreatePayload("states", form({ code: "GA", countryId: COUNTRY })).code, "GA");
  });

  it("sends a city's state but never the cascade-only country", () => {
    const payload = toMasterDataCreatePayload("cities", form({ name: "Pune", slug: "pune", countryId: COUNTRY, stateId: STATE }));
    assert.deepEqual(payload, { name: "Pune", active: true, sortOrder: 0, slug: "pune", stateId: STATE });
  });

  it("maps taxonomy entities with nullable text and image", () => {
    assert.deepEqual(toMasterDataCreatePayload("expertise", form({ name: "Vedic", slug: "vedic", description: "", imageUrl: "/uploads/a.png" })), {
      name: "Vedic",
      active: true,
      sortOrder: 0,
      slug: "vedic",
      description: null,
      imageUrl: "/uploads/a.png",
    });
    assert.deepEqual(toMasterDataCreatePayload("tags", form({ name: "Love", slug: "love", description: " About love " })), {
      name: "Love",
      active: true,
      sortOrder: 0,
      slug: "love",
      description: "About love",
    });
    assert.deepEqual(toMasterDataCreatePayload("pooja-categories", form({ name: "Shanti", slug: "shanti", technicalKey: "graha_shanti" })), {
      name: "Shanti",
      active: true,
      sortOrder: 0,
      slug: "shanti",
      description: null,
      technicalKey: "graha_shanti",
    });
  });

  it("creates consultation modes from code, name, active and sort order only", () => {
    assert.deepEqual(toMasterDataCreatePayload("consultation-modes", form({ name: "Video call", code: "video", active: false, slug: "x", description: "y" })), {
      name: "Video call",
      active: false,
      sortOrder: 0,
      code: "video",
    });
  });
});

describe("toMasterDataUpdatePayload", () => {
  it("never sends active (status goes through /status)", () => {
    const payload = toMasterDataUpdatePayload("tags", form({ name: "Love", slug: "love", active: false }));
    assert.equal("active" in payload, false);
  });

  it("limits consultation modes to name and sort order", () => {
    assert.deepEqual(toMasterDataUpdatePayload("consultation-modes", form({ name: "Chat", code: "chat", sortOrder: 1 })), { name: "Chat", sortOrder: 1 });
  });

  it("sends isDefault on update only when making a language the default", () => {
    assert.equal(toMasterDataUpdatePayload("languages", form({ code: "hi", isDefault: true })).isDefault, true);
    assert.equal("isDefault" in toMasterDataUpdatePayload("languages", form({ code: "hi", isDefault: false })), false);
  });
});

describe("masterDataFormFromRecord", () => {
  it("fills every field (no undefined) and uses the cascade country for cities", () => {
    const values = masterDataFormFromRecord(record({ stateId: STATE, slug: "pune", name: "Pune" }), COUNTRY);
    assert.equal(values.countryId, COUNTRY);
    assert.equal(values.stateId, STATE);
    for (const [key, value] of Object.entries(values)) assert.notEqual(value, undefined, key);
  });

  it("round-trips a language", () => {
    const values = masterDataFormFromRecord(record({ code: "ur", nativeName: "اردو", direction: "rtl", isDefault: false, slug: null }));
    assert.deepEqual(toMasterDataCreatePayload("languages", values), {
      name: "Maharashtra",
      active: true,
      sortOrder: 3,
      code: "ur",
      nativeName: "اردو",
      direction: "rtl",
      isDefault: false,
    });
  });
});

describe("master-data helpers", () => {
  it("builds API-compatible slugs", () => {
    assert.equal(masterDataSlug(" Tamil Nadu "), "tamil-nadu");
    assert.equal(masterDataSlug("Graha  Śānti!"), "graha-santi");
    assert.match(masterDataSlug("x".repeat(200)), /^x{140}$/);
  });

  it("lists missing consultation modes", () => {
    assert.deepEqual(missingConsultationModes(["chat", "video"]), ["voice"]);
    assert.deepEqual(missingConsultationModes([]), ["chat", "voice", "video"]);
  });

  it("uses code as the key for consultation modes and id otherwise", () => {
    assert.equal(masterDataKey("consultation-modes", { id: null, code: "chat" }), "chat");
    assert.equal(masterDataKey("states", { id: STATE, code: "MH" }), STATE);
  });

  it("allows parent id filters only where the API accepts them", () => {
    assert.deepEqual(masterDataListConfigs.states.idFilters, ["countryId"]);
    assert.deepEqual(masterDataListConfigs.cities.idFilters, ["stateId"]);
    assert.deepEqual(masterDataListConfigs.tags.idFilters, []);
  });
});
