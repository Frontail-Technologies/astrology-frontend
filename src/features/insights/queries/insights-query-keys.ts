import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { RangeQuery, SeriesQuery } from "../types/insights-admin";

const keys = createAdminQueryKeys("insights");

export type ReportKind = "consultations" | "store" | "finance" | "operations" | "customers" | "content";

/** Dashboard/report reads live under `["admin", "insights"]`; recent audit entries under the same root. */
export const insightsKeys = {
  all: keys.all,
  summary: () => keys.scoped("dashboard", "summary"),
  revenueSeries: (query: SeriesQuery) => keys.scoped("dashboard", "revenue-series", query),
  activitySeries: (query: SeriesQuery) => keys.scoped("dashboard", "activity-series", query),
  report: (kind: ReportKind, query: RangeQuery | Record<string, string>) => keys.scoped("report", kind, query),
  recentAudit: (limit: number) => keys.scoped("recent-audit", limit),
};
