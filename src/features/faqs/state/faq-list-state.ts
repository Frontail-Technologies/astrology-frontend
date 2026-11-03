import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { faqCategoryLabels, faqVisibilityLabels } from "../constants/faq-status.ts";

export type FaqListFilter = "category" | "active";

export const faqListConfig: AdminListConfig<FaqListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 120,
  searchParam: "q",
  filters: {
    category: Object.keys(faqCategoryLabels),
    active: Object.keys(faqVisibilityLabels),
  },
};
