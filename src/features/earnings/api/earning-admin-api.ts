import { adminGet, adminList, encodeId } from "@/features/admin/data/admin-api";
import type { AdminEarning, EarningSummary } from "../types/earning-admin";

export function listEarnings(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminEarning>("/earnings", query, signal);
}

/** Platform-wide summary, or one astrologer's when `astrologerId` is given. */
export function getEarningSummary(signal?: AbortSignal, astrologerId?: string) {
  return adminGet<EarningSummary>("/earnings/summary", { query: { astrologerId }, signal });
}

export function getEarning(id: string, signal?: AbortSignal) {
  return adminGet<AdminEarning>(`/earnings/${encodeId(id)}`, { signal });
}

export function listAvailableEarnings(astrologerId: string, signal?: AbortSignal) {
  return adminList<AdminEarning>("/earnings", { astrologerId, status: "available", page: 1, limit: 100 }, signal);
}
