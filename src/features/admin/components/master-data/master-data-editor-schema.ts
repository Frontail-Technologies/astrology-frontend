import { z } from "zod";

import { hasMasterDataField, type MasterDataFormValues } from "@/features/master-data/lib/master-data-payload";
import type { MasterDataEntity } from "@/features/master-data/types/master-data-admin";

/** Client rules mirror the API (`master-data.validation.ts`); the server re-validates and its field errors map back. */
const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const CODE = /^[A-Za-z0-9_-]+$/;
const PHONE_CODE = /^\+[0-9]{1,4}(?:-[0-9]{1,4})?$/;
const TECHNICAL_KEY = /^[a-z0-9]+(?:[_-][a-z0-9]+)*$/;
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const free = z.string();

function codeSchema(entity: MasterDataEntity, mode: "create" | "edit", allowedModes: readonly string[]) {
  if (entity === "consultation-modes") {
    return mode === "create" ? z.string().refine((value) => allowedModes.includes(value), { error: "Choose a mode that does not exist yet." }) : free;
  }
  if (entity === "languages") return z.string().trim().min(1, { error: "Enter a language code, for example hi." }).max(16).regex(CODE, { error: "Use letters, digits, _ or -." });
  if (entity === "countries") return z.string().trim().min(1, { error: "Enter an ISO code, for example IN." }).max(3, { error: "At most 3 characters." }).regex(CODE, { error: "Use letters and digits." });
  if (entity === "states") return z.string().trim().max(16).refine((value) => value === "" || CODE.test(value), { error: "Use letters, digits, _ or -." });
  return free;
}

export function masterDataEditorSchema(entity: MasterDataEntity, mode: "create" | "edit", allowedModes: readonly string[] = []): z.ZodType<MasterDataFormValues, MasterDataFormValues> {
  const has = (field: Parameters<typeof hasMasterDataField>[1]) => hasMasterDataField(entity, field);
  return z.object({
    name: z.string().trim().min(1, { error: "Enter a name." }).max(120, { error: "At most 120 characters." }),
    slug: has("slug") ? z.string().trim().min(1, { error: "Enter a slug." }).max(140).regex(SLUG, { error: "Use lowercase letters and digits separated by hyphens." }) : free,
    code: codeSchema(entity, mode, allowedModes),
    active: z.boolean(),
    sortOrder: z.number({ error: "Enter a whole number." }).int({ error: "Enter a whole number." }).min(0, { error: "Use 0 or more." }).max(1_000_000),
    nativeName: z.string().trim().max(120, { error: "At most 120 characters." }),
    direction: z.enum(["ltr", "rtl"]),
    isDefault: z.boolean(),
    phoneCode: has("phoneCode") ? z.string().trim().refine((value) => value === "" || PHONE_CODE.test(value), { error: "Use an international dialling code such as +91." }) : free,
    countryId: entity === "states" || entity === "cities" ? z.string().regex(UUID, { error: "Choose a country." }) : free,
    stateId: entity === "cities" ? z.string().regex(UUID, { error: "Choose a state." }) : free,
    description: z.string().trim().max(2000, { error: "At most 2,000 characters." }),
    imageUrl: z.string().nullable(),
    technicalKey: has("technicalKey")
      ? z.string().trim().max(80).refine((value) => value === "" || TECHNICAL_KEY.test(value), { error: "Use lowercase letters and digits separated by _ or -." })
      : free,
  });
}
