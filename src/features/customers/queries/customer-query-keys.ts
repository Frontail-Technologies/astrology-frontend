import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { CustomerListFilter } from "../state/customer-list-state";

const keys = createAdminQueryKeys("customers");

export const customerKeys = {
  ...keys,
  list: (state: AdminListState<CustomerListFilter, never>) => keys.list(state),
};
