"use client";

import { useSearchParams } from "next/navigation";

import { Container } from "@/components/layout/container";
import { collectionIntro, storeFaqs } from "../content/store-content";
import { useStorefrontCatalog } from "../hooks/use-storefront-catalog";
import { searchProducts } from "../selectors/storefront-products";
import { CollectionGuidance } from "./collection-guidance";
import { CollectionHeader } from "./collection-header";
import { CollectionEmptyState, ProductCollection, type CollectionChip } from "./product-collection";
import { StoreFaq } from "./store-faq";
import { StoreTrustStrip } from "./store-trust-strip";

export function ShopSearchView() {
  const query = (useSearchParams().get("q") ?? "").trim();
  const { products, categories } = useStorefrontCatalog();
  const results = searchProducts(products, categories, query);

  if (query) {
    return (
      <main className="text-foreground">
        <CollectionHeader
          variant="search"
          breadcrumb={[{ label: "Shop", href: "/shop" }, { label: "Search" }]}
          title={`Search results for “${query}”`}
          description={`${results.length} ${results.length === 1 ? "product" : "products"}`}
        />
        <Container className="max-w-[1440px] py-8 sm:py-10">
          <ProductCollection
            key={query}
            products={results}
            categories={categories}
            emptyState={
              <CollectionEmptyState
                message={`No products found for “${query}”.`}
                actions={[
                  { label: "Clear search", href: "/shop/search", primary: true },
                  { label: "Back to shop", href: "/shop" },
                ]}
              />
            }
          />
        </Container>
      </main>
    );
  }

  const chips: CollectionChip[] = [
    { label: "All products", href: "/shop/search", active: true },
    ...categories.map((category) => ({ label: category.name, href: `/shop/category/${category.slug}`, active: false })),
  ];

  return (
    <main className="text-foreground">
      <CollectionHeader
        variant="all"
        breadcrumb={[{ label: "Shop", href: "/shop" }, { label: "All products" }]}
        title={collectionIntro.title}
        description={collectionIntro.description}
      />
      <Container className="max-w-[1440px] pb-14 pt-6 sm:pt-8">
        <ProductCollection
          products={results}
          categories={categories}
          chips={chips}
          emptyState={<CollectionEmptyState message="No products available yet." actions={[{ label: "Back to shop", href: "/shop", primary: true }]} />}
        />

        <div className="mt-10 sm:mt-12">
          <StoreTrustStrip />
        </div>
        <div className="mt-10 sm:mt-12">
          <CollectionGuidance />
        </div>
        <div className="mt-10 sm:mt-12">
          <StoreFaq items={storeFaqs} />
        </div>
      </Container>
    </main>
  );
}
