import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { paymentStatusLabels } from "../constants/payment-status.ts";

export type PaymentListFilter = "status";
export type PaymentListIdFilter = "customerUserId";

/** The payments API names its free-text filter `customer` (email or phone). */
export const paymentListConfig: AdminListConfig<PaymentListFilter, PaymentListIdFilter> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 320,
  searchParam: "customer",
  filters: { status: Object.keys(paymentStatusLabels) },
  idFilters: ["customerUserId"],
  dateRange: true,
};
