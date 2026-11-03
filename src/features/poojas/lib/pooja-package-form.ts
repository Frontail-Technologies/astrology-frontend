/** Pooja package dialog <-> API mapping. Pure so it runs under `node --test`. */
import type { PoojaPackage, PoojaPackageInput } from "../types/pooja-admin.ts";

export type PoojaPackageFormValues = {
  name: string;
  description: string;
  pricePaise: number | null;
  durationMinutes: string;
  maxDevotees: string;
  sortOrder: string;
  active: boolean;
};

export type PoojaPackageFormErrors = Partial<Record<keyof PoojaPackageFormValues, string>>;

/** Server limits (`api/src/modules/pooja-booking/pooja-booking.routes.ts`). */
export const POOJA_PACKAGE_LIMITS = { name: [2, 120], description: 500, maxDevotees: 21, maxDuration: 1_440, maxSort: 1_000, maxPricePaise: 100_000_000 } as const;

export function packageToFormValues(pkg: PoojaPackage | null, nextSortOrder = 0): PoojaPackageFormValues {
  if (!pkg) return { name: "", description: "", pricePaise: null, durationMinutes: "", maxDevotees: "1", sortOrder: String(nextSortOrder), active: true };
  return {
    name: pkg.name,
    description: pkg.description,
    pricePaise: pkg.pricePaise,
    durationMinutes: pkg.durationMinutes === null ? "" : String(pkg.durationMinutes),
    maxDevotees: String(pkg.maxDevotees),
    sortOrder: String(pkg.sortOrder),
    active: pkg.active,
  };
}

const wholeNumber = (value: string) => /^\d+$/.test(value.trim());

export function validatePackageForm(values: PoojaPackageFormValues): PoojaPackageFormErrors {
  const errors: PoojaPackageFormErrors = {};
  const name = values.name.trim();
  if (name.length < POOJA_PACKAGE_LIMITS.name[0] || name.length > POOJA_PACKAGE_LIMITS.name[1]) errors.name = "Enter a package name (2–120 characters).";
  if (values.description.trim().length > POOJA_PACKAGE_LIMITS.description) errors.description = "Keep the description under 500 characters.";
  if (values.pricePaise === null || values.pricePaise <= 0) errors.pricePaise = "Enter the package price.";
  else if (values.pricePaise > POOJA_PACKAGE_LIMITS.maxPricePaise) errors.pricePaise = "Price is too high.";
  const duration = values.durationMinutes.trim();
  if (duration && (!wholeNumber(duration) || Number(duration) < 1 || Number(duration) > POOJA_PACKAGE_LIMITS.maxDuration)) errors.durationMinutes = "Use whole minutes from 1 to 1,440, or leave it empty.";
  if (!wholeNumber(values.maxDevotees) || Number(values.maxDevotees) < 1 || Number(values.maxDevotees) > POOJA_PACKAGE_LIMITS.maxDevotees) errors.maxDevotees = "Allow 1 to 21 names.";
  if (!wholeNumber(values.sortOrder) || Number(values.sortOrder) > POOJA_PACKAGE_LIMITS.maxSort) errors.sortOrder = "Use a whole number from 0 to 1,000.";
  return errors;
}

/** API body; call only after `validatePackageForm` returned no errors. */
export function packageFormToInput(values: PoojaPackageFormValues): PoojaPackageInput {
  const duration = values.durationMinutes.trim();
  return {
    name: values.name.trim(),
    description: values.description.trim(),
    pricePaise: values.pricePaise ?? 0,
    durationMinutes: duration ? Number(duration) : null,
    maxDevotees: Number(values.maxDevotees.trim()),
    sortOrder: Number(values.sortOrder.trim()),
    active: values.active,
  };
}
