import type { StoreProduct } from "@/features/store/types/store";
import { cn } from "@/lib/utils";
import { getProductAvailability } from "../selectors/storefront-products";

const toneClasses = {
  positive: "text-emerald-700 dark:text-emerald-300",
  neutral: "text-muted-foreground",
  negative: "text-red-700 dark:text-red-300",
} as const;

const dotClasses = {
  positive: "bg-emerald-500",
  neutral: "bg-muted-foreground/60",
  negative: "bg-red-500",
} as const;

export function ProductAvailability({ product, className }: { product: StoreProduct; className?: string }) {
  const availability = getProductAvailability(product);
  return (
    <span className={cn("inline-flex items-center gap-1.5 text-xs font-medium", toneClasses[availability.tone], className)}>
      <span className={cn("size-1.5 rounded-full", dotClasses[availability.tone])} aria-hidden="true" />
      {availability.label}
    </span>
  );
}
