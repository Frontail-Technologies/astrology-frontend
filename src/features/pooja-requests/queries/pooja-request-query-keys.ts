import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { PoojaRequestListFilter } from "../state/pooja-request-list-state";

const keys = createAdminQueryKeys("pooja-requests");

export const poojaRequestKeys = {
  ...keys,
  list: (state: AdminListState<PoojaRequestListFilter, never>) => keys.list(state),
};
