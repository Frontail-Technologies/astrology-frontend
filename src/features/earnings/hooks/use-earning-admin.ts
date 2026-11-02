"use client";

import { useAdminDetail, useAdminQuery } from "@/features/admin/data/use-admin-detail";
import { ADMIN_SCOPED_LIST_LIMIT, useAdminScopedList } from "@/features/admin/data/use-admin-scoped-list";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { getEarning, getEarningSummary, listAvailableEarnings, listEarnings } from "../api/earning-admin-api";
import { earningKeys } from "../queries/earning-query-keys";
import { earningListConfig } from "../state/earning-list-state";

export function useEarningList() {
  return useAdminList(earningListConfig, earningKeys.list, listEarnings);
}

export function useEarningSummary() {
  return useAdminQuery(earningKeys.summary(), (signal) => getEarningSummary(signal));
}

export function useEarningDetail(id: string) {
  return useAdminDetail(earningKeys.detail(id), (signal) => getEarning(id, signal), Boolean(id));
}

export function useAvailableEarnings(astrologerId: string | null) {
  return useAdminQuery(earningKeys.available(astrologerId ?? ""), (signal) => listAvailableEarnings(astrologerId!, signal), Boolean(astrologerId));
}

/** Latest earnings for one astrologer (first page) for related panels. */
export function useEarningsForAstrologer(astrologerId: string | null | undefined, limit = ADMIN_SCOPED_LIST_LIMIT) {
  return useAdminScopedList(earningKeys.scoped("related", "astrologerId", astrologerId ?? "", limit), listEarnings, { key: "astrologerId", id: astrologerId }, limit);
}

/** Earnings produced by one consultation (first page). */
export function useEarningsForConsultation(consultationId: string | null | undefined, limit = ADMIN_SCOPED_LIST_LIMIT) {
  return useAdminScopedList(earningKeys.scoped("related", "consultationId", consultationId ?? "", limit), listEarnings, { key: "consultationId", id: consultationId }, limit);
}

/** Earnings produced by one billed chat session (first page). */
export function useEarningsForChatSession(chatSessionId: string | null | undefined, limit = ADMIN_SCOPED_LIST_LIMIT) {
  return useAdminScopedList(earningKeys.scoped("related", "chatSessionId", chatSessionId ?? "", limit), listEarnings, { key: "chatSessionId", id: chatSessionId }, limit);
}

/** One astrologer's earnings summary (gross, platform fee, payable, paid). Disabled until the id is set. */
export function useEarningSummaryForAstrologer(astrologerId: string | null | undefined) {
  return useAdminQuery(earningKeys.summary(astrologerId ?? ""), (signal) => getEarningSummary(signal, astrologerId ?? undefined), Boolean(astrologerId));
}
