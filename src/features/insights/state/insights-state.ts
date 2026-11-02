/**
 * URL state for Reports: tab, consultation filters and the shared admin range (`?range=&from=&to=`).
 * Pure (no React, no `@/` aliases).
 */
import { parseAdminRange, serializeAdminRange, type AdminRangeState } from "../../admin/data/admin-range.ts";
import { emptyConsultationFilters, reportTabs, type ReportTab } from "../constants/insights-status.ts";
import {
  consultationReportModes,
  consultationReportStatuses,
  type ConsultationReportFilters,
  type ConsultationReportMode,
  type ConsultationReportStatus,
} from "../types/insights-admin.ts";

type ParamsLike = { get(name: string): string | null };

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export { emptyConsultationFilters };

export type ReportsUrlState = { tab: ReportTab; range: AdminRangeState; consultation: ConsultationReportFilters };

export function parseReportTab(value: string | null): ReportTab {
  return reportTabs.includes(value as ReportTab) ? (value as ReportTab) : "overview";
}

export function parseConsultationFilters(params: ParamsLike): ConsultationReportFilters {
  const mode = params.get("mode");
  const status = params.get("status");
  const astrologerId = params.get("astrologerId");
  return {
    mode: consultationReportModes.includes(mode as ConsultationReportMode) ? (mode as ConsultationReportMode) : null,
    status: consultationReportStatuses.includes(status as ConsultationReportStatus) ? (status as ConsultationReportStatus) : null,
    astrologerId: astrologerId && UUID.test(astrologerId) ? astrologerId : null,
  };
}

export function parseReportsUrlState(params: ParamsLike): ReportsUrlState {
  return { tab: parseReportTab(params.get("tab")), range: parseAdminRange(params), consultation: parseConsultationFilters(params) };
}

/** State -> query string. Consultation filters are kept only on the consultations tab; defaults are omitted. */
export function serializeReportsUrlState(state: ReportsUrlState): string {
  const params = serializeAdminRange(state.range);
  if (state.tab !== "overview") params.set("tab", state.tab);
  if (state.tab === "consultations") {
    if (state.consultation.mode) params.set("mode", state.consultation.mode);
    if (state.consultation.status) params.set("status", state.consultation.status);
    if (state.consultation.astrologerId) params.set("astrologerId", state.consultation.astrologerId);
  }
  return params.toString();
}

/** Range-only query string (dashboard). */
export function serializeRangeOnly(range: AdminRangeState): string {
  return serializeAdminRange(range).toString();
}

/** API query for `GET /admin/reports/consultations` (unset filters omitted). */
export function consultationReportQuery(range: { from: string; to: string }, filters: ConsultationReportFilters): Record<string, string> {
  const query: Record<string, string> = { from: range.from, to: range.to };
  if (filters.mode) query.mode = filters.mode;
  if (filters.status) query.status = filters.status;
  if (filters.astrologerId) query.astrologerId = filters.astrologerId;
  return query;
}
