"use client";

import Link from "next/link";
import { Eye, MoreHorizontal, Package, Pencil, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { formatStorePrice, getProductCatalogStatusLabel, getProductPrimaryImage } from "@/features/store/selectors/store-domain";
import type { StoreProduct } from "@/features/store/types/store";

export function StoreProductMobileCard({
  product,
  categoryName,
  onDelete,
}: {
  product: StoreProduct;
  categoryName?: string;
  onDelete: (product: StoreProduct) => void;
}) {
  const image = getProductPrimaryImage(product);

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-muted-foreground">
              {image ? (
                <img src={image.src} alt={image.alt || product.name} className="size-full object-cover" />
              ) : (
                <Package className="size-4" aria-hidden="true" />
              )}
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{product.name}</p>
              <p className="truncate text-xs text-muted-foreground">{categoryName ?? "Uncategorized"}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 shrink-0 p-0" aria-label={`Actions for ${product.name}`}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/store/products/${product.slug}`}>
                  <Eye aria-hidden="true" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/store/products/${product.slug}/edit`}>
                  <Pencil aria-hidden="true" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(product)}>
                <Trash2 aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm font-medium">{formatStorePrice(product.pricing.priceInPaise)}</p>
          <Badge variant={product.catalogStatus === "available" ? "online" : "pending"}>
            {getProductCatalogStatusLabel(product.catalogStatus)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
