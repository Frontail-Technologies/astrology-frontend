import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { HoroscopeGridState } from "../state/horoscope-grid-state";
import type { HoroscopePeriod, ZodiacSign } from "../types/horoscope-admin";

const keys = createAdminQueryKeys("horoscopes");

export const horoscopeKeys = {
  ...keys,
  /** One period/date page of the sign grid. */
  grid: (state: HoroscopeGridState) => keys.scoped("grid", state.period, state.date),
  /** The single entry for a period, sign and start date (or none). */
  entry: (period: HoroscopePeriod, sign: ZodiacSign, date: string) => keys.scoped("entry", period, sign, date),
};
