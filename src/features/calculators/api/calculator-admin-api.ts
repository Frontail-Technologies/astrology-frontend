import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { CalculatorInput, CalculatorStatus, ManagedCalculator } from "../types/calculator-admin";

export function listCalculators(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<ManagedCalculator>("/calculators", query, signal);
}

export function getCalculator(id: string, signal?: AbortSignal) {
  return adminGet<ManagedCalculator>(`/calculators/${encodeId(id)}`, { signal });
}

/** New calculators start as "coming soon" (server default). */
export function createCalculator(input: CalculatorInput) {
  return adminSend<ManagedCalculator>("/calculators", "POST", input);
}

export function updateCalculator(id: string, input: CalculatorInput) {
  return adminSend<ManagedCalculator>(`/calculators/${encodeId(id)}`, "PATCH", input);
}

export function updateCalculatorStatus(id: string, status: CalculatorStatus) {
  return adminSend<ManagedCalculator>(`/calculators/${encodeId(id)}/status`, "PATCH", { status });
}

export function deleteCalculator(id: string) {
  return adminSend<{ deleted: true }>(`/calculators/${encodeId(id)}`, "DELETE");
}
