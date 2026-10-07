"use client";

import { useMockRepository } from "@/features/admin/hooks/use-mock-repository";
import { articleSeedData } from "../data/articles";
import type { Article } from "../types/article";

export function useArticleRepository() {
  return useMockRepository<Article>("astrology-admin-articles-v1", articleSeedData);
}

export function articleSlug(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}
