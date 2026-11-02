import type { AdminMasterDataRecord, MasterDataEntity } from "../types/master-data-admin.ts";
import { masterDataEntities } from "../types/master-data-admin.ts";

export type MasterDataEntityMeta = {
  singular: string;
  plural: string;
  description: string;
  /** What `usageCount` counts (null when nothing references the entity). */
  usageNoun: string | null;
};

export const masterDataMeta: Record<MasterDataEntity, MasterDataEntityMeta> = {
  languages: { singular: "Language", plural: "Languages", description: "Languages astrologers can offer consultations in.", usageNoun: "astrologers" },
  countries: { singular: "Country", plural: "Countries", description: "Countries available in location fields.", usageNoun: "states" },
  states: { singular: "State", plural: "States", description: "States and provinces, each linked to a country.", usageNoun: "cities" },
  cities: { singular: "City", plural: "Cities", description: "Cities, each linked to a state.", usageNoun: null },
  expertise: { singular: "Expertise", plural: "Expertise", description: "Primary expertise shown on astrologer profiles.", usageNoun: "astrologers" },
  specialties: { singular: "Specialty", plural: "Specialties", description: "Focused service themes astrologers offer.", usageNoun: "astrologers" },
  tags: { singular: "Tag", plural: "Tags", description: "Classification tags for articles.", usageNoun: "articles" },
  "consultation-modes": { singular: "Consultation mode", plural: "Consultation modes", description: "Names and availability of chat, voice and video.", usageNoun: "astrologers" },
  "pooja-categories": { singular: "Pooja category", plural: "Pooja categories", description: "Categories used by the pooja catalog.", usageNoun: "poojas" },
};

export function isMasterDataEntity(value: string): value is MasterDataEntity {
  return (masterDataEntities as readonly string[]).includes(value);
}

/** Groups for the overview and the directory sub-navigation. */
export const masterDataGroups: { label: string; entities: MasterDataEntity[] }[] = [
  { label: "Locations", entities: ["countries", "states", "cities"] },
  { label: "Astrologer profiles", entities: ["languages", "expertise", "specialties", "consultation-modes"] },
  { label: "Catalog & content", entities: ["pooja-categories", "tags"] },
];

/** Route key of a record: `code` for consultation modes, `id` otherwise. */
export function masterDataKey(entity: MasterDataEntity, record: Pick<AdminMasterDataRecord, "id" | "code">): string {
  return (entity === "consultation-modes" ? record.code : record.id) ?? "";
}

export const masterDataActiveLabels: Record<"true" | "false", string> = { true: "Active", false: "Inactive" };

/** Built-in consultation mode codes and their labels (the API only accepts these three codes). */
export const consultationModeLabels: Record<"chat" | "voice" | "video", string> = { chat: "Chat", voice: "Voice call", video: "Video call" };

/** Language text direction (API enum `ltr` / `rtl`). */
export const textDirectionLabels: Record<"ltr" | "rtl", string> = { ltr: "Left to right", rtl: "Right to left" };

/** Label for a consultation mode code, or the code itself for an unexpected value. */
export function consultationModeLabel(code: string | null | undefined): string {
  return (code && consultationModeLabels[code as keyof typeof consultationModeLabels]) || code || "";
}

/** Parent id filter per child entity (`?countryId=` on states, `?stateId=` on cities). */
export const masterDataParent: Partial<Record<MasterDataEntity, { param: "countryId" | "stateId"; entity: MasterDataEntity; label: string }>> = {
  states: { param: "countryId", entity: "countries", label: "Country" },
  cities: { param: "stateId", entity: "states", label: "State" },
};

/** Child directory reachable from a row ("View states" on a country). */
export const masterDataChild: Partial<Record<MasterDataEntity, { entity: MasterDataEntity; param: "countryId" | "stateId" }>> = {
  countries: { entity: "states", param: "countryId" },
  states: { entity: "cities", param: "stateId" },
};

/** Inline guidance for server error codes (the server message is shown as well). */
export const MASTER_DATA_ERROR_HINTS: Record<string, string> = {
  MASTER_DATA_IN_USE: "Records still reference this entry. Deactivate it instead, so it disappears from pickers but existing records keep working.",
  DEFAULT_LANGUAGE_REQUIRED: "Make another language the default first.",
  PROTECTED_MASTER_DATA: "Built-in consultation modes cannot be deleted. Deactivate the mode instead.",
  MASTER_DATA_DUPLICATE: "Another entry already uses this slug or code.",
};
