import { adminGet, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { AdminAccount, CreateAdminInput } from "../types/admin-user";

export function listAdmins(signal?: AbortSignal) {
  return adminGet<{ items: AdminAccount[] }>("/admins", { signal });
}

/** 409 EMAIL_IN_USE when any account already uses the email. */
export function createAdmin(input: CreateAdminInput) {
  return adminSend<AdminAccount>("/admins", "POST", input);
}

export function renameAdmin(id: string, displayName: string | null) {
  return adminSend<AdminAccount>(`/admins/${encodeId(id)}`, "PATCH", { displayName });
}

/** Signs them out everywhere. 409 CANNOT_DEACTIVATE_SELF / LAST_ACTIVE_ADMIN. */
export function deactivateAdmin(id: string) {
  return adminSend<AdminAccount>(`/admins/${encodeId(id)}/deactivate`, "POST", {});
}

/**
 * Removes an admin: they're signed out, can't sign in and leave the list; their audit history stays. Adding the same
 * email later restores the account. 409 CANNOT_DELETE_SELF / LAST_ACTIVE_ADMIN.
 */
export function deleteAdmin(id: string) {
  return adminSend<{ deleted: true }>(`/admins/${encodeId(id)}`, "DELETE");
}

export function reactivateAdmin(id: string) {
  return adminSend<AdminAccount>(`/admins/${encodeId(id)}/reactivate`, "POST", {});
}

/** Sets a temporary password (they must change it at next sign-in) and signs them out everywhere. */
export function resetAdminPassword(id: string, temporaryPassword: string) {
  return adminSend<AdminAccount>(`/admins/${encodeId(id)}/reset-password`, "POST", { temporaryPassword });
}

/** The signed-in admin's own password. 401 INVALID_CURRENT_PASSWORD. */
export function changeOwnPassword(currentPassword: string, newPassword: string) {
  return adminSend<{ changed: true }>("/me/password", "POST", { currentPassword, newPassword });
}
