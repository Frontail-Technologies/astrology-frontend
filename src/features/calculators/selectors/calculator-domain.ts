import { calculatorCategories } from "../data/calculators";
import type { CalculatorCategory, CalculatorCatalogStatus, CalculatorDefinition } from "../types/calculator";

export type CalculatorImplementationState = "partial" | "catalog-only";
export type CalculatorEngineState = "not-connected";

type CalculatorImplementation = {
  hasDetail: boolean;
  hasTool: boolean;
  hasValidation: boolean;
  resultUi: "placeholder" | "missing";
};

const implementationRegistry: Partial<Record<CalculatorDefinition["slug"], CalculatorImplementation>> = {
  "love-compatibility": { hasDetail: true, hasTool: true, hasValidation: true, resultUi: "placeholder" },
};

const catalogOnlyImplementation: CalculatorImplementation = {
  hasDetail: false,
  hasTool: false,
  hasValidation: false,
  resultUi: "missing",
};

export function getCalculatorCategoryLabel(category: CalculatorCategory): string {
  return calculatorCategories.find((option) => option.value === category)?.label ?? category;
}

export function getCalculatorCatalogStatusLabel(status: CalculatorCatalogStatus): string {
  return status === "available" ? "Available" : "Coming soon";
}

export function getCalculatorImplementation(calculator: CalculatorDefinition): CalculatorImplementation {
  return implementationRegistry[calculator.slug] ?? catalogOnlyImplementation;
}

export function getCalculatorImplementationState(calculator: CalculatorDefinition): CalculatorImplementationState {
  const implementation = getCalculatorImplementation(calculator);
  return implementation.hasDetail || implementation.hasTool ? "partial" : "catalog-only";
}

export function getCalculatorImplementationStateLabel(state: CalculatorImplementationState): string {
  return state === "partial" ? "Partial" : "Catalog only";
}

export function hasCalculatorPublicRoute(calculator: CalculatorDefinition): boolean {
  return getCalculatorImplementation(calculator).hasDetail;
}

export function getCalculatorEngineState(): CalculatorEngineState {
  return "not-connected";
}

export function getCalculatorEngineStateLabel(): string {
  return "Not connected";
}
