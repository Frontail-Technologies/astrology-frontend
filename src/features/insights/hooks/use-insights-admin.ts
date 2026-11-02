"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback, useMemo } from "react";

import { parseAdminRange, resolveAdminRange, type AdminRangeState } from "@/features/admin/data/admin-range";
import { useAdminQuery } from "@/features/admin/data/use-admin-detail";
import {
  getActivitySeries,
  getConsultationReport,
  getContentReport,
  getCustomerReport,
  getDashboardSummary,
  getFinanceReport,
  getOperationsReport,
  getRevenueSeries,
  getStoreReport,
  listRecentAuditLogs,
} from "../api/insights-admin-api";
import { normalizeFinance, normalizeOperations } from "../lib/insights-view-models";
import { insightsKeys } from "../queries/insights-query-keys";
import {
  consultationReportQuery,
  parseReportsUrlState,
  serializeRangeOnly,
  serializeReportsUrlState,
  type ReportsUrlState,
} from "../state/insights-state";
import type { ConsultationReportFilters, RangeQuery, SeriesQuery } from "../types/insights-admin";

function useReplaceQuery() {
  const router = useRouter();
  const pathname = usePathname();
  return useCallback((query: string) => router.replace(query ? `${pathname}?${query}` : pathname, { scroll: false }), [pathname, router]);
}

/** Dashboard chart range, kept in the URL (`?range=7d|30d|90d|custom&from&to`). */
export function useInsightsRange() {
  const searchParams = useSearchParams();
  const replace = useReplaceQuery();
  const range = useMemo(() => parseAdminRange(searchParams), [searchParams]);
  const resolved = useMemo(() => resolveAdminRange(range), [range]);
  const setRange = useCallback((next: AdminRangeState) => replace(serializeRangeOnly(next)), [replace]);
  return { range, resolved, setRange };
}

/** Reports URL state: tab, range and consultation filters. */
export function useReportsState() {
  const searchParams = useSearchParams();
  const replace = useReplaceQuery();
  const state = useMemo(() => parseReportsUrlState(searchParams), [searchParams]);
  const resolved = useMemo(() => resolveAdminRange(state.range), [state.range]);
  const update = useCallback((patch: Partial<ReportsUrlState>) => replace(serializeReportsUrlState({ ...state, ...patch })), [replace, state]);
  return { state, resolved, update };
}

export function useDashboardSummary() {
  return useAdminQuery(insightsKeys.summary(), (signal) => getDashboardSummary(signal));
}

export function useRevenueSeries(query: SeriesQuery) {
  return useAdminQuery(insightsKeys.revenueSeries(query), (signal) => getRevenueSeries(query, signal));
}

export function useActivitySeries(query: SeriesQuery) {
  return useAdminQuery(insightsKeys.activitySeries(query), (signal) => getActivitySeries(query, signal));
}

export function useRecentAuditLogs(limit: number) {
  return useAdminQuery(insightsKeys.recentAudit(limit), (signal) => listRecentAuditLogs(limit, signal));
}

export function useConsultationReport(range: RangeQuery, filters: ConsultationReportFilters, enabled = true) {
  const query = consultationReportQuery(range, filters);
  return useAdminQuery(insightsKeys.report("consultations", query), (signal) => getConsultationReport(query, signal), enabled);
}

export function useStoreReport(range: RangeQuery, enabled = true) {
  return useAdminQuery(insightsKeys.report("store", range), (signal) => getStoreReport(range, signal), enabled);
}

export function useFinanceReport(range: RangeQuery, enabled = true) {
  return useAdminQuery(insightsKeys.report("finance", range), async (signal) => normalizeFinance(await getFinanceReport(range, signal)), enabled);
}

export function useOperationsReport(range: RangeQuery, enabled = true) {
  return useAdminQuery(insightsKeys.report("operations", range), async (signal) => normalizeOperations(await getOperationsReport(range, signal)), enabled);
}

export function useCustomerReport(range: RangeQuery, enabled = true) {
  return useAdminQuery(insightsKeys.report("customers", range), (signal) => getCustomerReport(range, signal), enabled);
}

export function useContentReport(range: RangeQuery, enabled = true) {
  return useAdminQuery(insightsKeys.report("content", range), (signal) => getContentReport(range, signal), enabled);
}
