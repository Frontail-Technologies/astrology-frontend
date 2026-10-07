"use client";

import { useMockRepository } from "@/features/admin/hooks/use-mock-repository";
import { canonicalProducts } from "../data/products";
import type { StoreProduct } from "../types/store";

const STORE_KEY = "astrology-admin-products-v2";

export function useProductRepository() {
  return useMockRepository<StoreProduct>(STORE_KEY, canonicalProducts);
}
