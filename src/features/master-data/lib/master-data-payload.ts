/**
 * Master-data editor values <-> API payloads, per entity. Pure (no React, no `@/` aliases) so it runs under
 * `node --test`. The backend schemas are strict, so each entity only ever receives its own fields.
 */
import type { AdminMasterDataRecord, MasterDataEntity, MasterDataWriteInput, TextDirection } from "../types/master-data-admin.ts";

export type MasterDataField =
  | "slug"
  | "code"
  | "nativeName"
  | "direction"
  | "isDefault"
  | "phoneCode"
  | "countryId"
  | "stateId"
  | "description"
  | "imageUrl"
  | "technicalKey";

/** Entity-specific fields (besides `name`, `active`, `sortOrder`, which every entity has). */
export const masterDataFields: Record<MasterDataEntity, readonly MasterDataField[]> = {
  languages: ["code", "nativeName", "direction", "isDefault"],
  countries: ["slug", "code", "phoneCode"],
  states: ["slug", "code", "countryId"],
  cities: ["slug", "stateId"],
  expertise: ["slug", "description", "imageUrl"],
  specialties: ["slug", "description"],
  tags: ["slug", "description"],
  "consultation-modes": ["code"],
  "pooja-categories": ["slug", "description", "technicalKey"],
};

export function hasMasterDataField(entity: MasterDataEntity, field: MasterDataField): boolean {
  return masterDataFields[entity].includes(field);
}

/** Every editor field has a value (never `undefined`) so server field errors can map onto it. */
export type MasterDataFormValues = {
  name: string;
  slug: string;
  code: string;
  active: boolean;
  sortOrder: number;
  nativeName: string;
  direction: TextDirection;
  isDefault: boolean;
  phoneCode: string;
  /** States: the parent country. Cities: only drives the country -> state cascade (never sent). */
  countryId: string;
  stateId: string;
  description: string;
  imageUrl: string | null;
  technicalKey: string;
};

export function emptyMasterDataForm(): MasterDataFormValues {
  return {
    name: "",
    slug: "",
    code: "",
    active: true,
    sortOrder: 0,
    nativeName: "",
    direction: "ltr",
    isDefault: false,
    phoneCode: "",
    countryId: "",
    stateId: "",
    description: "",
    imageUrl: null,
    technicalKey: "",
  };
}

/** Editor values for an existing record. `cityCountryId` is the city's state's country (for the cascade). */
export function masterDataFormFromRecord(record: AdminMasterDataRecord, cityCountryId = ""): MasterDataFormValues {
  return {
    name: record.name,
    slug: record.slug ?? "",
    code: record.code ?? "",
    active: record.active,
    sortOrder: record.sortOrder,
    nativeName: record.nativeName ?? "",
    direction: record.direction ?? "ltr",
    isDefault: record.isDefault ?? false,
    phoneCode: record.phoneCode ?? "",
    countryId: record.countryId ?? cityCountryId,
    stateId: record.stateId ?? "",
    description: record.description ?? "",
    imageUrl: record.imageUrl ?? null,
    technicalKey: record.technicalKey ?? "",
  };
}

/** Lowercase kebab-case slug from a name (`Tamil Nadu` -> `tamil-nadu`), matching the API slug pattern. */
export function masterDataSlug(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 140)
    .replace(/-+$/g, "");
}

const nullable = (value: string) => {
  const trimmed = value.trim();
  return trimmed === "" ? null : trimmed;
};

function entityFields(entity: MasterDataEntity, values: MasterDataFormValues, mode: "create" | "update"): MasterDataWriteInput {
  const input: MasterDataWriteInput = {};
  for (const field of masterDataFields[entity]) {
    switch (field) {
      case "slug":
        input.slug = values.slug.trim();
        break;
      case "code": {
        const code = values.code.trim();
        // States: optional and not nullable — omitted when blank (it cannot be cleared once set).
        if (entity === "states" && code === "") break;
        input.code = code;
        break;
      }
      case "nativeName":
        input.nativeName = nullable(values.nativeName);
        break;
      case "direction":
        input.direction = values.direction;
        break;
      case "isDefault":
        input.isDefault = values.isDefault;
        break;
      case "phoneCode":
        input.phoneCode = nullable(values.phoneCode);
        break;
      case "countryId":
        input.countryId = values.countryId;
        break;
      case "stateId":
        input.stateId = values.stateId;
        break;
      case "description":
        input.description = nullable(values.description);
        break;
      case "imageUrl":
        input.imageUrl = values.imageUrl && values.imageUrl.trim() !== "" ? values.imageUrl.trim() : null;
        break;
      case "technicalKey":
        input.technicalKey = nullable(values.technicalKey);
        break;
    }
  }
  if (mode === "update" && entity === "languages" && !values.isDefault) {
    // Un-defaulting is done by making another language the default; never send `isDefault: false` on update.
    delete input.isDefault;
  }
  return input;
}

/** `POST` body: name, active, sortOrder + the entity's own fields. */
export function toMasterDataCreatePayload(entity: MasterDataEntity, values: MasterDataFormValues): MasterDataWriteInput {
  return { name: values.name.trim(), active: values.active, sortOrder: values.sortOrder, ...entityFields(entity, values, "create") };
}

/**
 * `PATCH` body. `active` is never sent (status changes go through `/status`, which enforces the default-language
 * rule). Consultation modes accept only `name` and `sortOrder` here.
 */
export function toMasterDataUpdatePayload(entity: MasterDataEntity, values: MasterDataFormValues): MasterDataWriteInput {
  if (entity === "consultation-modes") return { name: values.name.trim(), sortOrder: values.sortOrder };
  const fields = entityFields(entity, values, "update");
  return { name: values.name.trim(), sortOrder: values.sortOrder, ...fields };
}

/** Consultation-mode codes that do not exist yet (create is only possible for these). */
export function missingConsultationModes(existingCodes: readonly (string | null)[]): ("chat" | "voice" | "video")[] {
  return (["chat", "voice", "video"] as const).filter((code) => !existingCodes.includes(code));
}
