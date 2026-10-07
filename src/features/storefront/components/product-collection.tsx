"use client";

import { useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { SlidersHorizontal, Star } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetContent, SheetFooter, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { ProductCategory, StoreProduct } from "@/features/store/types/store";
import { cn } from "@/lib/utils";
import {
  countActiveFilters,
  emptyStoreFilters,
  filterProducts,
  getPriceBoundsInRupees,
  getProductAvailability,
  hasAnyFilter,
  sortProducts,
  storeSortOptions,
  type StoreFilters,
  type StoreSort,
} from "../selectors/storefront-products";
import { ProductGrid } from "./product-grid";

export type CollectionChip = { label: string; href: string; active: boolean };

const availabilityLabels = { available: "Available", "coming-soon": "Coming soon" } as const;

const toNumber = (value: string) => {
  if (value.trim() === "") return undefined;
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : undefined;
};

const chipBase =
  "inline-flex h-9 shrink-0 items-center gap-1.5 rounded-full border px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring";
const chipActive = "border-conversion-500 bg-conversion-500 text-white dark:text-midnight-950";
const chipIdle = "border-border bg-surface text-foreground hover:border-gold-500/60";

export function ProductCollection({
  products,
  categories,
  emptyState,
  chips,
}: {
  products: StoreProduct[];
  categories: ProductCategory[];
  emptyState: ReactNode;
  chips?: CollectionChip[];
}) {
  const [sort, setSort] = useState<StoreSort>("featured");
  const [filters, setFilters] = useState<StoreFilters>(emptyStoreFilters);
  const [open, setOpen] = useState(false);

  const bounds = useMemo(() => getPriceBoundsInRupees(products), [products]);
  const availabilityOptions = useMemo(() => {
    const present = new Set(products.map((product) => product.catalogStatus));
    return (["available", "coming-soon"] as const).filter((status) => present.has(status));
  }, [products]);
  const purchasableCount = useMemo(() => products.filter((p) => getProductAvailability(p).purchasable).length, [products]);
  const featuredCount = useMemo(() => products.filter((p) => p.featured).length, [products]);

  const showAvailability = availabilityOptions.length > 1;
  const showPrice = bounds !== null && bounds.min !== bounds.max;
  const hasSheetFilters = showAvailability || showPrice;
  const showInStockChip = purchasableCount > 0 && purchasableCount < products.length;
  const showFeaturedChip = featuredCount > 0 && featuredCount < products.length;

  const visible = useMemo(() => sortProducts(filterProducts(products, filters), sort), [products, filters, sort]);
  const activeCount = countActiveFilters(filters);
  const clearAll = () => setFilters(emptyStoreFilters);

  if (products.length === 0) return <>{emptyState}</>;

  const toggle = (key: "inStockOnly" | "featuredOnly") => setFilters((current) => ({ ...current, [key]: !current[key] }));

  return (
    <div>
      {chips?.length || showInStockChip || showFeaturedChip ? (
        <div className="no-scrollbar -mx-4 flex items-center gap-2 overflow-x-auto px-4 pb-4 sm:mx-0 sm:px-0" role="group" aria-label="Quick navigation and filters">
          {chips?.map((chip) => (
            <Link key={chip.href} href={chip.href} aria-current={chip.active ? "page" : undefined} className={cn(chipBase, chip.active ? chipActive : chipIdle)}>
              {chip.label}
            </Link>
          ))}
          {chips?.length && (showInStockChip || showFeaturedChip) ? <span className="mx-1 h-5 w-px shrink-0 bg-border" aria-hidden="true" /> : null}
          {showInStockChip ? (
            <button type="button" aria-pressed={Boolean(filters.inStockOnly)} onClick={() => toggle("inStockOnly")} className={cn(chipBase, filters.inStockOnly ? "border-conversion-500 bg-conversion-500/10" : chipIdle)}>
              <span className="size-2 rounded-full bg-emerald-500" aria-hidden="true" /> In stock
            </button>
          ) : null}
          {showFeaturedChip ? (
            <button type="button" aria-pressed={Boolean(filters.featuredOnly)} onClick={() => toggle("featuredOnly")} className={cn(chipBase, filters.featuredOnly ? "border-conversion-500 bg-conversion-500/10" : chipIdle)}>
              <Star className="size-3.5 text-gold-500" aria-hidden="true" /> Featured
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
        <p className="text-sm text-muted-foreground" aria-live="polite">
          <span className="font-semibold text-foreground">{visible.length}</span> {visible.length === 1 ? "product" : "products"}
        </p>
        <div className="flex items-center gap-2">
          {hasSheetFilters ? (
            <Sheet open={open} onOpenChange={setOpen}>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className="h-10 gap-2 bg-surface">
                  <SlidersHorizontal aria-hidden="true" />
                  Filters
                  {activeCount > 0 ? (
                    <span className="grid size-5 place-items-center rounded-full bg-conversion-500 text-[11px] font-semibold text-white dark:text-midnight-950">
                      {activeCount}
                    </span>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-sm">
                <SheetHeader className="border-b border-border p-4">
                  <SheetTitle className="text-base">Filters</SheetTitle>
                </SheetHeader>
                <div className="flex-1 space-y-6 overflow-y-auto p-4">
                  {showAvailability ? (
                    <fieldset>
                      <legend className="text-sm font-semibold text-foreground">Availability</legend>
                      <div className="mt-2 flex flex-wrap gap-2">
                        {(["all", ...availabilityOptions] as const).map((option) => {
                          const selected = filters.availability === option;
                          return (
                            <button
                              key={option}
                              type="button"
                              aria-pressed={selected}
                              onClick={() => setFilters((current) => ({ ...current, availability: option }))}
                              className={cn("rounded-full border px-3 py-1.5 text-sm transition-colors", selected ? "border-conversion-500 bg-conversion-500/10 font-semibold text-foreground" : "border-border text-muted-foreground hover:text-foreground")}
                            >
                              {option === "all" ? "All" : availabilityLabels[option]}
                            </button>
                          );
                        })}
                      </div>
                    </fieldset>
                  ) : null}
                  {showPrice && bounds ? (
                    <fieldset>
                      <legend className="text-sm font-semibold text-foreground">Price (₹)</legend>
                      <div className="mt-2 grid grid-cols-2 gap-3">
                        <div className="grid gap-1.5">
                          <Label htmlFor="filter-min" className="text-xs text-muted-foreground">Min</Label>
                          <Input id="filter-min" type="number" inputMode="numeric" min={0} placeholder={String(bounds.min)} value={filters.minPrice ?? ""} onChange={(event) => setFilters((current) => ({ ...current, minPrice: toNumber(event.target.value) }))} />
                        </div>
                        <div className="grid gap-1.5">
                          <Label htmlFor="filter-max" className="text-xs text-muted-foreground">Max</Label>
                          <Input id="filter-max" type="number" inputMode="numeric" min={0} placeholder={String(bounds.max)} value={filters.maxPrice ?? ""} onChange={(event) => setFilters((current) => ({ ...current, maxPrice: toNumber(event.target.value) }))} />
                        </div>
                      </div>
                    </fieldset>
                  ) : null}
                </div>
                <SheetFooter className="flex-row gap-2 border-t border-border p-4">
                  <Button variant="outline" className="flex-1" onClick={clearAll} disabled={!hasAnyFilter(filters)}>
                    Clear
                  </Button>
                  <Button variant="conversion" className="flex-1" onClick={() => setOpen(false)}>
                    Show {visible.length} {visible.length === 1 ? "product" : "products"}
                  </Button>
                </SheetFooter>
              </SheetContent>
            </Sheet>
          ) : null}

          <Select value={sort} onValueChange={(value) => setSort(value as StoreSort)}>
            <SelectTrigger className="h-10 w-44 bg-surface sm:w-48" aria-label="Sort products">
              <SelectValue>{storeSortOptions.find((option) => option.value === sort)?.label}</SelectValue>
            </SelectTrigger>
            <SelectContent>
              {storeSortOptions.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="pt-5">
        {visible.length ? (
          <ProductGrid products={visible} categories={categories} className="gap-3 sm:gap-4" />
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-12 text-center">
            <p className="text-base font-medium text-foreground">No products match these filters.</p>
            <div className="mt-5 flex flex-wrap justify-center gap-3">
              <Button variant="conversion" onClick={clearAll}>
                Clear filters
              </Button>
              <Button asChild variant="outline" className="bg-surface">
                <Link href="/shop/search">Browse all products</Link>
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export function CollectionEmptyState({
  message,
  actions,
}: {
  message: string;
  actions?: Array<{ label: string; href: string; primary?: boolean }>;
}) {
  const items = actions ?? [{ label: "Browse all products", href: "/shop/search", primary: true }];
  return (
    <div className="rounded-xl border border-dashed border-border bg-surface px-6 py-14 text-center">
      <p className="text-base font-medium text-foreground">{message}</p>
      <div className="mt-5 flex flex-wrap justify-center gap-3">
        {items.map((action) => (
          <Button key={action.label} asChild variant={action.primary ? "conversion" : "outline"} className={action.primary ? undefined : "bg-surface"}>
            <Link href={action.href}>{action.label}</Link>
          </Button>
        ))}
      </div>
    </div>
  );
}
