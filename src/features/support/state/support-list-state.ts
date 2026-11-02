import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { ticketCategoryLabels, ticketPriorityLabels, ticketStatusLabels } from "../constants/support-status.ts";

export type SupportListFilter = "status" | "priority" | "category";
export type SupportListIdFilter = "customerUserId";

export const supportListConfig: AdminListConfig<SupportListFilter, SupportListIdFilter> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 120,
  filters: { status: Object.keys(ticketStatusLabels), priority: Object.keys(ticketPriorityLabels), category: Object.keys(ticketCategoryLabels) },
  idFilters: ["customerUserId"],
};
