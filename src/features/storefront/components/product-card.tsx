import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { getProductPrimaryImage } from "@/features/store/selectors/store-domain";
import type { StoreProduct } from "@/features/store/types/store";
import { ProductAvailability } from "./product-availability";
import { ProductPrice } from "./product-price";
import { StoreImage } from "./store-image";

export function ProductCard({ product, categoryName }: { product: StoreProduct; categoryName?: string }) {
  const image = getProductPrimaryImage(product);

  return (
    <Link
      href={`/shop/product/${product.slug}`}
      className="group flex h-full flex-col overflow-hidden rounded-xl border border-border bg-surface transition-all hover:-translate-y-0.5 hover:border-gold-500/50 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
    >
      <div className="relative aspect-square overflow-hidden bg-gradient-to-b from-surface-muted to-gold-300/15">
        {product.featured ? (
          <span className="absolute left-3 top-3 z-10 rounded-full bg-gold-400 px-2.5 py-1 text-[11px] font-semibold text-midnight-950">
            Featured
          </span>
        ) : null}
        <StoreImage
          src={image?.src}
          alt={image?.alt ?? product.name}
          className="size-full p-5 transition-transform duration-300 group-hover:scale-[1.04]"
        />
      </div>
      <div className="flex flex-1 flex-col p-4">
        {categoryName ? (
          <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">{categoryName}</p>
        ) : null}
        <h3 className="mt-1 line-clamp-2 font-display text-lg font-semibold leading-6 text-foreground">{product.name}</h3>
        <div className="mt-2 flex flex-wrap items-center justify-between gap-x-3 gap-y-1">
          <ProductPrice product={product} className="text-xl" />
          <ProductAvailability product={product} />
        </div>
        <span className="mt-4 flex h-10 items-center justify-center gap-1.5 rounded-md bg-conversion-500 text-sm font-semibold text-white transition-colors group-hover:bg-conversion-600 dark:text-midnight-950">
          View details <ArrowRight className="size-4" aria-hidden="true" />
        </span>
      </div>
    </Link>
  );
}
