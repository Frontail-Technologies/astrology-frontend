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
import {
  astrologers,
  availabilityOptions,
  expertiseOptions,
  languageOptions,
} from "@/features/astrologers/data/astrologers";
import type { AstrologerListItem } from "@/features/astrologers/types/astrologer";
import { AstrologerDeleteDialog } from "./astrologer-delete-dialog";
import { AstrologerMobileCard } from "./astrologer-mobile-card";
import { getAstrologerTableColumns } from "./astrologer-table-columns";
import {
  AdminDataTable,
  AdminDataTableColumnVisibility,
} from "./shared/admin-data-table";

function matchesSearch(astrologer: AstrologerListItem, query: string) {
  const searchable = [
    astrologer.name,
    astrologer.primaryExpertise,
    ...astrologer.specialties,
    ...astrologer.languages,
  ].join(" ").toLowerCase();

  return searchable.includes(query.toLowerCase());
}

export function AdminAstrologersView() {
  const [search, setSearch] = useState("");
  const [expertise, setExpertise] = useState("all");
  const [language, setLanguage] = useState("all");
  const [availability, setAvailability] = useState("all");
  const [deleteTarget, setDeleteTarget] = useState<AstrologerListItem | null>(null);

  const hasActiveFilters = search.trim() !== "" || expertise !== "all" || language !== "all" || availability !== "all";
  const filteredAstrologers = useMemo(
    () => astrologers.filter((astrologer) => (
      matchesSearch(astrologer, search)
      && (expertise === "all" || astrologer.expertiseKey === expertise)
      && (language === "all" || astrologer.languages.some((value) => value.toLowerCase() === language))
      && (availability === "all" || astrologer.availability === availability)
    )),
    [availability, expertise, language, search],
  );
  const columns = useMemo(() => getAstrologerTableColumns(setDeleteTarget), []);

  function clearFilters() {
    setSearch("");
    setExpertise("all");
    setLanguage("all");
    setAvailability("all");
  }

  const resultLabel = hasActiveFilters
    ? `${filteredAstrologers.length} of ${astrologers.length}`
    : `${astrologers.length} astrologers`;

  return (
    <section className="space-y-5">
      <div className="flex items-center justify-between gap-4">
        <div className="flex min-w-0 items-center gap-3">
          
          <h1 className="truncate font-sans text-xl font-semibold tracking-tight text-foreground">Astrologers</h1>
          <span className="shrink-0 text-sm text-muted-foreground">{resultLabel}</span>
        </div>
      </div>

      {astrologers.length === 0 ? (
        <Card className="shadow-sm">
          <CardContent className="py-10 text-center text-sm text-muted-foreground">No astrologers available.</CardContent>
        </Card>
      ) : (
        <>
          <div className="hidden md:block">
            <AdminDataTable
              columns={columns}
              data={filteredAstrologers}
              initialColumnVisibility={{
                specialties: false,
                languages: false,
                startingPrice: false,
                liveAvailability: false,
                verification: false,
              }}
              toolbar={(table) => (
                <div className="grid gap-3 xl:grid-cols-[minmax(18.75rem,22.5rem)_1fr] xl:items-center">
                  <div className="relative w-full">
                    <Search className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
                    <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search astrologers" aria-label="Search astrologers" className="h-10 pl-9" />
                  </div>
                  <div className="flex flex-row flex-wrap items-center gap-3 xl:flex-nowrap xl:justify-end">
                    <Select value={expertise} onValueChange={setExpertise}>
                      <SelectTrigger className="h-10 min-w-[160px]" aria-label="Filter by expertise"><SelectValue placeholder="All expertise" /></SelectTrigger>
                      <SelectContent>{expertiseOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={language} onValueChange={setLanguage}>
                      <SelectTrigger className="h-10 min-w-[150px]" aria-label="Filter by language"><SelectValue placeholder="All languages" /></SelectTrigger>
                      <SelectContent>{languageOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <Select value={availability} onValueChange={setAvailability}>
                      <SelectTrigger className="h-10 min-w-[190px]" aria-label="Filter by booking availability"><SelectValue placeholder="All booking availability" /></SelectTrigger>
                      <SelectContent>{availabilityOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                    </Select>
                    <AdminDataTableColumnVisibility table={table} />
                    {hasActiveFilters ? <Button variant="ghost" size="sm" onClick={clearFilters} className="h-10"><RotateCcw aria-hidden="true" />Clear filters</Button> : null}
                  </div>
                </div>
              )}
              emptyState={(
                <div className="flex flex-col items-center gap-3">
                  <p className="text-sm text-muted-foreground">No astrologers match these filters.</p>
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
                  <Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search astrologers" aria-label="Search astrologers" className="h-10 pl-9" />
                </div>
                <div className="grid gap-3 sm:grid-cols-3">
                  <Select value={expertise} onValueChange={setExpertise}>
                    <SelectTrigger className="h-10" aria-label="Filter by expertise"><SelectValue placeholder="All expertise" /></SelectTrigger>
                    <SelectContent>{expertiseOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={language} onValueChange={setLanguage}>
                    <SelectTrigger className="h-10" aria-label="Filter by language"><SelectValue placeholder="All languages" /></SelectTrigger>
                    <SelectContent>{languageOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                  </Select>
                  <Select value={availability} onValueChange={setAvailability}>
                    <SelectTrigger className="h-10" aria-label="Filter by booking availability"><SelectValue placeholder="All booking availability" /></SelectTrigger>
                    <SelectContent>{availabilityOptions.map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent>
                  </Select>
                </div>
                {hasActiveFilters ? <Button variant="ghost" size="sm" onClick={clearFilters}>Clear filters</Button> : null}
              </CardContent>
            </Card>
            {filteredAstrologers.length > 0 ? filteredAstrologers.map((astrologer) => (
              <AstrologerMobileCard key={astrologer.id} astrologer={astrologer} onDelete={setDeleteTarget} />
            )) : (
              <Card className="shadow-sm">
                <CardContent className="flex flex-col items-center gap-3 py-10 text-center">
                  <p className="text-sm text-muted-foreground">No astrologers match these filters.</p>
                  {hasActiveFilters ? <Button variant="outline" size="sm" onClick={clearFilters}>Clear filters</Button> : null}
                </CardContent>
              </Card>
            )}
          </div>
        </>
      )}

      <AstrologerDeleteDialog astrologer={deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }} />
    </section>
  );
}
