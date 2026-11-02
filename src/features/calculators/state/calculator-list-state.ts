import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { calculatorCategoryLabels, calculatorFeaturedLabels, calculatorStatusLabels } from "../constants/calculator-status.ts";

export type CalculatorListFilter = "category" | "featured" | "status";

export const calculatorListConfig: AdminListConfig<CalculatorListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 200,
  filters: {
    category: Object.keys(calculatorCategoryLabels),
    // The API accepts only "true" | "false".
    featured: Object.keys(calculatorFeaturedLabels),
    status: Object.keys(calculatorStatusLabels),
  },
};
