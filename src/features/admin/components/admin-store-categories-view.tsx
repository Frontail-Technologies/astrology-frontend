"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, Pencil, RotateCcw, Search, Tags, Trash2 } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { useCategoryRepository } from "@/features/store/hooks/use-category-repository";
import { useProductRepository } from "@/features/store/hooks/use-product-repository";
import { getProductManagementStatusLabel } from "@/features/store/selectors/store-domain";
import type { ProductCategory } from "@/features/store/types/store";
import { StoreCategoryMobileCard } from "./store-category-mobile-card";
import { AdminCatalogEmptyState } from "./shared/admin-catalog-empty-state";
import { AdminDataTable, AdminDataTableColumnVisibility } from "./shared/admin-data-table";
import { AdminDataTableColumnHeader } from "./shared/admin-data-table-column-header";

export function AdminStoreCategoriesView() {
  const { records: categories, remove } = useCategoryRepository();
  const { records: products } = useProductRepository();
  const [search, setSearch] = useState("");
  const [deleteTarget, setDeleteTarget] = useState<ProductCategory | null>(null);

  const hasActiveFilters = search.trim() !== "";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return categories.filter(
      (c) => !q || c.name.toLowerCase().includes(q) || c.slug.toLowerCase().includes(q),
    );
  }, [categories, search]);

  const getCount = (categoryId: string) => products.filter((p) => p.categoryId === categoryId).length;
  const isInUse = (categoryId: string) => getCount(categoryId) > 0;

  const columns = useMemo<ColumnDef<ProductCategory>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Category" />,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex min-w-52 items-center gap-3">
            {row.original.imageSrc ? (
              <img src={row.original.imageSrc} alt="" className="size-10 rounded-md object-cover" />
            ) : (
              <span className="grid size-10 place-items-center rounded-md bg-muted">
                <Tags className="size-4 text-muted-foreground" />
              </span>
            )}
            <div>
              <p className="font-medium">{row.original.name}</p>
              <p className="text-xs text-muted-foreground">{row.original.slug}</p>
            </div>
          </div>
        ),
      },
      {
        id: "products",
        accessorFn: (row) => getCount(row.id),
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Products" />,
        cell: ({ row }) => <span className="text-sm">{getCount(row.original.id)}</span>,
      },
      {
        id: "status",
        accessorFn: (row) => row.managementStatus ?? "",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Management" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {getProductManagementStatusLabel(row.original.managementStatus)}
          </span>
        ),
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex items-center justify-end gap-0.5">
            <Link
              className="inline-flex size-8 items-center justify-center rounded-[calc(var(--radius)-2px)] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              href={`/admin/store/categories/${row.original.slug}`}
              aria-label={`View ${row.original.name}`}
            >
              <Eye className="size-4" aria-hidden="true" />
            </Link>
            <Link
              className="inline-flex size-8 items-center justify-center rounded-[calc(var(--radius)-2px)] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              href={`/admin/store/categories/${row.original.slug}/edit`}
              aria-label={`Edit ${row.original.name}`}
            >
              <Pencil className="size-4" aria-hidden="true" />
            </Link>
            <Button
              variant="ghost"
              size="sm"
              className="size-8 p-0 text-muted-foreground hover:text-destructive"
              aria-label={`Delete ${row.original.name}`}
              onClick={() => setDeleteTarget(row.original)}
            >
              <Trash2 className="size-4" aria-hidden="true" />
            </Button>
          </div>
        ),
      },
    ],
    [products],
  );

  const inUse = deleteTarget ? isInUse(deleteTarget.id) : false;
  const inUseCount = deleteTarget ? getCount(deleteTarget.id) : 0;

  const resultLabel = hasActiveFilters
    ? `${filtered.length} of ${categories.length}`
    : `${categories.length} categories`;

  if (!categories.length) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            
            <h1 className="truncate font-sans text-xl font-semibold tracking-tight text-foreground">Categories</h1>
          </div>
          <Link href="/admin/store/categories/new" className={buttonVariants({ variant: "conversion", size: "sm" })}>
            <Tags aria-hidden="true" />New Category
          </Link>
        </div>
        <AdminCatalogEmptyState
          icon={Tags}
          title="No categories yet"
          description="Create categories to organize products in your Store."
          action={
            <Link href="/admin/store/categories/new" className={buttonVariants({ variant: "conversion", size: "sm" })}>
              New Category
            </Link>
          }
        />
      </section>
    );
  }

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          
          <h1 className="truncate font-sans text-xl font-semibold tracking-tight text-foreground">Categories</h1>
          <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">{resultLabel}</span>
        </div>
        <Link href="/admin/store/categories/new" className={buttonVariants({ variant: "conversion", size: "sm" })}>
          <Tags aria-hidden="true" />
          New Category
        </Link>
      </div>

      <div className="hidden md:block">
        <AdminDataTable
          columns={columns}
          data={filtered}
          toolbar={(table) => (
            <div className="grid gap-3 xl:grid-cols-[minmax(18.75rem,22.5rem)_1fr] xl:items-center">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search categories…"
                  className="h-10 pl-9"
                  aria-label="Search categories"
                />
              </div>
              <div className="flex flex-row flex-wrap items-center gap-3 xl:flex-nowrap xl:justify-end">
                <AdminDataTableColumnVisibility table={table} />
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={() => setSearch("")} className="h-10">
                    <RotateCcw aria-hidden="true" />
                    Clear
                  </Button>
                )}
              </div>
            </div>
          )}
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">No categories match your search.</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>Clear</Button>
              )}
            </div>
          }
        />
      </div>

      <div className="space-y-4 md:hidden">
        <Card className="shadow-sm">
          <CardContent className="p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search categories…"
                className="h-10 pl-9"
                aria-label="Search categories"
              />
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" className="mt-3" onClick={() => setSearch("")}>
                <RotateCcw aria-hidden="true" />
                Clear
              </Button>
            )}
          </CardContent>
        </Card>
        {filtered.length > 0 ? (
          filtered.map((category) => (
            <StoreCategoryMobileCard
              key={category.id}
              category={category}
              productCount={getCount(category.id)}
              onDelete={setDeleteTarget}
            />
          ))
        ) : (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">No categories match your search.</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={() => setSearch("")}>Clear</Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>

      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete &ldquo;{deleteTarget?.name}&rdquo;?</AlertDialogTitle>
            <AlertDialogDescription>
              {inUse
                ? `This category contains ${inUseCount} product${inUseCount === 1 ? "" : "s"}. Reassign or delete those products before removing this category.`
                : "This category will be permanently removed. This action cannot be undone."}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>{inUse ? "Close" : "Cancel"}</AlertDialogCancel>
            {!inUse && (
              <AlertDialogAction
                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                onClick={() => {
                  if (!deleteTarget) return;
                  remove(deleteTarget.id);
                  toast.success(`"${deleteTarget.name}" deleted`);
                  setDeleteTarget(null);
                }}
              >
                Delete
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
