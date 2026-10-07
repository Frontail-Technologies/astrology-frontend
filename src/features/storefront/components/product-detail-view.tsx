"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowRight, Check, Gem, ListChecks, MessagesSquare } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Skeleton } from "@/components/ui/skeleton";
import { storeFaqs } from "../content/store-content";
import { useStorefrontCatalog } from "../hooks/use-storefront-catalog";
import { getRelatedProducts, isProductPublic } from "../selectors/storefront-products";
import { ProductAvailability } from "./product-availability";
import { ProductDetailTabs } from "./product-detail-tabs";
import { ProductGallery } from "./product-gallery";
import { ProductGrid } from "./product-grid";
import { ProductPrice } from "./product-price";
import { ProductPurchasePanel } from "./product-purchase-panel";
import { ProductReviews } from "./product-reviews";
import { StoreBreadcrumb } from "./store-breadcrumb";
import { StoreFaq } from "./store-faq";
import { StoreTrustStrip } from "./store-trust-strip";

function DetailSkeleton() {
  return (
    <Container className="max-w-[1440px] py-8">
      <Skeleton className="h-4 w-64" />
      <div className="mt-6 grid gap-8 lg:grid-cols-2">
        <Skeleton className="aspect-square w-full rounded-2xl" />
        <div className="space-y-4">
          <Skeleton className="h-9 w-3/4" />
          <Skeleton className="h-5 w-full" />
          <Skeleton className="h-10 w-40" />
        </div>
      </div>
    </Container>
  );
}

export function ProductDetailView({ slug }: { slug: string }) {
  const { ready, allProducts, allCategories, products, categories } = useStorefrontCatalog();
  const product = allProducts.find((item) => item.slug === slug);

  if (!product || !isProductPublic(product, allCategories)) {
    if (!ready) return <DetailSkeleton />;
    notFound();
  }

  const category = categories.find((item) => item.id === product.categoryId);
  const details = product.details;
  const configuredSpecs = details?.specifications ?? [];
  const specifications = configuredSpecs.length ? [...configuredSpecs, ...(category ? [{ label: "Category", value: category.name }] : [])] : [];
  const related = getRelatedProducts(product, products, 4);

  return (
    <main className="text-foreground">
      <Container className="max-w-[1440px] py-5 sm:py-6">
        <StoreBreadcrumb
          items={[
            { label: "Shop", href: "/shop" },
            ...(category ? [{ label: category.name, href: `/shop/category/${category.slug}` }] : []),
            { label: product.name },
          ]}
        />

        <div className="mt-5 grid gap-8 lg:grid-cols-2 lg:gap-12">
          <ProductGallery key={product.id} media={product.media} name={product.name} featured={Boolean(product.featured)} />

          <div>
            {category ? (
              <Link href={`/shop/category/${category.slug}`} className="text-xs font-semibold uppercase tracking-wider text-conversion-600 hover:underline dark:text-conversion-500">
                {category.name}
              </Link>
            ) : null}
            <h1 className="mt-2 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">{product.name}</h1>
            <p className="mt-3 text-base leading-7 text-muted-foreground">{product.shortDescription}</p>

            <div className="mt-5 flex flex-wrap items-center gap-x-4 gap-y-2">
              <ProductPrice product={product} size="lg" />
              <ProductAvailability product={product} className="text-sm" />
            </div>

            <div className="mt-6 border-t border-border pt-6">
              <ProductPurchasePanel product={product} />
            </div>

            {details?.highlights?.length ? (
              <section aria-labelledby="product-highlights" className="mt-6 rounded-xl border border-border bg-surface p-5">
                <h2 id="product-highlights" className="flex items-center gap-2 font-display text-xl font-semibold text-foreground">
                  <Gem className="size-5 text-gold-500" aria-hidden="true" />
                  Product highlights
                </h2>
                <ul className="mt-3 space-y-2.5">
                  {details.highlights.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-6 text-muted-foreground">
                      <Check className="mt-1 size-4 shrink-0 text-gold-500" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            ) : null}

            <ul className="mt-5 space-y-2.5 text-sm text-muted-foreground">
              <li className="flex items-start gap-3">
                <ListChecks className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />
                Specifications appear only where they are known.
              </li>
              {details?.careInstructions?.length ? (
                <li className="flex items-start gap-3">
                  <Check className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />
                  Care guidance is included below.
                </li>
              ) : null}
              <li className="flex items-start gap-3">
                <MessagesSquare className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />
                <span>
                  Need help choosing?{" "}
                  <Link href="/astrologers" className="font-semibold text-foreground underline underline-offset-2">
                    Talk to an astrologer →
                  </Link>
                </span>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 sm:mt-12">
          <StoreTrustStrip />
        </div>

        <div className="mt-10 sm:mt-12">
          <ProductDetailTabs product={product} specifications={specifications} supportingImage={product.media[1]} />
        </div>

        <div className="mt-10 space-y-10 pb-14 sm:mt-12 sm:space-y-12">
          <ProductReviews product={product} />

          {related.length ? (
            <section aria-labelledby="related-products">
              <div className="flex items-end justify-between gap-4">
                <h2 id="related-products" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
                  You may also like
                </h2>
                <Link href="/shop/search" className="flex shrink-0 items-center gap-1 text-sm font-semibold text-conversion-600 hover:underline dark:text-conversion-500">
                  View all products <ArrowRight className="size-4" aria-hidden="true" />
                </Link>
              </div>
              <ProductGrid products={related} categories={categories} className="mt-5" />
            </section>
          ) : null}

          <StoreFaq items={details?.faq?.length ? details.faq : storeFaqs} />
        </div>
      </Container>
    </main>
  );
}
