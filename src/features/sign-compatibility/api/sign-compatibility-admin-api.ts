import { adminGet, adminSend } from "@/features/admin/data/admin-api";
import type { ZodiacSign } from "@/features/horoscopes/types/horoscope-admin";
import type { SignCompatibilityEntry, SignCompatibilityInput } from "../types/sign-compatibility-admin";

export function listSignCompatibility(signal?: AbortSignal) {
  return adminGet<{ items: SignCompatibilityEntry[] }>("/sign-compatibility", { signal });
}

/** Creates or replaces the entry for a pair (either order). */
export function saveSignCompatibility(signA: ZodiacSign, signB: ZodiacSign, input: SignCompatibilityInput) {
  return adminSend<SignCompatibilityEntry>(`/sign-compatibility/${signA}/${signB}`, "PUT", input);
}

export function deleteSignCompatibility(signA: ZodiacSign, signB: ZodiacSign) {
  return adminSend<{ deleted: true }>(`/sign-compatibility/${signA}/${signB}`, "DELETE");
}
