"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { createCalculator, deleteCalculator, getCalculator, listCalculators, updateCalculator, updateCalculatorStatus } from "../api/calculator-admin-api";
import { calculatorKeys } from "../queries/calculator-query-keys";
import { calculatorListConfig } from "../state/calculator-list-state";
import type { CalculatorInput, CalculatorStatus } from "../types/calculator-admin";

export function useCalculatorList() {
  return useAdminList(calculatorListConfig, calculatorKeys.list, listCalculators);
}

export function useCalculatorDetail(id: string) {
  return useAdminDetail(calculatorKeys.detail(id), (signal) => getCalculator(id, signal), Boolean(id));
}

export function useCreateCalculator() {
  return useAdminMutation({ mutationFn: (input: CalculatorInput) => createCalculator(input), invalidate: [calculatorKeys.all], successMessage: "Calculator created", toastErrors: false });
}

export function useUpdateCalculator(id: string) {
  return useAdminMutation({ mutationFn: (input: CalculatorInput) => updateCalculator(id, input), invalidate: [calculatorKeys.all], successMessage: "Calculator saved", toastErrors: false });
}

export function useCalculatorStatusUpdate(id: string) {
  return useAdminMutation({ mutationFn: (status: CalculatorStatus) => updateCalculatorStatus(id, status), invalidate: [calculatorKeys.all], successMessage: "Calculator status updated", toastErrors: false });
}

/** Options for `AdminDeleteAction` (views never import the API module). */
export const calculatorDeleteOptions = {
  mutationFn: deleteCalculator,
  invalidate: [calculatorKeys.all],
  remove: (id: string) => [calculatorKeys.detail(id)],
};
