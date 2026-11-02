import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { EarningListFilter, EarningListIdFilter } from "../state/earning-list-state";

const keys = createAdminQueryKeys("earnings");

export const earningKeys = {
  ...keys,
  list: (state: AdminListState<EarningListFilter, EarningListIdFilter>) => keys.list(state),
  summary: (astrologerId?: string) => (astrologerId ? keys.scoped("summary", astrologerId) : keys.scoped("summary")),
  available: (astrologerId: string) => keys.scoped("available", astrologerId),
};
