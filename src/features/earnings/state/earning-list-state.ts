import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { earningStatusLabels } from "../constants/earning-status.ts";

export type EarningListFilter = "status";
export type EarningListIdFilter = "astrologerId" | "consultationId" | "chatSessionId";

export const earningListConfig: AdminListConfig<EarningListFilter, EarningListIdFilter> = {
  defaultLimit: 20,
  maxLimit: 100,
  filters: { status: Object.keys(earningStatusLabels) },
  idFilters: ["astrologerId", "consultationId", "chatSessionId"],
  dateRange: true,
};
