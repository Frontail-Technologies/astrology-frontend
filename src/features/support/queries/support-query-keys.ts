import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { SupportListFilter, SupportListIdFilter } from "../state/support-list-state";

const keys = createAdminQueryKeys("support");

export const supportKeys = {
  ...keys,
  list: (state: AdminListState<SupportListFilter, SupportListIdFilter>) => keys.list(state),
};
