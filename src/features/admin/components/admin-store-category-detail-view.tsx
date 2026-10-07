"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useCategoryRepository } from "@/features/store/hooks/use-category-repository";
import { useProductRepository } from "@/features/store/hooks/use-product-repository";
import { getProductManagementStatusLabel } from "@/features/store/selectors/store-domain";

export function AdminStoreCategoryDetailView({ slug }: { slug: string }) {
  const { records: categories, ready } = useCategoryRepository();
  const { records: products } = useProductRepository();

  if (!ready) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const category = categories.find((c) => c.slug === slug);
  if (!category) notFound();

  const productCount = products.filter((p) => p.categoryId === category.id).length;

  return (
    <section className="max-w-3xl space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          
          <div>
            <Link
              href="/admin/store/categories"
              className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3" aria-hidden="true" />
              Categories
            </Link>
            <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">
              {category.name}
            </h1>
            <p className="text-sm text-muted-foreground">{category.slug}</p>
          </div>
        </div>
        <Link
          href={`/admin/store/categories/${category.slug}/edit`}
          className={buttonVariants({ variant: "conversion", size: "sm" })}
        >
          Edit Category
        </Link>
      </header>

      <Card className="shadow-sm">
        <CardContent className="grid gap-5 p-5 sm:grid-cols-[12rem_1fr]">
          {category.imageSrc ? (
            <img
              src={category.imageSrc}
              alt=""
              className="aspect-square w-full rounded-lg object-cover"
            />
          ) : (
            <div className="aspect-square rounded-lg bg-muted" />
          )}
          <div className="space-y-4">
            <p className="text-sm leading-6 text-muted-foreground">{category.description ?? "—"}</p>
            <dl className="grid gap-2 border-t border-border pt-4 text-sm">
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Products</dt>
                <dd className="font-medium">{productCount}</dd>
              </div>
              <div className="flex justify-between gap-4">
                <dt className="text-muted-foreground">Management status</dt>
                <dd>{getProductManagementStatusLabel(category.managementStatus)}</dd>
              </div>
            </dl>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href="/admin/store/categories" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Back to Categories
        </Link>
        <Link href="/admin/store" className={buttonVariants({ variant: "ghost", size: "sm" })}>
          Store overview
        </Link>
      </div>
    </section>
  );
}
