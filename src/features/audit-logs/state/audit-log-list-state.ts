import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { auditActionValues, auditEntityTypeValues } from "../types/audit-log-admin.ts";

export type AuditLogListFilter = "action" | "entityType";
export type AuditLogListIdFilter = "actorUserId" | "entityId";

/** The audit API is strict: no free-text search; actor/entity ids, action, entity type and a date range only. */
export const auditLogListConfig: AdminListConfig<AuditLogListFilter, AuditLogListIdFilter> = {
  defaultLimit: 20,
  maxLimit: 100,
  filters: { action: auditActionValues, entityType: auditEntityTypeValues },
  idFilters: ["actorUserId", "entityId"],
  dateRange: true,
};
