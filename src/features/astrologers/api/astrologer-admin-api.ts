import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import { apiRequest } from "@/lib/api/api-client";
import type { AstrologerProfileInput, AstrologerStatusInput, AstrologerStatusResult, AstrologerTaxonomy, ManagedAstrologer } from "../types/astrologer-admin";

export function listAstrologers(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<ManagedAstrologer>("/astrologers", query, signal);
}

export function getAstrologer(id: string, signal?: AbortSignal) {
  return adminGet<ManagedAstrologer>(`/astrologers/${encodeId(id)}`, { signal });
}

export function updateAstrologerProfile(id: string, input: AstrologerProfileInput) {
  return adminSend<ManagedAstrologer>(`/astrologers/${encodeId(id)}`, "PATCH", input);
}

/** The server refuses publishing an unverified astrologer (ASTROLOGER_NOT_VERIFIED). */
export function updateAstrologerStatus(id: string, input: AstrologerStatusInput) {
  return adminSend<AstrologerStatusResult>(`/astrologers/${encodeId(id)}/status`, "PATCH", input);
}

/** Public master-data taxonomies (active entries only). */
export function listTaxonomy(entity: "expertise" | "specialties", signal?: AbortSignal) {
  return apiRequest<AstrologerTaxonomy[]>(`/master-data/${entity}`, { authenticated: false, signal });
}

/** Public location / language master data used by the profile editor pickers (active entries only). */
export type PublicLocationOption = { id: string | null; name: string; code: string | null };

export function listPublicLanguages(signal?: AbortSignal) {
  return apiRequest<PublicLocationOption[]>("/master-data/languages", { authenticated: false, signal });
}

export function listPublicCountries(signal?: AbortSignal) {
  return apiRequest<PublicLocationOption[]>("/master-data/countries", { authenticated: false, signal });
}

export function listPublicCities(stateId: string, signal?: AbortSignal) {
  return apiRequest<PublicLocationOption[]>(`/master-data/states/${encodeId(stateId)}/cities`, { authenticated: false, signal });
}
