"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, PackagePlus, Pencil, RotateCcw, Search, Trash2 } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCategoryRepository } from "@/features/store/hooks/use-category-repository";
import { useProductRepository } from "@/features/store/hooks/use-product-repository";
import { formatStorePrice, getProductCatalogStatusLabel, getProductManagementStatusLabel, getProductPrimaryImage } from "@/features/store/selectors/store-domain";
import type { StoreProduct } from "@/features/store/types/store";
import { StoreProductMobileCard } from "./store-product-mobile-card";
import { AdminCatalogEmptyState } from "./shared/admin-catalog-empty-state";
import { AdminDataTable, AdminDataTableColumnVisibility } from "./shared/admin-data-table";
import { AdminDataTableColumnHeader } from "./shared/admin-data-table-column-header";

type CatalogStatusFilter = "all" | "available" | "coming-soon";

export function AdminStoreProductsView() {
  const { records: products, remove } = useProductRepository();
  const { records: categories } = useCategoryRepository();
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<CatalogStatusFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<StoreProduct | null>(null);

  const hasActiveFilters = search.trim() !== "" || statusFilter !== "all";

  const filtered = useMemo(() => {
    const q = search.toLowerCase();
    return products.filter((p) => {
      const matchesStatus = statusFilter === "all" || p.catalogStatus === statusFilter;
      const matchesSearch = !q || p.name.toLowerCase().includes(q) || p.slug.toLowerCase().includes(q);
      return matchesStatus && matchesSearch;
    });
  }, [products, search, statusFilter]);

  const columns = useMemo<ColumnDef<StoreProduct>[]>(
    () => [
      {
        accessorKey: "name",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Product" />,
        enableHiding: false,
        cell: ({ row }) => {
          const image = getProductPrimaryImage(row.original);
          return (
            <div className="flex min-w-52 items-center gap-3">
              <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-xs text-muted-foreground">
                {image ? (
                  <img src={image.src} alt={image.alt || row.original.name} className="size-full object-cover" />
                ) : "—"}
              </div>
              <div className="min-w-0">
                <p className="truncate font-medium">{row.original.name}</p>
                <p className="truncate text-xs text-muted-foreground">{row.original.slug}</p>
              </div>
            </div>
          );
        },
      },
      {
        id: "category",
        accessorFn: (row) => categories.find((c) => c.id === row.categoryId)?.name ?? "",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Category" />,
        cell: ({ row }) => {
          const cat = categories.find((c) => c.id === row.original.categoryId);
          return <span className="text-sm">{cat?.name ?? "—"}</span>;
        },
      },
      {
        id: "price",
        accessorFn: (row) => row.pricing.priceInPaise ?? 0,
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Price" />,
        cell: ({ row }) => (
          <span className="whitespace-nowrap text-sm">
            {formatStorePrice(row.original.pricing.priceInPaise)}
          </span>
        ),
      },
      {
        id: "inventory",
        accessorFn: (row) => row.inventory?.stockQuantity ?? -1,
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Inventory" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {row.original.inventory?.trackInventory
              ? (row.original.inventory.stockQuantity ?? "—")
              : "Not tracked"}
          </span>
        ),
      },
      {
        id: "status",
        accessorFn: (row) => row.catalogStatus ?? "",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Status" />,
        cell: ({ row }) => (
          <Badge variant={row.original.catalogStatus === "available" ? "online" : "pending"}>
            {getProductCatalogStatusLabel(row.original.catalogStatus)}
          </Badge>
        ),
      },
      {
        id: "managementStatus",
        accessorFn: (row) => row.managementStatus ?? "",
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Management" />,
        cell: ({ row }) => (
          <span className="text-sm text-muted-foreground">
            {getProductManagementStatusLabel(row.original.managementStatus)}
          </span>
        ),
      },
      {
        id: "featured",
        accessorFn: (row) => (row.featured ? 1 : 0),
        header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Featured" />,
        cell: ({ row }) => <span className="text-sm">{row.original.featured ? "Yes" : "—"}</span>,
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
              href={`/admin/store/products/${row.original.slug}`}
              aria-label={`View ${row.original.name}`}
            >
              <Eye className="size-4" aria-hidden="true" />
            </Link>
            <Link
              className="inline-flex size-8 items-center justify-center rounded-[calc(var(--radius)-2px)] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
              href={`/admin/store/products/${row.original.slug}/edit`}
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
    [categories],
  );

  function clearFilters() {
    setSearch("");
    setStatusFilter("all");
  }

  const resultLabel = hasActiveFilters
    ? `${filtered.length} of ${products.length}`
    : `${products.length} products`;

  if (!products.length) {
    return (
      <section className="space-y-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex min-w-0 items-center gap-3">
            
            <h1 className="truncate font-sans text-xl font-semibold tracking-tight text-foreground">Products</h1>
          </div>
          <Link href="/admin/store/products/new" className={buttonVariants({ variant: "conversion", size: "sm" })}>
            <PackagePlus aria-hidden="true" />New Product
          </Link>
        </div>
        <AdminCatalogEmptyState
          icon={PackagePlus}
          title="No products yet"
          description="Create your first product to start building the Store catalog."
          action={
            <Link href="/admin/store/products/new" className={buttonVariants({ variant: "conversion", size: "sm" })}>
              New Product
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
          
          <h1 className="truncate font-sans text-xl font-semibold tracking-tight text-foreground">Products</h1>
          <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">{resultLabel}</span>
        </div>
        <Link href="/admin/store/products/new" className={buttonVariants({ variant: "conversion", size: "sm" })}>
          <PackagePlus aria-hidden="true" />
          New Product
        </Link>
      </div>

      <div className="hidden md:block">
        <AdminDataTable
          columns={columns}
          data={filtered}
          initialColumnVisibility={{ managementStatus: false, featured: false }}
          toolbar={(table) => (
            <div className="grid gap-3 xl:grid-cols-[minmax(18.75rem,22.5rem)_1fr] xl:items-center">
              <div className="relative w-full">
                <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                <Input
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search products…"
                  className="h-10 pl-9"
                  aria-label="Search products"
                />
              </div>
              <div className="flex flex-row flex-wrap items-center gap-3 xl:flex-nowrap xl:justify-end">
                <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CatalogStatusFilter)}>
                  <SelectTrigger className="h-10 min-w-40" aria-label="Filter by catalog status">
                    <SelectValue placeholder="All statuses" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All statuses</SelectItem>
                    <SelectItem value="available">Available</SelectItem>
                    <SelectItem value="coming-soon">Coming soon</SelectItem>
                  </SelectContent>
                </Select>
                <AdminDataTableColumnVisibility table={table} />
                {hasActiveFilters && (
                  <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10">
                    <RotateCcw aria-hidden="true" />
                    Clear filters
                  </Button>
                )}
              </div>
            </div>
          )}
          emptyState={
            <div className="flex flex-col items-center gap-3">
              <p className="text-sm text-muted-foreground">No products match these filters.</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
              )}
            </div>
          }
        />
      </div>

      <div className="space-y-4 md:hidden">
        <Card className="shadow-sm">
          <CardContent className="space-y-3 p-4">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
              <Input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search products…"
                className="h-10 pl-9"
                aria-label="Search products"
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select value={statusFilter} onValueChange={(v) => setStatusFilter(v as CatalogStatusFilter)}>
                <SelectTrigger className="h-10" aria-label="Filter by catalog status">
                  <SelectValue placeholder="All statuses" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All statuses</SelectItem>
                  <SelectItem value="available">Available</SelectItem>
                  <SelectItem value="coming-soon">Coming soon</SelectItem>
                </SelectContent>
              </Select>
            </div>
            {hasActiveFilters && (
              <Button variant="ghost" size="sm" onClick={clearFilters}>
                <RotateCcw aria-hidden="true" />
                Clear filters
              </Button>
            )}
          </CardContent>
        </Card>
        {filtered.length > 0 ? (
          filtered.map((product) => {
            const cat = categories.find((c) => c.id === product.categoryId);
            return (
              <StoreProductMobileCard
                key={product.id}
                product={product}
                categoryName={cat?.name}
                onDelete={setDeleteTarget}
              />
            );
          })
        ) : (
          <Card className="shadow-sm">
            <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
              <p className="text-sm text-muted-foreground">No products match these filters.</p>
              {hasActiveFilters && (
                <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button>
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
              This product will be permanently removed from your local catalog. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
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
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </section>
  );
}
