"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import { getCustomer, listCustomers, updateCustomerStatus } from "../api/customer-admin-api";
import { customerKeys } from "../queries/customer-query-keys";
import { customerListConfig } from "../state/customer-list-state";
import type { CustomerAccountStatus } from "../types/customer";

/** Customers list: URL-driven, server-paginated, server-filtered. Never falls back to mock data. */
export function useCustomerList() {
  return useAdminList(customerListConfig, customerKeys.list, listCustomers);
}

export function useCustomerDetail(id: string) {
  const detail = useAdminDetail(customerKeys.detail(id), (signal) => getCustomer(id, signal), Boolean(id));
  return { customer: detail.data, ready: detail.ready, error: detail.error, reload: detail.reload };
}

export function useUpdateCustomerStatus(id: string) {
  return useAdminMutation({
    mutationFn: (status: CustomerAccountStatus) => updateCustomerStatus(id, status),
    invalidate: [customerKeys.all],
    successMessage: (_result, status) => `Customer ${status === "active" ? "reactivated" : status}`,
    toastErrors: false,
  });
}
