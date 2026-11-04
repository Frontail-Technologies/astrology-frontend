import type { ZodiacSign } from "@/features/horoscopes/types/horoscope-admin";
import type { SignCompatibilityEntry, SignCompatibilityInput } from "../types/sign-compatibility-admin";

/** Zodiac order (same as the API enum). Kept local so this module stays dependency-free for node tests. */
const zodiacOrder: readonly ZodiacSign[] = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"];

export const COMPATIBILITY_SUMMARY_LIMITS = { min: 20, max: 2_000 } as const;

/** Same ordering rule as the API: the earlier sign in zodiac order comes first. */
export function orderedPair(a: ZodiacSign, b: ZodiacSign): [ZodiacSign, ZodiacSign] {
  return zodiacOrder.indexOf(a) <= zodiacOrder.indexOf(b) ? [a, b] : [b, a];
}

export const pairKey = (a: ZodiacSign, b: ZodiacSign) => orderedPair(a, b).join(":");

export function indexEntries(entries: SignCompatibilityEntry[]) {
  return new Map(entries.map((entry) => [pairKey(entry.signA, entry.signB), entry]));
}

export type CompatibilityFormValues = { score: string; love: string; trust: string; communication: string; summary: string; published: boolean };

export function entryToForm(entry: SignCompatibilityEntry | undefined): CompatibilityFormValues {
  return entry
    ? { score: String(entry.score), love: String(entry.love), trust: String(entry.trust), communication: String(entry.communication), summary: entry.summary, published: entry.published }
    : { score: "", love: "", trust: "", communication: "", summary: "", published: false };
}

const percent = (value: string) => (/^\d{1,3}$/.test(value.trim()) && Number(value) <= 100 ? Number(value) : null);

/** Field errors keyed by form field; empty when the values can be saved. */
export function compatibilityFormErrors(values: CompatibilityFormValues): Partial<Record<keyof CompatibilityFormValues, string>> {
  const errors: Partial<Record<keyof CompatibilityFormValues, string>> = {};
  for (const key of ["score", "love", "trust", "communication"] as const) {
    if (percent(values[key]) === null) errors[key] = "Use a whole number from 0 to 100.";
  }
  const length = values.summary.trim().length;
  if (length < COMPATIBILITY_SUMMARY_LIMITS.min || length > COMPATIBILITY_SUMMARY_LIMITS.max) errors.summary = `Write ${COMPATIBILITY_SUMMARY_LIMITS.min}–${COMPATIBILITY_SUMMARY_LIMITS.max} characters.`;
  return errors;
}

export function formToInput(values: CompatibilityFormValues): SignCompatibilityInput {
  return { score: Number(values.score), love: Number(values.love), trust: Number(values.trust), communication: Number(values.communication), summary: values.summary.trim(), published: values.published };
}
