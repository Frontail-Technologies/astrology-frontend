"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { createFaq, deleteFaq, getFaq, listFaqs, updateFaq } from "../api/faq-admin-api";
import { faqKeys } from "../queries/faq-query-keys";
import { faqListConfig } from "../state/faq-list-state";
import type { FaqInput } from "../types/faq-admin";

export function useFaqList() {
  return useAdminList(faqListConfig, faqKeys.list, listFaqs);
}

export function useFaqDetail(id: string) {
  return useAdminDetail(faqKeys.detail(id), (signal) => getFaq(id, signal), Boolean(id));
}

export function useCreateFaq() {
  return useAdminMutation({
    mutationFn: (input: FaqInput) => createFaq(input),
    invalidate: [faqKeys.all],
    successMessage: "FAQ created",
    toastErrors: false,
  });
}

export function useUpdateFaq(id: string) {
  return useAdminMutation({
    mutationFn: (input: FaqInput) => updateFaq(id, input),
    invalidate: [faqKeys.all],
    successMessage: "FAQ saved",
    toastErrors: false,
  });
}

/** Options for `AdminDeleteAction` (views never import the API module). */
export const faqDeleteOptions = {
  mutationFn: deleteFaq,
  invalidate: [faqKeys.all],
  remove: (id: string) => [faqKeys.detail(id)],
};
