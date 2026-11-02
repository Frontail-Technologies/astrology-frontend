import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { customerStatuses } from "../constants/customer-status.ts";

export type CustomerListFilter = "status";

export const customerListConfig: AdminListConfig<CustomerListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  filters: { status: customerStatuses },
};
