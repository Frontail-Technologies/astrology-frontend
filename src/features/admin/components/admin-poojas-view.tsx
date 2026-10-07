"use client";

import { useMemo, useState } from "react";
import { RotateCcw, Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { poojaCategories, poojas } from "@/features/pooja/data/poojas";
import type { PoojaCategory, PoojaDefinition } from "@/features/pooja/types/pooja";
import { PoojaDeleteDialog } from "./pooja-delete-dialog";
import { PoojaMobileCard } from "./pooja-mobile-card";
import { getPoojaTableColumns } from "./pooja-table-columns";
import { AdminDataTable, AdminDataTableColumnVisibility } from "./shared/admin-data-table";

type FeaturedFilter = "all" | "featured" | "not-featured";
type PoojaStatusFilter = "all" | PoojaDefinition["status"];

const statusOptions: Array<{ value: PoojaStatusFilter; label: string }> = [
  { value: "all", label: "All statuses" },
  { value: "available", label: "Available" },
  { value: "coming-soon", label: "Coming soon" },
];

const featuredOptions: Array<{ value: FeaturedFilter; label: string }> = [
  { value: "all", label: "All Poojas" },
  { value: "featured", label: "Featured" },
  { value: "not-featured", label: "Not featured" },
];

function matchesSearch(pooja: PoojaDefinition, query: string) {
  const searchable = [pooja.name, pooja.shortDescription, ...pooja.categories].join(" ").toLowerCase();
  return searchable.includes(query.toLowerCase());
}

export function AdminPoojasView() {
  const [search, setSearch] = useState("");
  const [category, setCategory] = useState<PoojaCategory | "all">("all");
  const [status, setStatus] = useState<PoojaStatusFilter>("all");
  const [featured, setFeatured] = useState<FeaturedFilter>("all");
  const [deleteTarget, setDeleteTarget] = useState<PoojaDefinition | null>(null);

  const hasActiveFilters = search.trim() !== "" || category !== "all" || status !== "all" || featured !== "all";
  const filteredPoojas = useMemo(() => poojas.filter((pooja) => (
    matchesSearch(pooja, search)
    && (category === "all" || pooja.categories.includes(category))
    && (status === "all" || pooja.status === status)
    && (featured === "all" || (featured === "featured" ? Boolean(pooja.featured) : !pooja.featured))
  )), [category, featured, search, status]);
  const columns = useMemo(() => getPoojaTableColumns(setDeleteTarget), []);

  function clearFilters() {
    setSearch("");
    setCategory("all");
    setStatus("all");
    setFeatured("all");
  }

  const resultLabel = hasActiveFilters ? `${filteredPoojas.length} of ${poojas.length}` : `${poojas.length} poojas`;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          
          <h1 className="truncate font-sans text-xl font-semibold tracking-tight text-foreground">Poojas</h1>
          <span className="hidden shrink-0 text-sm text-muted-foreground md:inline">{resultLabel}</span>
        </div>
      </div>

      {poojas.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">No poojas available.</CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <AdminDataTable
              columns={columns}
              data={filteredPoojas}
              initialColumnVisibility={{
                estimatedDuration: false,
                price: false,
                ritualSteps: false,
                requiredDetails: false,
                managementStatus: false,
              }}
              toolbar={(table) => (
                <div className="grid gap-3 xl:grid-cols-[minmax(18.75rem,22.5rem)_1fr] xl:items-center">
                  <div className="relative w-full">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search poojas" aria-label="Search poojas" className="h-10 pl-9" />
                  </div>
                  <div className="flex flex-row flex-wrap items-center gap-3 xl:flex-nowrap xl:justify-end">
                    <Select value={category} onValueChange={(value) => setCategory(value as PoojaCategory | "all")}>
                      <SelectTrigger className="h-10 min-w-[165px]" aria-label="Filter by category"><SelectValue>{poojaCategories.find((option) => option.value === category)?.label ?? "All categories"}</SelectValue></SelectTrigger>
                      <SelectContent>{poojaCategories.map((option) => <SelectItem key={option.value} value={option.value}>{option.value === "all" ? "All categories" : option.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={status} onValueChange={(value) => setStatus(value as PoojaStatusFilter)}>
                      <SelectTrigger className="h-10 min-w-[145px]" aria-label="Filter by status"><SelectValue>{statusOptions.find((option) => option.value === status)?.label ?? "All statuses"}</SelectValue></SelectTrigger>
                      <SelectContent>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={featured} onValueChange={(value) => setFeatured(value as FeaturedFilter)}>
                      <SelectTrigger className="h-10 min-w-[145px]" aria-label="Filter by featured state"><SelectValue>{featuredOptions.find((option) => option.value === featured)?.label ?? "All Poojas"}</SelectValue></SelectTrigger>
                      <SelectContent>{featuredOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <AdminDataTableColumnVisibility table={table} />
                    {hasActiveFilters ? <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10"><RotateCcw aria-hidden="true" />Clear filters</Button> : null}
                  </div>
                </div>
              )}
              emptyState={(
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">No poojas match these filters.</p>
                  {hasActiveFilters ? <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button> : null}
                </div>
              )}
            />
          </div>

          <div className="space-y-4 md:hidden">
            <Card className="shadow-sm">
              <CardContent className="space-y-3 p-4">
                <div className="relative">
                  <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search poojas" aria-label="Search poojas" className="h-10 pl-9" />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Select value={category} onValueChange={(value) => setCategory(value as PoojaCategory | "all")}>
                    <SelectTrigger className="h-10" aria-label="Filter by category"><SelectValue>{poojaCategories.find((option) => option.value === category)?.label ?? "All categories"}</SelectValue></SelectTrigger>
                    <SelectContent>{poojaCategories.map((option) => <SelectItem key={option.value} value={option.value}>{option.value === "all" ? "All categories" : option.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={status} onValueChange={(value) => setStatus(value as PoojaStatusFilter)}>
                    <SelectTrigger className="h-10" aria-label="Filter by status"><SelectValue>{statusOptions.find((option) => option.value === status)?.label ?? "All statuses"}</SelectValue></SelectTrigger>
                    <SelectContent>{statusOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={featured} onValueChange={(value) => setFeatured(value as FeaturedFilter)}>
                    <SelectTrigger className="h-10" aria-label="Filter by featured state"><SelectValue>{featuredOptions.find((option) => option.value === featured)?.label ?? "All Poojas"}</SelectValue></SelectTrigger>
                    <SelectContent>{featuredOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {hasActiveFilters ? <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button> : null}
              </CardContent>
            </Card>
            {filteredPoojas.length > 0 ? filteredPoojas.map((pooja) => <PoojaMobileCard key={pooja.slug} pooja={pooja} onDelete={setDeleteTarget} />) : (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <p className="text-sm text-muted-foreground">No poojas match these filters.</p>
                  {hasActiveFilters ? <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button> : null}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      <PoojaDeleteDialog pooja={deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }} />
    </section>
  );
}
