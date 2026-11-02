import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { Customer, CustomerAccountStatus } from "../types/customer";
import type { CustomerDetail } from "../types/customer-admin";

/** Server-side page of customers. Query keys: `search`, `status`, `page`, `limit` (backend max 100). */
export function listCustomers(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<Customer>("/customers", query, signal);
}

export function getCustomer(id: string, signal?: AbortSignal) {
  return adminGet<CustomerDetail>(`/customers/${encodeId(id)}`, { signal });
}

export function updateCustomerStatus(id: string, status: CustomerAccountStatus) {
  return adminSend<Customer>(`/customers/${encodeId(id)}/status`, "PATCH", { status });
}
