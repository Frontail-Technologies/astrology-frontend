"use client";

import { isUuid } from "@/features/admin/data/admin-list-state";
import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { getAuditLog, listAuditLogs } from "../api/audit-log-admin-api";
import { auditLogKeys } from "../queries/audit-log-query-keys";
import { auditLogListConfig } from "../state/audit-log-list-state";

export function useAuditLogList() {
  return useAdminList(auditLogListConfig, auditLogKeys.list, listAuditLogs);
}

/**
 * One entry by id, for `?entry=<id>` deep links whose entry is not on the current list page (`enabled: false` when
 * the page already has it). Never requested for a non-UUID id.
 */
export function useAuditLogDetail(id: string | null, enabled = true) {
  const valid = isUuid(id);
  const detail = useAdminDetail(auditLogKeys.detail(id ?? ""), (signal) => getAuditLog(id ?? "", signal), valid && enabled);
  return { ...detail, invalidId: Boolean(id) && !valid };
}
