import type { StoreProduct } from "@/features/store/types/store";
import { cn } from "@/lib/utils";
import { formatProductPrice } from "../selectors/storefront-products";

export function ProductPrice({
  product,
  className,
  size = "md",
}: {
  product: StoreProduct;
  className?: string;
  size?: "md" | "lg";
}) {
  const price = formatProductPrice(product);
  if (!price) {
    return <span className={cn("text-sm font-medium text-muted-foreground", className)}>Price on request</span>;
  }
  return (
    <span
      className={cn(
        "font-semibold tabular-nums text-foreground",
        size === "lg" ? "text-3xl tracking-tight" : "text-base",
        className,
      )}
    >
      {price}
    </span>
  );
}
