"use client";

import { useCallback } from "react";
import { useMockRepository } from "@/features/admin/hooks/use-mock-repository";
import { horoscopeSeedData } from "../data/horoscopes";
import type { HoroscopeEntry, HoroscopePeriod, ZodiacSign } from "../types/horoscope";

export function horoscopeEntryId(period: HoroscopePeriod, date: string, sign: ZodiacSign) {
  return `${period}-${date}-${sign}`;
}

export function useHoroscopeRepository() {
  const repository = useMockRepository<HoroscopeEntry>("astrology-admin-horoscopes-v1", horoscopeSeedData);
  const getEntry = useCallback((period: HoroscopePeriod, date: string, sign: ZodiacSign) =>
    repository.records.find((entry) => entry.period === period && entry.date === date && entry.sign === sign) ?? null,
  [repository.records]);
  return { ...repository, getEntry };
}
