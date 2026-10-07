"use client";

import { notFound } from "next/navigation";
import { useProductRepository } from "@/features/store/hooks/use-product-repository";
import { AdminStoreProductEditor } from "./admin-store-product-editor";

export function AdminStoreProductEditView({ slug }: { slug: string }) {
  const { records, ready } = useProductRepository();

  if (!ready) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const product = records.find((p) => p.slug === slug);
  if (!product) notFound();

  return <AdminStoreProductEditor product={product} />;
}
