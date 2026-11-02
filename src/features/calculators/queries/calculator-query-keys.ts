import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { CalculatorListFilter } from "../state/calculator-list-state";

const keys = createAdminQueryKeys("calculators");

export const calculatorKeys = {
  ...keys,
  list: (state: AdminListState<CalculatorListFilter, never>) => keys.list(state),
};
