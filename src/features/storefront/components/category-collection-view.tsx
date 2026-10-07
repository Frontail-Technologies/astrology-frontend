"use client";

import { notFound } from "next/navigation";
import { Check } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { storeFaqs } from "../content/store-content";
import { useStorefrontCatalog } from "../hooks/use-storefront-catalog";
import { getCategoryProducts, isCategoryPublic } from "../selectors/storefront-products";
import { CollectionGuidance } from "./collection-guidance";
import { CollectionHeader } from "./collection-header";
import { CollectionEmptyState, ProductCollection, type CollectionChip } from "./product-collection";
import { StoreFaq } from "./store-faq";
import { StoreTrustStrip } from "./store-trust-strip";

export function CategoryCollectionView({ slug }: { slug: string }) {
  const { ready, allCategories, categories, products } = useStorefrontCatalog();
  const category = allCategories.find((item) => item.slug === slug);

  if (!category || !isCategoryPublic(category)) {
    if (!ready) {
      return (
        <Container className="max-w-[1440px] py-8">
          <Skeleton className="h-4 w-48" />
          <Skeleton className="mt-6 h-10 w-72" />
          <Skeleton className="mt-8 h-64 w-full rounded-xl" />
        </Container>
      );
    }
    notFound();
  }

  const items = getCategoryProducts(products, category.id);
  const details = category.details;
  const hasEditorial = Boolean(details?.about?.length || details?.highlights?.length);
  const chips: CollectionChip[] = [
    { label: "All products", href: "/shop/search", active: false },
    ...categories.map((item) => ({ label: item.name, href: `/shop/category/${item.slug}`, active: item.id === category.id })),
  ];

  return (
    <main className="text-foreground">
      <CollectionHeader
        variant="category"
        breadcrumb={[{ label: "Shop", href: "/shop" }, { label: category.name }]}
        title={category.name}
        description={category.description}
        count={items.length}
        imageSrc={category.imageSrc}
      />

      <Container className="max-w-[1440px] pb-14 pt-6 sm:pt-8">
        <ProductCollection
          products={items}
          categories={categories}
          chips={chips}
          emptyState={
            <CollectionEmptyState
              message="No products in this collection yet."
              actions={[{ label: "Browse all products", href: "/shop/search", primary: true }]}
            />
          }
        />

        <div className="mt-10 sm:mt-12">
          <StoreTrustStrip />
        </div>

        <div className="mt-10 sm:mt-12">
          {hasEditorial ? (
            <section aria-labelledby="about-category" className="grid gap-6 rounded-2xl border border-border bg-surface p-6 sm:p-8 lg:grid-cols-[2fr_1fr] lg:gap-10">
              <div>
                <h2 id="about-category" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                  About {category.name}
                </h2>
                <div className="mt-3 space-y-3">
                  {details?.about?.map((paragraph) => (
                    <p key={paragraph} className="text-base leading-7 text-muted-foreground">
                      {paragraph}
                    </p>
                  ))}
                </div>
              </div>
              {details?.highlights?.length ? (
                <ul className="h-fit space-y-3 rounded-xl bg-surface-muted/70 p-5">
                  {details.highlights.map((item) => (
                    <li key={item} className="flex gap-3 text-sm text-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              ) : null}
            </section>
          ) : (
            <CollectionGuidance />
          )}
        </div>

        <div className="mt-10 sm:mt-12">
          <StoreFaq items={details?.faq?.length ? details.faq : storeFaqs} title={details?.faq?.length ? `${category.name} FAQs` : undefined} />
        </div>
      </Container>
    </main>
  );
}
