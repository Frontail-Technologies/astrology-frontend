"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { ADMIN_SCOPED_LIST_LIMIT, useAdminScopedList } from "@/features/admin/data/use-admin-scoped-list";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { getConsultation, listConsultations, overrideConsultationStatus } from "../api/consultation-admin-api";
import { consultationStatusLabels } from "../constants/consultation-status";
import { consultationKeys } from "../queries/consultation-query-keys";
import { consultationListConfig } from "../state/consultation-list-state";
import type { ConsultationOverrideInput } from "../types/consultation-admin";

export function useConsultationList() {
  return useAdminList(consultationListConfig, consultationKeys.list, listConsultations);
}

export function useConsultationDetail(id: string) {
  return useAdminDetail(consultationKeys.detail(id), (signal) => getConsultation(id, signal), Boolean(id));
}

export function useConsultationOverride(id: string) {
  return useAdminMutation({
    mutationFn: (input: ConsultationOverrideInput) => overrideConsultationStatus(id, input),
    invalidate: [consultationKeys.all],
    successMessage: (result) => `Consultation moved to ${consultationStatusLabels[result.status].toLowerCase()}`,
    toastErrors: false,
  });
}

/** A customer's latest consultations (first page) for related panels. */
export function useConsultationsForCustomer(id: string | null | undefined, limit = ADMIN_SCOPED_LIST_LIMIT) {
  return useAdminScopedList(consultationKeys.scoped("related", "customerUserId", id ?? "", limit), listConsultations, { key: "customerUserId", id }, limit);
}

/** An astrologer's latest consultations (first page) for related panels. */
export function useConsultationsForAstrologer(id: string | null | undefined, limit = ADMIN_SCOPED_LIST_LIMIT) {
  return useAdminScopedList(consultationKeys.scoped("related", "astrologerId", id ?? "", limit), listConsultations, { key: "astrologerId", id }, limit);
}
