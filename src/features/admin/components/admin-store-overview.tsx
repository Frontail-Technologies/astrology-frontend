"use client";

import Link from "next/link";
import { AlertTriangle, Boxes, PackagePlus, Star, Tags } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useCategoryRepository } from "@/features/store/hooks/use-category-repository";
import { useProductRepository } from "@/features/store/hooks/use-product-repository";
import { formatStorePrice, getProductCategory, getProductPrimaryImage, isLowStock, LOW_STOCK_THRESHOLD } from "@/features/store/selectors/store-domain";

export function AdminStoreOverview() {
  const { records: products } = useProductRepository();
  const { records: categories } = useCategoryRepository();

  const featuredCount = products.filter((p) => p.featured).length;
  const lowStockProducts = products.filter(isLowStock);

  const recentProducts = [...products]
    .sort((a, b) => a.name.localeCompare(b.name))
    .slice(0, 5);

  const categoryDistribution = categories.map((c) => ({
    category: c,
    count: products.filter((p) => p.categoryId === c.id).length,
  }));

  return (
    <section className="max-w-[1240px] space-y-4">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          
          <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">Store</h1>
        </div>
        <div className="flex gap-2">
          <Link
            href="/admin/store/categories/new"
            className={buttonVariants({ variant: "outline", size: "sm" })}
          >
            <Tags aria-hidden="true" />
            New Category
          </Link>
          <Link
            href="/admin/store/products/new"
            className={buttonVariants({ variant: "conversion", size: "sm" })}
          >
            <PackagePlus aria-hidden="true" />
            New Product
          </Link>
        </div>
      </header>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          {
            label: "Products",
            value: products.length,
            href: "/admin/store/products",
            icon: Boxes,
          },
          {
            label: "Categories",
            value: categories.length,
            href: "/admin/store/categories",
            icon: Tags,
          },
          {
            label: "Featured",
            value: featuredCount,
            href: "/admin/store/products",
            icon: Star,
          },
          {
            label: "Low stock",
            value: lowStockProducts.length,
            href: "/admin/store/products",
            icon: AlertTriangle,
            warn: lowStockProducts.length > 0,
          },
        ].map((stat) => (
          <Card key={stat.label} className="shadow-sm">
            <CardContent className="p-5">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`grid size-8 place-items-center rounded-md ${stat.warn ? "bg-warning/10 text-warning" : "bg-accent text-sidebar-primary"}`}
                  >
                    <stat.icon className="size-4" aria-hidden="true" />
                  </span>
                  <p className="text-sm text-muted-foreground">{stat.label}</p>
                </div>
                <Link
                  href={stat.href}
                  className="text-xs text-sidebar-primary hover:underline underline-offset-2"
                >
                  View →
                </Link>
              </div>
              <p className={`mt-3 text-3xl font-semibold ${stat.warn ? "text-warning" : "text-foreground"}`}>
                {stat.value}
              </p>
              {stat.warn && (
                <p className="mt-1 text-xs text-muted-foreground">≤{LOW_STOCK_THRESHOLD} units</p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_280px]">
        <Card className="shadow-sm">
          <CardHeader className="flex flex-row items-center justify-between px-5 pb-0 pt-5">
            <CardTitle className="font-sans text-base">Recent products</CardTitle>
            <Link
              href="/admin/store/products"
              className="text-xs text-sidebar-primary hover:underline underline-offset-2"
            >
              View all →
            </Link>
          </CardHeader>
          <CardContent className="px-5 pb-2">
            {recentProducts.length === 0 ? (
              <p className="py-4 text-sm text-muted-foreground">No products yet.</p>
            ) : (
              <div className="divide-y divide-border">
                {recentProducts.map((product) => {
                  const image = getProductPrimaryImage(product);
                  const category = getProductCategory(product, categories);
                  return (
                    <div key={product.id} className="flex items-center gap-3 py-3">
                      <div className="grid size-9 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-xs text-muted-foreground">
                        {image ? (
                          <img src={image.src} alt="" className="size-full object-cover" />
                        ) : (
                          <Boxes className="size-4" aria-hidden="true" />
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium">{product.name}</p>
                        <p className="text-xs text-muted-foreground">{category?.name ?? "Uncategorized"}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-medium">
                          {formatStorePrice(product.pricing.priceInPaise)}
                        </p>
                        {product.catalogStatus && (
                          <Badge
                            variant={product.catalogStatus === "available" ? "online" : "pending"}
                            className="text-[10px]"
                          >
                            {product.catalogStatus === "available" ? "Available" : "Coming soon"}
                          </Badge>
                        )}
                      </div>
                      <Link
                        href={`/admin/store/products/${product.slug}`}
                        className="ml-1 shrink-0 text-xs text-muted-foreground hover:text-foreground"
                        aria-label={`View ${product.name}`}
                      >
                        →
                      </Link>
                    </div>
                  );
                })}
              </div>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="px-5 pb-0 pt-5">
              <CardTitle className="font-sans text-base">By category</CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-2">
              {categoryDistribution.length === 0 ? (
                <p className="py-4 text-sm text-muted-foreground">No categories yet.</p>
              ) : (
                <div className="divide-y divide-border">
                  {categoryDistribution.map(({ category, count }) => (
                    <div key={category.id} className="flex items-center justify-between gap-2 py-2.5">
                      <p className="text-sm">{category.name}</p>
                      <span className="text-sm font-medium text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {lowStockProducts.length > 0 && (
            <Card className="border-warning/25 shadow-sm">
              <CardHeader className="px-5 pb-0 pt-5">
                <CardTitle className="flex items-center gap-2 font-sans text-sm text-warning">
                  <AlertTriangle className="size-4" aria-hidden="true" />
                  Low stock
                </CardTitle>
              </CardHeader>
              <CardContent className="px-5 pb-2">
                <div className="divide-y divide-border">
                  {lowStockProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between gap-2 py-2.5">
                      <Link
                        href={`/admin/store/products/${product.slug}`}
                        className="truncate text-sm font-medium underline-offset-2 hover:underline"
                      >
                        {product.name}
                      </Link>
                      <span className="shrink-0 text-sm font-semibold text-warning">
                        {product.inventory?.stockQuantity ?? 0} left
                      </span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </section>
  );
}
