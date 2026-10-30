import { apiRequest } from "@/lib/api/api-client";
import type { Customer } from "../types/customer";

export type CustomerConsultation = {
  id: string;
  astrologerId: string;
  astrologerName: string;
  mode: string;
  status: "requested" | "accepted" | "scheduled" | "in_progress" | "completed" | "cancelled" | "rejected";
  requestedAt: string;
  scheduledAt: string | null;
  completedAt: string | null;
  pricePaise: number;
};

export type CustomerDetail = Customer & {
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  lastLoginAt: string | null;
  consultations: CustomerConsultation[];
  consultationSummary: { total: number; completed: number };
};

type CustomerPage = {
  items: Customer[];
  page: number;
  limit: number;
  total: number;
  totalPages: number;
};

export function listCustomers(signal?: AbortSignal) {
  return apiRequest<CustomerPage>("/admin/customers?limit=100", { signal });
}

export function getCustomer(id: string, signal?: AbortSignal) {
  return apiRequest<CustomerDetail>(`/admin/customers/${encodeURIComponent(id)}`, { signal });
}

export function updateCustomerStatus(id: string, status: NonNullable<Customer["accountStatus"]>) {
  return apiRequest<Customer>(`/admin/customers/${encodeURIComponent(id)}/status`, { method: "PATCH", body: { status } });
}
