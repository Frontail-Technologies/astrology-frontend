"use client";

import { useMemo, useState } from "react";
import { Search, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Container } from "@/components/layout/container";
import {
  astrologers,
  availabilityOptions,
  expertiseOptions,
  languageOptions,
  sortOptions,
} from "../data/astrologers";
import { FullBleedHero } from "@/components/layout/full-bleed-hero";
import { SpiritualAmbientLayer } from "@/components/shared/spiritual-ambient-layer";
import { AstrologerGuidanceCta } from "@/features/homepage/components/astrologer-guidance-cta";
import type { AstrologerListItem, FilterOption } from "../types/astrologer";
import { AstrologerCard } from "./astrologer-card";
import { AstrologersEmptyState } from "./astrologers-empty-state";
import {
  AstrologerFilters,
  MobileAstrologerFilters,
} from "./mobile-astrologer-filters";

type SortValue = "recommended" | "name-asc" | "name-desc";

const defaultFilters: AstrologerFilters = {
  expertise: "all",
  language: "all",
  availability: "all",
};

function getOptionLabel(options: FilterOption[], value: string) {
  return options.find((option) => option.value === value)?.label ?? value;
}

function matchesSearch(astrologer: AstrologerListItem, query: string) {
  const normalizedQuery = query.trim().toLowerCase();

  if (!normalizedQuery) {
    return true;
  }

  return [
    astrologer.name,
    astrologer.primaryExpertise,
    ...astrologer.specialties,
    ...astrologer.languages,
  ]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

function SelectControl({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onValueChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-1.5">
      <span className="sr-only">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger
          className="h-11 min-w-[168px] border-gold-500/22 bg-white font-medium dark:border-gold-400/22 dark:bg-surface-muted"
          aria-label={label}
        >
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export function AstrologersListingPage() {
  const [query, setQuery] = useState("");
  const [filters, setFilters] = useState<AstrologerFilters>(defaultFilters);
  const [sort, setSort] = useState<SortValue>("recommended");

  const filteredAstrologers = useMemo(() => {
    const results = astrologers.filter((astrologer) => {
      const expertiseMatches =
        filters.expertise === "all" ||
        astrologer.expertiseKey === filters.expertise ||
        astrologer.specialties.some(
          (specialty) =>
            specialty.toLowerCase().replaceAll(" ", "-") === filters.expertise,
        );

      const languageMatches =
        filters.language === "all" ||
        astrologer.languages.some(
          (language) => language.toLowerCase() === filters.language,
        );

      const availabilityMatches =
        filters.availability === "all" ||
        astrologer.availability === filters.availability;

      return (
        matchesSearch(astrologer, query) &&
        expertiseMatches &&
        languageMatches &&
        availabilityMatches
      );
    });

    return [...results].sort((a, b) => {
      if (sort === "name-asc") {
        return a.name.localeCompare(b.name);
      }

      if (sort === "name-desc") {
        return b.name.localeCompare(a.name);
      }

      return astrologers.findIndex((item) => item.id === a.id) -
        astrologers.findIndex((item) => item.id === b.id);
    });
  }, [filters, query, sort]);

  const activeFilters = [
    filters.expertise !== "all"
      ? {
          key: "expertise",
          label: getOptionLabel(expertiseOptions, filters.expertise),
          onClear: () => setFilters((current) => ({ ...current, expertise: "all" })),
        }
      : null,
    filters.language !== "all"
      ? {
          key: "language",
          label: getOptionLabel(languageOptions, filters.language),
          onClear: () => setFilters((current) => ({ ...current, language: "all" })),
        }
      : null,
    filters.availability !== "all"
      ? {
          key: "availability",
          label: getOptionLabel(availabilityOptions, filters.availability),
          onClear: () =>
            setFilters((current) => ({ ...current, availability: "all" })),
        }
      : null,
    query.trim()
      ? {
          key: "query",
          label: `Search: ${query.trim()}`,
          onClear: () => setQuery(""),
        }
      : null,
  ].filter(Boolean) as Array<{ key: string; label: string; onClear: () => void }>;

  function clearFilters() {
    setQuery("");
    setFilters(defaultFilters);
    setSort("recommended");
  }

  return (
    <main className="relative text-foreground">
      <FullBleedHero
        bgImage="/assets/astrology/astrologers/hero-visual-wide.png"
        labelledBy="astrologers-hero-heading"
        ambientSlot={<SpiritualAmbientLayer variant="astrologer" />}
        crumbs={[{ label: "Home", href: "/" }, { label: "Astrologers" }]}
      >
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-gold-500/50" />
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold-500 dark:text-gold-300">
            Astrologers
          </span>
        </div>
        <h1
          id="astrologers-hero-heading"
          className="mt-3 font-display text-[34px] font-semibold leading-[1.06] text-foreground sm:text-[42px] lg:text-[46px]"
        >
          Find the Right Astrologer
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-6 text-muted-foreground">
          Browse astrologers by expertise, language and consultation
          availability to find guidance that fits what you are looking for.
        </p>
      </FullBleedHero>

      <Container className="max-w-[1440px] pb-6 pt-10 sm:pt-12 lg:pt-14">
        <section
          className="rounded-xl border border-gold-500/16 bg-white p-4 shadow-[0_1px_2px_rgba(23,32,51,0.05),0_2px_8px_rgba(23,32,51,0.06)] dark:border-gold-400/18 dark:bg-espresso-900 dark:shadow-none"
          aria-label="Astrologer search and filters"
        >
          <div className="grid gap-3 lg:grid-cols-[minmax(280px,380px)_1fr] lg:items-center">
            <label className="relative block">
              <span className="sr-only">Search astrologers</span>
              <Search
                aria-hidden="true"
                className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
              />
              <Input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search astrologers"
                aria-label="Search astrologers"
                className="h-11 border-gold-500/25 bg-white pl-10 text-foreground placeholder:text-muted-foreground focus-visible:ring-gold-500/30 dark:border-gold-400/22 dark:bg-espresso-800/70"
              />
            </label>

            <div className="hidden flex-wrap justify-end gap-3 lg:flex">
              <SelectControl
                label="Expertise"
                value={filters.expertise}
                options={expertiseOptions}
                onValueChange={(expertise) =>
                  setFilters((current) => ({ ...current, expertise }))
                }
              />
              <SelectControl
                label="Language"
                value={filters.language}
                options={languageOptions}
                onValueChange={(language) =>
                  setFilters((current) => ({ ...current, language }))
                }
              />
              <SelectControl
                label="Availability"
                value={filters.availability}
                options={availabilityOptions}
                onValueChange={(availability) =>
                  setFilters((current) => ({ ...current, availability }))
                }
              />
              <SelectControl
                label="Sort astrologers"
                value={sort}
                options={sortOptions}
                onValueChange={(value) => setSort(value as SortValue)}
              />
            </div>

            <div className="flex gap-3 lg:hidden">
              <MobileAstrologerFilters
                filters={filters}
                expertiseOptions={expertiseOptions}
                languageOptions={languageOptions}
                availabilityOptions={availabilityOptions}
                onApply={setFilters}
                onClear={clearFilters}
              />
              <Select value={sort} onValueChange={(value) => setSort(value as SortValue)}>
                <SelectTrigger
                  className="h-11 flex-1 border-gold-500/22 bg-white font-medium dark:border-gold-400/22 dark:bg-surface-muted"
                  aria-label="Sort astrologers"
                >
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {sortOptions.map((option) => (
                    <SelectItem key={option.value} value={option.value}>
                      {option.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </section>

        <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm font-medium text-foreground">
            {filteredAstrologers.length}{" "}
            {filteredAstrologers.length === 1 ? "astrologer" : "astrologers"} found
          </p>

          {activeFilters.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {activeFilters.map((filter) => (
                <button
                  type="button"
                  key={filter.key}
                  onClick={filter.onClear}
                  className="inline-flex min-h-8 items-center gap-1.5 rounded-md border border-gold-500/20 bg-white px-2.5 text-xs font-medium text-muted-foreground transition-colors hover:border-gold-500/45 hover:text-foreground dark:border-gold-400/18 dark:bg-espresso-900"
                  aria-label={`Clear ${filter.label} filter`}
                >
                  {filter.label}
                  <X className="size-3" aria-hidden="true" />
                </button>
              ))}
              <Button
                type="button"
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="min-h-8 text-xs"
              >
                Clear all
              </Button>
            </div>
          ) : null}
        </div>

        {filteredAstrologers.length > 0 ? (
          <section
            aria-label="Astrologer results"
            className="mt-4 grid gap-5 md:grid-cols-2 xl:grid-cols-3"
          >
            {filteredAstrologers.map((astrologer) => (
              <AstrologerCard astrologer={astrologer} key={astrologer.id} />
            ))}
          </section>
        ) : (
          <section className="mt-5">
            <AstrologersEmptyState onClear={clearFilters} />
          </section>
        )}
      </Container>

      <AstrologerGuidanceCta />
    </main>
  );
}
