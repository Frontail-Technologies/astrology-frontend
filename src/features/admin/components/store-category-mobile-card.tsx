"use client";

import Link from "next/link";
import { Eye, MoreHorizontal, Pencil, Tags, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getProductManagementStatusLabel } from "@/features/store/selectors/store-domain";
import type { ProductCategory } from "@/features/store/types/store";

export function StoreCategoryMobileCard({
  category,
  productCount,
  onDelete,
}: {
  category: ProductCategory;
  productCount: number;
  onDelete: (category: ProductCategory) => void;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            {category.imageSrc ? (
              <img src={category.imageSrc} alt="" className="size-10 shrink-0 rounded-md object-cover" />
            ) : (
              <span className="grid size-10 shrink-0 place-items-center rounded-md bg-muted">
                <Tags className="size-4 text-muted-foreground" aria-hidden="true" />
              </span>
            )}
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{category.name}</p>
              <p className="truncate text-xs text-muted-foreground">{category.slug}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 shrink-0 p-0" aria-label={`Actions for ${category.name}`}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/store/categories/${category.slug}`}>
                  <Eye aria-hidden="true" />
                  View
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/store/categories/${category.slug}/edit`}>
                  <Pencil aria-hidden="true" />
                  Edit
                </Link>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(category)}>
                <Trash2 aria-hidden="true" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            {productCount} {productCount === 1 ? "product" : "products"}
          </p>
          <p className="text-xs text-muted-foreground">
            {getProductManagementStatusLabel(category.managementStatus)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
