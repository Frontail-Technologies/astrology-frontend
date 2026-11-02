import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { consultationModeLabels, consultationStatusLabels } from "../constants/consultation-status.ts";

export type ConsultationListFilter = "status" | "mode";
export type ConsultationListIdFilter = "astrologerId" | "customerUserId";

/** The consultations API has no free-text search; only these validated filters reach it. */
export const consultationListConfig: AdminListConfig<ConsultationListFilter, ConsultationListIdFilter> = {
  defaultLimit: 20,
  maxLimit: 100,
  filters: { status: Object.keys(consultationStatusLabels), mode: Object.keys(consultationModeLabels) },
  idFilters: ["astrologerId", "customerUserId"],
  dateRange: true,
};
