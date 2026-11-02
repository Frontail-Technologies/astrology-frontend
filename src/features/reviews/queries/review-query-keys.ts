import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { ReviewListFilter, ReviewListIdFilter } from "../state/review-list-state";

const keys = createAdminQueryKeys("reviews");

export const reviewKeys = {
  ...keys,
  list: (state: AdminListState<ReviewListFilter, ReviewListIdFilter>) => keys.list(state),
};
