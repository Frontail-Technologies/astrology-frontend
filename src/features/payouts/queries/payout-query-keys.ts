import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { PayoutListFilter, PayoutListIdFilter } from "../state/payout-list-state";

const keys = createAdminQueryKeys("payouts");

export const payoutKeys = {
  ...keys,
  list: (state: AdminListState<PayoutListFilter, PayoutListIdFilter>) => keys.list(state),
};
