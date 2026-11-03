import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { FaqInput, ManagedFaq } from "../types/faq-admin";

export function listFaqs(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<ManagedFaq>("/faqs", query, signal);
}

export function getFaq(id: string, signal?: AbortSignal) {
  return adminGet<ManagedFaq>(`/faqs/${encodeId(id)}`, { signal });
}

export function createFaq(input: FaqInput) {
  return adminSend<ManagedFaq>("/faqs", "POST", input);
}

export function updateFaq(id: string, input: FaqInput) {
  return adminSend<ManagedFaq>(`/faqs/${encodeId(id)}`, "PATCH", input);
}

export function deleteFaq(id: string) {
  return adminSend<{ deleted: true }>(`/faqs/${encodeId(id)}`, "DELETE");
}
