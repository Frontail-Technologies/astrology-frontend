import { z } from "zod";

import { HOROSCOPE_LIMITS } from "../constants/horoscope-status.ts";
import type { HoroscopeCreateInput, HoroscopePeriod, HoroscopeSections, HoroscopeStatus, HoroscopeUpdateInput, ManagedHoroscope, ZodiacSign } from "../types/horoscope-admin.ts";

/** Editor values. `periodEnd` is `""` when open. `status` is only sent on create (existing entries use `/status`). */
export type HoroscopeFormValues = {
  overview: string;
  love: string;
  career: string;
  health: string;
  periodEnd: string;
  status: HoroscopeStatus;
};

export const emptyHoroscopeForm: HoroscopeFormValues = { overview: "", love: "", career: "", health: "", periodEnd: "", status: "draft" };

export type HoroscopeEntryKey = { period: HoroscopePeriod; sign: ZodiacSign; date: string };

const section = z.string().trim().max(HOROSCOPE_LIMITS.section, { error: `Use at most ${HOROSCOPE_LIMITS.section} characters.` });

/** `periodStart` is needed to check that the end is not before the start. */
export function horoscopeFormSchema(periodStart: string) {
  return z.object({
    overview: z.string().trim().min(1, { error: "Write the overview." }).max(HOROSCOPE_LIMITS.guidance),
    love: section,
    career: section,
    health: section,
    periodEnd: z
      .string()
      .refine((value) => value === "" || /^\d{4}-\d{2}-\d{2}$/.test(value), { error: "Use a valid date." })
      .refine((value) => value === "" || value >= periodStart, { error: "The end date cannot be before the start date." }),
    status: z.enum(["draft", "published"]),
  });
}

export function horoscopeToFormValues(entry: ManagedHoroscope): HoroscopeFormValues {
  return { overview: entry.overview, love: entry.love, career: entry.career, health: entry.health, periodEnd: entry.periodEnd ?? "", status: entry.status };
}

/** Non-empty sections only; `null` when all three are empty (the API rejects empty strings and `{}`). */
export function toHoroscopeSections(values: Pick<HoroscopeFormValues, "love" | "career" | "health">): HoroscopeSections | null {
  const sections: HoroscopeSections = {};
  for (const key of ["love", "career", "health"] as const) {
    const text = values[key].trim();
    if (text) sections[key] = text;
  }
  return Object.keys(sections).length ? sections : null;
}

export function toHoroscopeCreateInput(values: HoroscopeFormValues, key: HoroscopeEntryKey): HoroscopeCreateInput {
  return {
    period: key.period,
    zodiacSign: key.sign,
    periodStart: key.date,
    periodEnd: values.periodEnd || null,
    guidance: values.overview.trim(),
    sections: toHoroscopeSections(values),
    status: values.status,
  };
}

export function toHoroscopeUpdateInput(values: HoroscopeFormValues): HoroscopeUpdateInput {
  return { periodEnd: values.periodEnd || null, guidance: values.overview.trim(), sections: toHoroscopeSections(values) };
}
