import type {
  PoojaDefinition,
  PoojaManagementStatus,
} from "../types/pooja";

export type PoojaContentCompleteness = {
  completed: number;
  total: number;
  percentage: number;
};

export function getPoojaContentCompleteness(pooja: PoojaDefinition): PoojaContentCompleteness {
  const checks = [
    Boolean(pooja.name.trim()),
    Boolean(pooja.shortDescription.trim()),
    Boolean(pooja.imageSrc.trim()),
    pooja.categories.length > 0,
    Boolean(pooja.status),
    pooja.detail.overview.length > 0,
    pooja.detail.quickFacts.length > 0,
    pooja.detail.ritualSteps.length > 0,
    pooja.detail.requiredDetails.length > 0,
    pooja.detail.preparationNotes.length > 0,
  ];
  const completed = checks.filter(Boolean).length;

  return {
    completed,
    total: checks.length,
    percentage: Math.round((completed / checks.length) * 100),
  };
}

export function getPoojaRitualStepCount(pooja: PoojaDefinition): number {
  return pooja.detail.ritualSteps.length;
}

export function getPoojaRequiredDetailsCount(pooja: PoojaDefinition): number {
  return pooja.detail.requiredDetails.length;
}

export function formatPoojaDuration(minutes: number | undefined): string {
  if (minutes === undefined) return "\u2014";

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) return `${minutes} min`;
  if (remainingMinutes === 0) return `${hours} hr`;
  return `${hours} hr ${remainingMinutes} min`;
}

export function formatPoojaPrice(priceInPaise: number | undefined, currency: "INR" | undefined): string {
  if (priceInPaise === undefined || currency === undefined) return "\u2014";

  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(priceInPaise / 100);
}

export function getPoojaManagementStatusLabel(status: PoojaManagementStatus): string {
  switch (status) {
    case "draft":
      return "Draft";
    case "active":
      return "Active";
    case "archived":
      return "Archived";
  }
}
