import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { AdminOrder, OrderStatus, OrderTrackingInput } from "../types/order-admin";

export function listOrders(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<AdminOrder>("/orders", query, signal);
}

export function getOrder(id: string, signal?: AbortSignal) {
  return adminGet<AdminOrder>(`/orders/${encodeId(id)}`, { signal });
}

export function updateOrderStatus(id: string, status: OrderStatus) {
  return adminSend<AdminOrder>(`/orders/${encodeId(id)}/status`, "PATCH", { status });
}

/** Courier and tracking number shown to the customer in the app (audited). */
export function updateOrderTracking(id: string, input: OrderTrackingInput) {
  return adminSend<AdminOrder>(`/orders/${encodeId(id)}/tracking`, "PATCH", input);
}
