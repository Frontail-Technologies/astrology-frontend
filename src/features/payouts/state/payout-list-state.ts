import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { payoutStatusLabels } from "../constants/payout-status.ts";

export type PayoutListFilter = "status";
export type PayoutListIdFilter = "astrologerId";

export const payoutListConfig: AdminListConfig<PayoutListFilter, PayoutListIdFilter> = {
  defaultLimit: 20,
  maxLimit: 100,
  filters: { status: Object.keys(payoutStatusLabels) },
  idFilters: ["astrologerId"],
  dateRange: true,
};
