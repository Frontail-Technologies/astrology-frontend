"use client";

import { useCallback, useMemo } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { getCustomer, listCustomers, updateCustomerStatus } from "../api/customer-api";
import type { CustomerAccountStatus } from "../types/customer";

export const customerQueryKeys = {
  all: ["admin", "customers"] as const,
  list: () => [...customerQueryKeys.all, "list"] as const,
  detail: (id: string) => [...customerQueryKeys.all, "detail", id] as const,
};

export function useCustomerRepository() {
  const queryClient = useQueryClient();
  const query = useQuery({
    queryKey: customerQueryKeys.list(),
    queryFn: ({ signal }) => listCustomers(signal),
  });
  const records = useMemo(() => query.data?.items ?? [], [query.data?.items]);
  const getById = useCallback(
    (id: string) => records.find((record) => record.id === id) ?? null,
    [records],
  );
  const getBySlug = useCallback(() => null, []);
  const slugExists = useCallback(() => false, []);
  const reload = useCallback(() => {
    void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
  }, [queryClient]);

  return {
    records,
    ready: !query.isPending,
    error: query.error,
    reload,
    getById,
    getBySlug,
    slugExists,
  };
}

export function useCustomerDetail(id: string) {
  const query = useQuery({
    queryKey: customerQueryKeys.detail(id),
    queryFn: ({ signal }) => getCustomer(id, signal),
    enabled: Boolean(id),
  });

  return {
    customer: query.data ?? null,
    ready: !query.isPending,
    error: query.error,
    reload: () => { void query.refetch(); },
  };
}

export function useUpdateCustomerStatus(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (status: CustomerAccountStatus) => updateCustomerStatus(id, status),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: customerQueryKeys.all });
    },
  });
}
