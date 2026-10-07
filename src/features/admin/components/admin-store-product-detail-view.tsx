"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCategoryRepository } from "@/features/store/hooks/use-category-repository";
import { useProductRepository } from "@/features/store/hooks/use-product-repository";
import { formatStorePrice, getProductCatalogStatusLabel } from "@/features/store/selectors/store-domain";

export function AdminStoreProductDetailView({ slug }: { slug: string }) {
  const { records: products, ready } = useProductRepository();
  const { records: categories } = useCategoryRepository();

  if (!ready) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const product = products.find((p) => p.slug === slug);
  if (!product) notFound();

  const category = categories.find((c) => c.id === product.categoryId);
  const image = product.media[0];

  return (
    <section className="max-w-4xl space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          
          <div>
            <Link
              href="/admin/store/products"
              className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3" aria-hidden="true" />
              Products
            </Link>
            <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">
              {product.name}
            </h1>
            <p className="text-sm text-muted-foreground">{category?.name ?? "Uncategorized"}</p>
          </div>
        </div>
        <Link
          href={`/admin/store/products/${product.slug}/edit`}
          className={buttonVariants({ variant: "conversion", size: "sm" })}
        >
          Edit Product
        </Link>
      </header>

      <Card className="shadow-sm">
        <CardContent className="grid gap-5 p-5 sm:grid-cols-[14rem_1fr]">
          {image ? (
            <img
              src={image.src}
              alt={image.alt || product.name}
              className="aspect-square w-full rounded-lg object-cover"
            />
          ) : (
            <div className="aspect-square rounded-lg bg-muted" />
          )}
          <div className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">{product.shortDescription}</p>
            {product.description && (
              <p className="text-sm leading-6 text-foreground/80">{product.description}</p>
            )}
            <dl className="grid gap-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Price</dt>
                <dd className="font-medium">{formatStorePrice(product.pricing.priceInPaise)}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Catalog status</dt>
                <dd>
                  <Badge variant={product.catalogStatus === "available" ? "online" : "pending"}>
                    {getProductCatalogStatusLabel(product.catalogStatus)}
                  </Badge>
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Inventory</dt>
                <dd>
                  {product.inventory?.trackInventory
                    ? (product.inventory.stockQuantity ?? "—")
                    : "Not tracked"}
                </dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Featured</dt>
                <dd>{product.featured ? "Yes" : "No"}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href="/admin/store/products" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Back to Products
        </Link>
        <Link
          href="/admin/store"
          className={buttonVariants({ variant: "ghost", size: "sm" })}
        >
          Store overview
        </Link>
      </div>
    </section>
  );
}
