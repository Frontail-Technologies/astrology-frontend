"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { createAdmin, deactivateAdmin, deleteAdmin, listAdmins, reactivateAdmin, renameAdmin, resetAdminPassword } from "../api/admin-user-api";
import { adminUserKeys } from "../queries/admin-user-query-keys";
import type { CreateAdminInput } from "../types/admin-user";

export function useAdminAccounts() {
  return useAdminDetail(adminUserKeys.all, (signal) => listAdmins(signal));
}

const options = { invalidate: [adminUserKeys.all], toastErrors: false as const };

export function useCreateAdmin() {
  return useAdminMutation({ ...options, mutationFn: (input: CreateAdminInput) => createAdmin(input), successMessage: "Admin added" });
}

export function useRenameAdmin(id: string) {
  return useAdminMutation({ ...options, mutationFn: (displayName: string | null) => renameAdmin(id, displayName), successMessage: "Name saved" });
}

export function useAdminStatus(id: string) {
  return useAdminMutation({ ...options, mutationFn: (active: boolean) => (active ? reactivateAdmin(id) : deactivateAdmin(id)), successMessage: "Access updated" });
}

export function useDeleteAdmin(id: string) {
  return useAdminMutation({ ...options, mutationFn: () => deleteAdmin(id), successMessage: "Admin deleted" });
}

export function useResetAdminPassword(id: string) {
  return useAdminMutation({ ...options, mutationFn: (temporaryPassword: string) => resetAdminPassword(id, temporaryPassword), successMessage: "Temporary password set" });
}
