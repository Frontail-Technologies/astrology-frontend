import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import { apiDownload, apiRequest } from "@/lib/api/api-client";
import type { AstrologerDocument, AstrologerDocumentReview, AstrologerDocumentUpload } from "../types/astrologer-document-admin";
import type { AstrologerProfileInput, AstrologerStatusInput, AstrologerStatusResult, AstrologerTaxonomy, ManagedAstrologer, ProvisionAstrologerInput } from "../types/astrologer-admin";

export function listAstrologers(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<ManagedAstrologer>("/astrologers", query, signal);
}

export function getAstrologer(id: string, signal?: AbortSignal) {
  return adminGet<ManagedAstrologer>(`/astrologers/${encodeId(id)}`, { signal });
}

export function updateAstrologerProfile(id: string, input: AstrologerProfileInput) {
  return adminSend<ManagedAstrologer>(`/astrologers/${encodeId(id)}`, "PATCH", input);
}

/** Creates the astrologer's phone sign-in account with a pending, draft profile (409 when the phone or email is taken). */
export function provisionAstrologer(input: ProvisionAstrologerInput) {
  return adminSend<ManagedAstrologer>("/astrologers", "POST", input);
}

/** Changes the phone the astrologer signs in with (409 PHONE_ALREADY_REGISTERED). */
export function updateAstrologerPhone(id: string, phone: string) {
  return adminSend<ManagedAstrologer>(`/astrologers/${encodeId(id)}/phone`, "PATCH", { phone });
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

export function listAstrologerDocuments(id: string, signal?: AbortSignal) {
  return adminGet<AstrologerDocument[]>(`/astrologers/${encodeId(id)}/documents`, { signal });
}

/** Multipart upload to private storage; the server checks the real file type (PDF, JPEG, PNG, WebP). */
export function uploadAstrologerDocument(id: string, input: AstrologerDocumentUpload) {
  const body = new FormData();
  body.append("idType", input.idType);
  body.append("side", input.side);
  body.append("file", input.file);
  return apiRequest<AstrologerDocument>(`/admin/astrologers/${encodeId(id)}/documents`, { method: "POST", body });
}

export function reviewAstrologerDocument(id: string, documentId: string, input: AstrologerDocumentReview) {
  return adminSend<AstrologerDocument>(`/astrologers/${encodeId(id)}/documents/${encodeId(documentId)}/status`, "PATCH", input);
}

export function deleteAstrologerDocument(id: string, documentId: string) {
  return adminSend<{ deleted: true }>(`/astrologers/${encodeId(id)}/documents/${encodeId(documentId)}`, "DELETE");
}

/** Downloads the private file. Every call is recorded in the audit log on the server. */
export function downloadAstrologerDocument(id: string, documentId: string) {
  return apiDownload(`/admin/astrologers/${encodeId(id)}/documents/${encodeId(documentId)}/file`);
}
