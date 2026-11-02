"use client";

import { useCallback, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";

import { useAdminQuery } from "@/features/admin/data/use-admin-detail";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { createHoroscope, deleteHoroscope, findHoroscopeEntry, listHoroscopeGrid, updateHoroscope, updateHoroscopeStatus } from "../api/horoscope-admin-api";
import { horoscopeKeys } from "../queries/horoscope-query-keys";
import {
  defaultGridDate,
  monthInputValue,
  normalizeGridDate,
  parseHoroscopeGridState,
  serializeHoroscopeGridState,
  type HoroscopeGridState,
} from "../state/horoscope-grid-state";
import type { HoroscopeCreateInput, HoroscopePeriod, HoroscopeStatus, HoroscopeUpdateInput, ZodiacSign } from "../types/horoscope-admin";

export function useHoroscopeGrid(state: HoroscopeGridState) {
  return useAdminQuery(horoscopeKeys.grid(state), (signal) => listHoroscopeGrid(state, signal));
}

/** `data` is the entry or `null` (not written yet). */
export function useHoroscopeEntry(period: HoroscopePeriod, sign: ZodiacSign, date: string) {
  return useAdminQuery(horoscopeKeys.entry(period, sign, date), (signal) => findHoroscopeEntry(period, sign, date, signal));
}

export function useCreateHoroscope() {
  return useAdminMutation({ mutationFn: (input: HoroscopeCreateInput) => createHoroscope(input), invalidate: [horoscopeKeys.all], successMessage: "Horoscope created", toastErrors: false });
}

export function useUpdateHoroscope(id: string) {
  return useAdminMutation({ mutationFn: (input: HoroscopeUpdateInput) => updateHoroscope(id, input), invalidate: [horoscopeKeys.all], successMessage: "Horoscope saved", toastErrors: false });
}

export function useHoroscopeStatusUpdate(id: string) {
  return useAdminMutation({
    mutationFn: (status: HoroscopeStatus) => updateHoroscopeStatus(id, status),
    invalidate: [horoscopeKeys.all],
    successMessage: (result) => (result.status === "published" ? "Horoscope published" : "Horoscope moved to draft"),
    toastErrors: false,
  });
}

/** Options for `AdminDeleteAction` (views never import the API module). */
export const horoscopeDeleteOptions = {
  mutationFn: deleteHoroscope,
  invalidate: [horoscopeKeys.all],
};

/** Grid period/date in the URL (`?period=&date=`); invalid values fall back to the period's current start date. */
export function useHoroscopeGridState() {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [today] = useState(() => new Date());
  const state = useMemo(() => parseHoroscopeGridState(params, today), [params, today]);
  const replace = useCallback((next: HoroscopeGridState) => router.replace(`${pathname}?${serializeHoroscopeGridState(next)}`, { scroll: false }), [pathname, router]);
  return {
    state,
    /** Switching period resets the date to that period's current start. */
    setPeriod: (period: HoroscopePeriod) => replace({ period, date: defaultGridDate(period, today) }),
    /** Accepts `YYYY-MM-DD` (or `YYYY-MM` for monthly); invalid input is ignored. */
    setDate: (value: string) => {
      const date = normalizeGridDate(state.period, value);
      if (date) replace({ period: state.period, date });
    },
    /** Value for the date control (`YYYY-MM` for monthly, else `YYYY-MM-DD`). */
    inputValue: state.period === "monthly" ? monthInputValue(state.date) : state.date,
  };
}
