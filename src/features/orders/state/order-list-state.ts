import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { orderStatusLabels } from "../constants/order-status.ts";

export type OrderListFilter = "status";

/** The orders API names its free-text filter `orderNumber` (max 32 characters). */
export const orderListConfig: AdminListConfig<OrderListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 32,
  searchParam: "orderNumber",
  filters: { status: Object.keys(orderStatusLabels) },
  dateRange: true,
};
