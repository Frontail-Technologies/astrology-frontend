"use client";

import { useMockRepository } from "@/features/admin/hooks/use-mock-repository";
import { customers as seedCustomers } from "../data/customers";
import type { Customer } from "../types/customer";

const STORE_KEY = "astrology-admin-customers-v1";

export function useCustomerRepository() {
  return useMockRepository<Customer>(STORE_KEY, seedCustomers);
}
