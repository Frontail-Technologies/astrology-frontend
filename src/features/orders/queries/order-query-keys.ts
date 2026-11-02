import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { OrderListFilter } from "../state/order-list-state";

const keys = createAdminQueryKeys("orders");

export const orderKeys = {
  ...keys,
  list: (state: AdminListState<OrderListFilter, never>) => keys.list(state),
};
