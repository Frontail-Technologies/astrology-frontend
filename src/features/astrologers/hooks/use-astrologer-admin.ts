"use client";

import { useQuery } from "@tanstack/react-query";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { isUuid } from "@/features/admin/data/admin-list-state";
import {
  deleteAstrologerDocument,
  downloadAstrologerDocument,
  listAstrologerDocuments,
  reviewAstrologerDocument,
  uploadAstrologerDocument,
} from "../api/astrologer-admin-api";
import { getAstrologer, listAstrologers, listPublicCities, listPublicCountries, listPublicLanguages, listTaxonomy, provisionAstrologer, updateAstrologerPhone, updateAstrologerProfile, updateAstrologerStatus } from "../api/astrologer-admin-api";
import { astrologerKeys } from "../queries/astrologer-query-keys";
import { astrologerListConfig } from "../state/astrologer-list-state";
import type { AstrologerProfileInput, AstrologerStatusInput, ProvisionAstrologerInput } from "../types/astrologer-admin";
import type { AstrologerDocumentReview, AstrologerDocumentUpload } from "../types/astrologer-document-admin";

export function useAstrologerList() {
  return useAdminList(astrologerListConfig, astrologerKeys.list, listAstrologers);
}

export function useAstrologerDetail(id: string) {
  return useAdminDetail(astrologerKeys.detail(id), (signal) => getAstrologer(id, signal), Boolean(id));
}

export function useProvisionAstrologer() {
  return useAdminMutation({
    mutationFn: (input: ProvisionAstrologerInput) => provisionAstrologer(input),
    invalidate: [astrologerKeys.all],
    successMessage: "Astrologer account created",
    toastErrors: false,
  });
}

export function useUpdateAstrologerPhone(id: string) {
  return useAdminMutation({
    mutationFn: (phone: string) => updateAstrologerPhone(id, phone),
    invalidate: [astrologerKeys.all],
    successMessage: "Sign-in phone updated",
    toastErrors: false,
  });
}

export function useUpdateAstrologerProfile(id: string) {
  return useAdminMutation({
    mutationFn: (input: AstrologerProfileInput) => updateAstrologerProfile(id, input),
    invalidate: [astrologerKeys.all],
    successMessage: "Astrologer profile saved",
    toastErrors: false,
  });
}

export function useAstrologerStatusUpdate(id: string) {
  return useAdminMutation({
    mutationFn: (input: AstrologerStatusInput) => updateAstrologerStatus(id, input),
    invalidate: [astrologerKeys.all],
    successMessage: "Astrologer status updated",
    toastErrors: false,
  });
}

export function useAstrologerTaxonomy(entity: "expertise" | "specialties") {
  return useQuery({ queryKey: astrologerKeys.taxonomy(entity), queryFn: ({ signal }) => listTaxonomy(entity, signal) });
}

/** Active languages from public master data (profile editor language picker). */
export function useAstrologerLanguageOptions() {
  return useQuery({ queryKey: astrologerKeys.publicList("languages"), queryFn: ({ signal }) => listPublicLanguages(signal) });
}

/** Active countries from public master data (profile editor country picker). */
export function useAstrologerCountryOptions() {
  return useQuery({ queryKey: astrologerKeys.publicList("countries"), queryFn: ({ signal }) => listPublicCountries(signal) });
}

/** Active cities of one state (profile editor city picker). Disabled until a state is chosen. */
export function useAstrologerCityOptions(stateId: string | null) {
  return useQuery({
    queryKey: astrologerKeys.publicCities(stateId ?? ""),
    queryFn: ({ signal }) => listPublicCities(stateId ?? "", signal),
    enabled: Boolean(stateId && isUuid(stateId)),
  });
}

/** Verified astrologers for pickers (for example payout creation); first 100. */
export function useAstrologerPicker(enabled: boolean) {
  return useQuery({
    queryKey: astrologerKeys.picker(),
    queryFn: ({ signal }) => listAstrologers({ page: 1, limit: 100, verificationStatus: "verified" }, signal),
    enabled,
  });
}

export function useAstrologerDocuments(id: string) {
  return useAdminDetail(astrologerKeys.documents(id), (signal) => listAstrologerDocuments(id, signal), Boolean(id));
}

export function useUploadAstrologerDocument(id: string) {
  return useAdminMutation({
    mutationFn: (input: AstrologerDocumentUpload) => uploadAstrologerDocument(id, input),
    invalidate: [astrologerKeys.documents(id)],
    successMessage: "Document uploaded",
    toastErrors: false,
  });
}

export function useReviewAstrologerDocument(id: string) {
  return useAdminMutation({
    mutationFn: ({ documentId, input }: { documentId: string; input: AstrologerDocumentReview }) => reviewAstrologerDocument(id, documentId, input),
    invalidate: [astrologerKeys.documents(id)],
    successMessage: (result) => (result.status === "approved" ? "Document approved" : result.status === "rejected" ? "Document rejected" : "Document moved back to review"),
    toastErrors: false,
  });
}

export function useDeleteAstrologerDocument(id: string) {
  return useAdminMutation({
    mutationFn: (documentId: string) => deleteAstrologerDocument(id, documentId),
    invalidate: [astrologerKeys.documents(id)],
    successMessage: "Document deleted",
    toastErrors: false,
  });
}

/** Fetches a private document for viewing (each call is audited on the server). */
export function fetchAstrologerDocumentFile(id: string, documentId: string) {
  return downloadAstrologerDocument(id, documentId);
}
