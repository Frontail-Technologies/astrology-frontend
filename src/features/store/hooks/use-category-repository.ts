"use client";

import { useMockRepository } from "@/features/admin/hooks/use-mock-repository";
import { canonicalProductCategories } from "../data/categories";
import type { ProductCategory } from "../types/store";

const STORE_KEY = "astrology-admin-categories-v1";

export function useCategoryRepository() {
  return useMockRepository<ProductCategory>(STORE_KEY, canonicalProductCategories);
}
