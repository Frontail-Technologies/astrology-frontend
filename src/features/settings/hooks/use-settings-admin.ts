"use client";

import { useAdminQuery } from "@/features/admin/data/use-admin-detail";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { listSettings, updateSetting } from "../api/settings-admin-api";
import { settingsKeys } from "../queries/settings-query-keys";

export function useSettings() {
  return useAdminQuery(settingsKeys.all, (signal) => listSettings(signal));
}

export function useUpdateSetting(key: string) {
  return useAdminMutation({
    mutationFn: (value: unknown) => updateSetting(key, value),
    invalidate: [settingsKeys.all],
    successMessage: "Setting saved",
    toastErrors: false,
  });
}
