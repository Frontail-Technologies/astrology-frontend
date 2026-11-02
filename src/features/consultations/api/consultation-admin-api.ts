import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { AdminConsultation, ConsultationOverrideInput, ConsultationStatus } from "../types/consultation-admin";

export function listConsultations(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminConsultation>("/consultations", query, signal);
}

export function getConsultation(id: string, signal?: AbortSignal) {
  return adminGet<AdminConsultation>(`/consultations/${encodeId(id)}`, { signal });
}

/** Audited admin override; refused while a paid chat session is active (CONSULTATION_CHAT_SESSION_ACTIVE). */
export function overrideConsultationStatus(id: string, input: ConsultationOverrideInput) {
  return adminSend<{ id: string; status: ConsultationStatus }>(`/consultations/${encodeId(id)}/status`, "PATCH", input);
}
