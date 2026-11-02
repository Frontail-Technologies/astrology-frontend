import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { PoojaListFilter } from "../state/pooja-list-state";

const keys = createAdminQueryKeys("poojas");

export const poojaKeys = {
  ...keys,
  list: (state: AdminListState<PoojaListFilter, never>) => keys.list(state),
  /** Public master data (active categories only); not admin-scoped. */
  categories: () => ["master-data", "pooja-categories"] as const,
};
