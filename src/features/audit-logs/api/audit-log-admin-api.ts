import { adminGet, adminList, encodeId } from "@/features/admin/data/admin-api";
import type { AdminAuditLog } from "../types/audit-log-admin";

export function listAuditLogs(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminAuditLog>("/audit-logs", query, signal);
}

export function getAuditLog(id: string, signal?: AbortSignal) {
  return adminGet<AdminAuditLog>(`/audit-logs/${encodeId(id)}`, { signal });
}
