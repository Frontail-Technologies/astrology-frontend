import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { ProductCategory } from "@/features/store/types/store";
import { StoreImage } from "./store-image";

/** Horizontal card, deliberately different from ProductCard. */
export function StoreCategoryCard({ category, productCount }: { category: ProductCategory; productCount: number }) {
  return (
    <Link
      href={`/shop/category/${category.slug}`}
      className="group grid h-full min-h-[148px] grid-cols-[40%_1fr] overflow-hidden rounded-xl border border-border bg-surface transition-colors hover:border-gold-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="overflow-hidden bg-gradient-to-br from-surface-muted to-gold-300/20">
        <StoreImage
          src={category.imageSrc}
          alt=""
          className="size-full p-3 transition-transform duration-300 group-hover:scale-105"
        />
      </div>
      <div className="flex flex-col justify-center gap-1 p-4">
        <h3 className="font-display text-xl font-semibold leading-6 text-foreground">{category.name}</h3>
        {category.description ? (
          <p className="line-clamp-2 text-sm leading-5 text-muted-foreground">{category.description}</p>
        ) : null}
        <span className="mt-2 flex items-center gap-1 text-sm font-semibold text-conversion-600 dark:text-conversion-500">
          View collection
          <ArrowRight className="size-4 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </span>
        <span className="text-xs text-muted-foreground">
          {productCount} {productCount === 1 ? "product" : "products"}
        </span>
      </div>
    </Link>
  );
}
