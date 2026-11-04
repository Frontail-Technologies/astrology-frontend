import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { ManagedPoojaRequest, PoojaRequestAssignmentInput, PoojaRequestScheduleInput, PoojaRequestStatusInput } from "../types/pooja-request-admin";

export function listPoojaRequests(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<ManagedPoojaRequest>("/pooja-requests", query, signal);
}

export function getPoojaRequest(id: string, signal?: AbortSignal) {
  return adminGet<ManagedPoojaRequest>(`/pooja-requests/${encodeId(id)}`, { signal });
}

/** 409 INVALID_POOJA_REQUEST_TRANSITION / POOJA_REQUEST_STATUS_CONFLICT. */
export function updatePoojaRequestStatus(id: string, input: PoojaRequestStatusInput) {
  return adminSend<ManagedPoojaRequest>(`/pooja-requests/${encodeId(id)}/status`, "PATCH", input);
}

/** Schedules an accepted request or reschedules a scheduled one (the customer is notified). */
export function schedulePoojaRequest(id: string, input: PoojaRequestScheduleInput) {
  return adminSend<ManagedPoojaRequest>(`/pooja-requests/${encodeId(id)}/schedule`, "PATCH", input);
}

/** Assigns (or clears, with null) the astrologer who performs the pooja; the astrologer is notified. 400 if not an approved astrologer, 409 POOJA_REQUEST_NOT_ASSIGNABLE once closed. */
export function assignPoojaRequest(id: string, input: PoojaRequestAssignmentInput) {
  return adminSend<ManagedPoojaRequest>(`/pooja-requests/${encodeId(id)}/assignment`, "PATCH", input);
}
