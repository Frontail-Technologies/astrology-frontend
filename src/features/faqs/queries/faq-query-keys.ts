import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { FaqListFilter } from "../state/faq-list-state";

const keys = createAdminQueryKeys("faqs");

export const faqKeys = {
  ...keys,
  list: (state: AdminListState<FaqListFilter, never>) => keys.list(state),
};
