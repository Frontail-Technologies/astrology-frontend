"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Container } from "@/components/layout/container";
import { storeFaqs } from "../content/store-content";
import { useStorefrontCatalog } from "../hooks/use-storefront-catalog";
import { getCategoryProducts, getFeaturedProducts } from "../selectors/storefront-products";
import { ProductGrid } from "./product-grid";
import { StoreCategoryCard } from "./store-category-card";
import { StoreEditorialFeature } from "./store-editorial-feature";
import { StoreFaq } from "./store-faq";
import { StoreHero } from "./store-hero";
import { StoreTrustStrip } from "./store-trust-strip";

function SectionHeading({ id, title, href, hrefLabel }: { id: string; title: string; href?: string; hrefLabel?: string }) {
  return (
    <div className="flex items-end justify-between gap-4">
      <h2 id={id} className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
        {title}
      </h2>
      {href ? (
        <Link
          href={href}
          className="flex shrink-0 items-center gap-1 text-sm font-semibold text-conversion-600 hover:underline dark:text-conversion-500"
        >
          {hrefLabel ?? "View all"} <ArrowRight className="size-4" aria-hidden="true" />
        </Link>
      ) : null}
    </div>
  );
}

export function StoreHome() {
  const { products, categories } = useStorefrontCatalog();

  const featured = getFeaturedProducts(products, 4);
  const featuredIds = new Set(featured.map((product) => product.id));
  const stockedCategories = categories.filter((category) => getCategoryProducts(products, category.id).length > 0);
  const rudraksha = categories.find((category) => category.slug === "rudraksha");
  const primaryCategory = rudraksha ?? categories[0];

  const exploreCategory = categories
    .map((category) => ({
      category,
      items: getCategoryProducts(products, category.id).filter((product) => !featuredIds.has(product.id)),
    }))
    .sort((a, b) => b.items.length - a.items.length)[0];
  const showExplore = exploreCategory && exploreCategory.items.length >= 2;

  return (
    <main className="text-foreground">
      <StoreHero primaryCategory={primaryCategory} />

      <Container className="max-w-[1440px] pb-14 pt-10 sm:pt-12">
        {stockedCategories.length ? (
          <section aria-labelledby="shop-by-category">
            <SectionHeading id="shop-by-category" title="Shop by category" href="/shop/search" hrefLabel="View all products" />
            <ul className="mt-5 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              {stockedCategories.slice(0, 6).map((category) => (
                <li key={category.id}>
                  <StoreCategoryCard category={category} productCount={getCategoryProducts(products, category.id).length} />
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        {featured.length ? (
          <section aria-labelledby="featured-products" className="mt-10 sm:mt-12">
            <SectionHeading id="featured-products" title="Featured products" href="/shop/search" hrefLabel="View all products" />
            <ProductGrid products={featured} categories={categories} className="mt-5" />
          </section>
        ) : null}

        <div className="mt-8 sm:mt-9">
          <StoreTrustStrip />
        </div>

        {rudraksha ? (
          <div className="mt-12 sm:mt-14">
            <StoreEditorialFeature categorySlug={rudraksha.slug} />
          </div>
        ) : null}

        {showExplore ? (
          <section aria-labelledby="explore-category" className="mt-10 sm:mt-12">
            <SectionHeading
              id="explore-category"
              title={`Explore ${exploreCategory.category.name}`}
              href={`/shop/category/${exploreCategory.category.slug}`}
              hrefLabel="View collection"
            />
            <ProductGrid products={exploreCategory.items.slice(0, 4)} categories={categories} className="mt-5" />
          </section>
        ) : null}

        <div className="mt-10 sm:mt-12">
          <StoreFaq items={storeFaqs} />
        </div>
      </Container>
    </main>
  );
}
