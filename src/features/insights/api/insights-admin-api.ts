import { adminGet, adminList } from "@/features/admin/data/admin-api";
import type {
  ActivityBucket,
  ContentReport,
  ConsultationReport,
  CustomerReport,
  DashboardSummary,
  FinanceReportResponse,
  OperationsReport,
  RangeQuery,
  RecentAuditLog,
  RevenueBucket,
  SeriesQuery,
  StoreReport,
} from "../types/insights-admin";

export function getDashboardSummary(signal?: AbortSignal) {
  return adminGet<DashboardSummary>("/dashboard/summary", { signal });
}

export function getRevenueSeries(query: SeriesQuery, signal?: AbortSignal) {
  return adminGet<RevenueBucket[]>("/dashboard/revenue-series", { query, signal });
}

export function getActivitySeries(query: SeriesQuery, signal?: AbortSignal) {
  return adminGet<ActivityBucket[]>("/dashboard/activity-series", { query, signal });
}

export function getConsultationReport(query: Record<string, string>, signal?: AbortSignal) {
  return adminGet<ConsultationReport>("/reports/consultations", { query, signal });
}

export function getStoreReport(query: RangeQuery, signal?: AbortSignal) {
  return adminGet<StoreReport>("/reports/store", { query, signal });
}

export function getFinanceReport(query: RangeQuery, signal?: AbortSignal) {
  return adminGet<FinanceReportResponse>("/reports/finance", { query, signal });
}

export function getOperationsReport(query: RangeQuery, signal?: AbortSignal) {
  return adminGet<Partial<Record<keyof OperationsReport, unknown>>>("/reports/operations", { query, signal });
}

export function getCustomerReport(query: RangeQuery, signal?: AbortSignal) {
  return adminGet<CustomerReport>("/reports/customers", { query, signal });
}

export function getContentReport(query: RangeQuery, signal?: AbortSignal) {
  return adminGet<ContentReport>("/reports/content", { query, signal });
}

/** Newest audit entries (the API sorts newest first). */
export function listRecentAuditLogs(limit: number, signal?: AbortSignal) {
  return adminList<RecentAuditLog>("/audit-logs", { page: 1, limit }, signal);
}
