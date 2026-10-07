"use client";

import { notFound } from "next/navigation";
import { useCategoryRepository } from "@/features/store/hooks/use-category-repository";
import { AdminStoreCategoryEditor } from "./admin-store-category-editor";

export function AdminStoreCategoryEditView({ slug }: { slug: string }) {
  const { records, ready } = useCategoryRepository();

  if (!ready) {
    return (
      <div className="flex h-40 items-center justify-center text-sm text-muted-foreground">
        Loading…
      </div>
    );
  }

  const category = records.find((c) => c.slug === slug);
  if (!category) notFound();

  return <AdminStoreCategoryEditor category={category} />;
}
