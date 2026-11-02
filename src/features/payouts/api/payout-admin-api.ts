import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { AdminPayout, CreatePayoutInput, PayoutStatusInput } from "../types/payout-admin";

export function listPayouts(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminPayout>("/payouts", query, signal);
}

export function getPayout(id: string, signal?: AbortSignal) {
  return adminGet<AdminPayout>(`/payouts/${encodeId(id)}`, { signal });
}

/** The server computes the amount from the astrologer's available (or selected) earnings. */
export function createPayout(input: CreatePayoutInput) {
  return adminSend<AdminPayout>("/payouts", "POST", input);
}

export function updatePayoutStatus(id: string, input: PayoutStatusInput) {
  return adminSend<AdminPayout>(`/payouts/${encodeId(id)}/status`, "PATCH", input);
}
