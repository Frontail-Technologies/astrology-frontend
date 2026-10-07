import type { ProductCategory, StoreProduct } from "@/features/store/types/store";
import { cn } from "@/lib/utils";
import { ProductCard } from "./product-card";

export function ProductGrid({
  products,
  categories,
  className,
}: {
  products: StoreProduct[];
  categories: ProductCategory[];
  className?: string;
}) {
  return (
    <ul className={cn("grid grid-cols-2 gap-3 sm:gap-4 md:grid-cols-3 xl:grid-cols-4", className)}>
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard product={product} categoryName={categories.find((c) => c.id === product.categoryId)?.name} />
        </li>
      ))}
    </ul>
  );
}
