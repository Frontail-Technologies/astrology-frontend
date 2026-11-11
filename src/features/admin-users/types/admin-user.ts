/** `/admin/admins` account (every admin has full access; no roles yet). */
export type AdminAccount = {
  id: string;
  email: string;
  displayName: string | null;
  status: "active" | "suspended";
  /** True until the admin replaces the temporary password they were given. */
  mustChangePassword: boolean;
  lastLoginAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** The signed-in admin's own row. */
  isYou: boolean;
};

export type CreateAdminInput = { email: string; displayName?: string; temporaryPassword: string };
