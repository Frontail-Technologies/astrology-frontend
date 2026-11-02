import { adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import { horoscopeGridQuery, type HoroscopeGridState } from "../state/horoscope-grid-state";
import type { HoroscopeCreateInput, HoroscopePeriod, HoroscopeStatus, HoroscopeUpdateInput, ManagedHoroscope, ZodiacSign } from "../types/horoscope-admin";

/** Every sign's entry for a period starting exactly on the grid date (at most 12). */
export async function listHoroscopeGrid(state: HoroscopeGridState, signal?: AbortSignal) {
  const page = await adminList<ManagedHoroscope>("/horoscopes", horoscopeGridQuery(state), signal);
  return page.items;
}

/** The entry for one period/sign/start date, or `null` when none has been written. */
export async function findHoroscopeEntry(period: HoroscopePeriod, sign: ZodiacSign, date: string, signal?: AbortSignal) {
  const page = await adminList<ManagedHoroscope>("/horoscopes", { period, sign, from: date, to: date, page: 1, limit: 1 }, signal);
  return page.items[0] ?? null;
}

/** 409 `HOROSCOPE_DUPLICATE` when the period/sign/start date already has an entry. */
export function createHoroscope(input: HoroscopeCreateInput) {
  return adminSend<ManagedHoroscope>("/horoscopes", "POST", input);
}

export function updateHoroscope(id: string, input: HoroscopeUpdateInput) {
  return adminSend<ManagedHoroscope>(`/horoscopes/${encodeId(id)}`, "PATCH", input);
}

export function updateHoroscopeStatus(id: string, status: HoroscopeStatus) {
  return adminSend<ManagedHoroscope>(`/horoscopes/${encodeId(id)}/status`, "PATCH", { status });
}

export function deleteHoroscope(id: string) {
  return adminSend<{ deleted: true }>(`/horoscopes/${encodeId(id)}`, "DELETE");
}
