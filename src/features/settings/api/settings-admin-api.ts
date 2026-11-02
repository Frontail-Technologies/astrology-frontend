import { adminGet, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { EffectiveSetting } from "../types/settings-admin";

export function listSettings(signal?: AbortSignal) {
  return adminGet<EffectiveSetting[]>("/settings", { signal });
}

/** The server validates the value against the key's schema; saving the default removes the override. */
export function updateSetting(key: string, value: unknown) {
  return adminSend<EffectiveSetting>(`/settings/${encodeId(key)}`, "PATCH", { value });
}
