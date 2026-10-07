"use client";

import { useMemo } from "react";
import { useCategoryRepository } from "@/features/store/hooks/use-category-repository";
import { useProductRepository } from "@/features/store/hooks/use-product-repository";
import { getListedProducts, getPublicCategories } from "../selectors/storefront-products";

/**
 * Storefront view of the shared Store repositories. The first render uses the
 * seed catalog (identical on server and client); `ready` flips once any Admin
 * edits in this browser have been loaded, so routes must not 404 before then.
 */
export function useStorefrontCatalog() {
  const products = useProductRepository();
  const categories = useCategoryRepository();

  const publicCategories = useMemo(() => getPublicCategories(categories.records), [categories.records]);
  const listedProducts = useMemo(
    () => getListedProducts(products.records, categories.records),
    [products.records, categories.records],
  );

  return {
    ready: products.ready && categories.ready,
    allProducts: products.records,
    allCategories: categories.records,
    products: listedProducts,
    categories: publicCategories,
  };
}
