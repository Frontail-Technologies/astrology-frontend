import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { AuditLogListFilter, AuditLogListIdFilter } from "../state/audit-log-list-state";

const keys = createAdminQueryKeys("audit-logs");

export const auditLogKeys = {
  ...keys,
  list: (state: AdminListState<AuditLogListFilter, AuditLogListIdFilter>) => keys.list(state),
};
