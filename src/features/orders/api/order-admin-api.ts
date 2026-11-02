import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { AdminOrder, OrderStatus } from "../types/order-admin";

export function listOrders(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminOrder>("/orders", query, signal);
}

export function getOrder(id: string, signal?: AbortSignal) {
  return adminGet<AdminOrder>(`/orders/${encodeId(id)}`, { signal });
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  return adminSend<AdminOrder>(`/orders/${encodeId(id)}/status`, "PATCH", { status });
}
