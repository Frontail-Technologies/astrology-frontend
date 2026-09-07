"use client";

import { useMemo, useState } from "react";
import {
  ArrowRight,
  Hash,
  Heart,
  LayoutGrid,
  Leaf,
  MessagesSquare,
  Orbit,
  SearchX,
  Sun,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { FullBleedHero } from "@/components/layout/full-bleed-hero";
import { SpiritualAmbientLayer } from "@/components/shared/spiritual-ambient-layer";
import { cn } from "@/lib/utils";
import {
  calculatorCategories,
  calculatorGroups,
  calculators,
  featuredCalculators,
} from "../data/calculators";
import type {
  CalculatorCategoryValue,
  CalculatorDefinition,
} from "../types/calculator";
import { CalculatorCategorySection } from "./calculator-category-section";
import { CalculatorFeatureCard } from "./calculator-feature-card";
import { CalculatorSearch } from "./calculator-search";
import { CalculatorToolCard } from "./calculator-tool-card";

function matchesQuery(calculator: CalculatorDefinition, normalizedQuery: string) {
  if (!normalizedQuery) {
    return true;
  }

  return [calculator.name, calculator.category, ...calculator.keywords]
    .join(" ")
    .toLowerCase()
    .includes(normalizedQuery);
}

const CATEGORY_ICONS: Record<
  CalculatorCategoryValue,
  React.ComponentType<{ className?: string }>
> = {
  all: LayoutGrid,
  relationships: Heart,
  "birth-chart": Sun,
  dosha: Orbit,
  numerology: Hash,
  remedies: Leaf,
};

// Category slug -> grouped-section column count. Numerology + Remedies share a
// tighter split row so the directory does not read as one repeated grid shape.
const GROUP_COLUMNS: Record<string, 2 | 3> = {
  relationships: 3,
  "birth-chart": 3,
  dosha: 3,
  numerology: 2,
  remedies: 2,
};

export function CalculatorHub() {
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CalculatorCategoryValue>("all");

  const normalizedQuery = query.trim().toLowerCase();
  const isFiltering = normalizedQuery.length > 0 || category !== "all";

  const visible = useMemo(
    () =>
      calculators.filter(
        (calculator) =>
          matchesQuery(calculator, normalizedQuery) &&
          (category === "all" || calculator.category === category),
      ),
    [category, normalizedQuery],
  );

  function clearFilters() {
    setQuery("");
    setCategory("all");
  }

  const rowGroups = calculatorGroups.filter(
    (group) => GROUP_COLUMNS[group.category] === 3,
  );
  const splitGroups = calculatorGroups.filter(
    (group) => GROUP_COLUMNS[group.category] === 2,
  );

  return (
    <main className="relative text-foreground">
      <FullBleedHero
        bgImage="/assets/astrology/calculators/calculator-hero-visual-wide.png"
        labelledBy="calc-hero-heading"
        ambientSlot={<SpiritualAmbientLayer variant="calculator" />}
        crumbs={[{ label: "Home", href: "/" }, { label: "Calculators" }]}
      >
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-gold-500/50" />
          <span className="text-xs font-bold uppercase tracking-[0.16em] text-gold-500 dark:text-gold-300">
            Astrology Tools
          </span>
        </div>
        <h1
          id="calc-hero-heading"
          className="mt-3 font-display text-[40px] font-semibold leading-[1.05] text-foreground sm:text-[48px] lg:text-[52px]"
        >
          Astrology Calculators
        </h1>
        <p className="mt-3 max-w-md text-[15px] leading-6 text-muted-foreground">
          Explore practical astrology tools for relationships, birth charts,
          planetary influences, numerology and more.
        </p>

        <div className="mt-6 max-w-[520px]">
          <CalculatorSearch value={query} onValueChange={setQuery} />
        </div>
      </FullBleedHero>

      <Container className="max-w-[1440px] pb-6 pt-10 sm:pt-12 lg:pt-14">
        {/* Category selector — full-width band below the hero */}
        <div
          role="group"
          aria-label="Filter calculators by category"
          className="flex gap-2.5 overflow-x-auto no-scrollbar px-0.5 py-1 sm:flex-wrap sm:overflow-visible sm:p-0"
        >
          {calculatorCategories.map((option) => {
            const selected = category === option.value;
            const Icon = CATEGORY_ICONS[option.value];

            return (
              <button
                key={option.value}
                type="button"
                aria-pressed={selected}
                onClick={() => setCategory(option.value)}
                className={cn(
                  "inline-flex shrink-0 items-center gap-2 rounded-lg border px-4 py-2.5 text-sm font-semibold outline-none transition-colors duration-200",
                  "focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  selected
                    ? "border-conversion-500 bg-conversion-500 text-midnight-950 hover:bg-conversion-600"
                    : "border-gold-500/20 bg-white text-foreground/70 hover:border-gold-500/40 hover:bg-gold-300/10 hover:text-foreground dark:border-gold-400/18 dark:bg-espresso-900 dark:text-ivory-50/72 dark:hover:border-gold-400/40 dark:hover:bg-espresso-700 dark:hover:text-ivory-50",
                )}
              >
                <Icon
                  aria-hidden="true"
                  className={cn(
                    "size-4 shrink-0",
                    selected
                      ? "text-midnight-950"
                      : "text-gold-500 dark:text-gold-300",
                  )}
                />
                {option.label}
              </button>
            );
          })}
        </div>

        {/* Popular calculators */}
        {!isFiltering ? (
          <section aria-labelledby="calc-featured-heading" className="mt-10">
            <h2
              id="calc-featured-heading"
              className="text-2xl font-semibold text-foreground sm:text-[26px]"
            >
              Popular Calculators
            </h2>
            <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
              {featuredCalculators.map((calculator) => (
                <CalculatorFeatureCard
                  key={calculator.slug}
                  calculator={calculator}
                />
              ))}
            </div>
          </section>
        ) : null}

        {/* Directory */}
        <div className="mt-12">
          {visible.length === 0 ? (
            <div className="flex min-h-[240px] flex-col items-center justify-center rounded-2xl border border-gold-500/16 bg-white px-6 py-12 text-center shadow-[0_1px_2px_rgba(23,32,51,0.05)] dark:border-gold-400/16 dark:bg-espresso-900 dark:shadow-none">
              <div className="grid size-12 place-items-center rounded-full border border-gold-500/25 bg-gold-300/16 text-gold-500 dark:text-gold-300">
                <SearchX className="size-5" aria-hidden="true" />
              </div>
              <h2 className="mt-4 text-lg font-semibold text-foreground">
                No calculators found.
              </h2>
              <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
                Try another search or category.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={clearFilters}
                className="mt-5"
              >
                Clear Filters
              </Button>
            </div>
          ) : isFiltering ? (
            <section aria-label="Calculator results">
              <p className="text-sm font-medium text-muted-foreground">
                {visible.length}{" "}
                {visible.length === 1 ? "calculator" : "calculators"}
              </p>
              <div className="mt-4 grid gap-3.5 sm:grid-cols-2 xl:grid-cols-3">
                {visible.map((calculator) => (
                  <CalculatorToolCard
                    key={calculator.slug}
                    calculator={calculator}
                  />
                ))}
              </div>
            </section>
          ) : (
            <div className="space-y-11">
              {rowGroups.map((group) => (
                <CalculatorCategorySection
                  key={group.category}
                  title={group.title}
                  headingId={`calc-group-${group.category}`}
                  columns={3}
                  calculators={visible.filter(
                    (calculator) => calculator.category === group.category,
                  )}
                />
              ))}

              <div className="grid gap-x-8 gap-y-11 lg:grid-cols-2">
                {splitGroups.map((group) => (
                  <CalculatorCategorySection
                    key={group.category}
                    title={group.title}
                    headingId={`calc-group-${group.category}`}
                    columns={2}
                    calculators={visible.filter(
                      (calculator) => calculator.category === group.category,
                    )}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Guidance CTA */}
        <section
          aria-labelledby="calc-guidance-heading"
          className="relative mt-14 overflow-hidden rounded-2xl border border-gold-400/28"
        >
          <span
            aria-hidden="true"
            style={{
              backgroundImage:
                "url('/assets/astrology/calculators/calculator-guidance-cta-bg.png')",
            }}
            className="pointer-events-none absolute inset-0 bg-cover bg-left sm:bg-right"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-obsidian-950/85 via-obsidian-950/55 to-obsidian-950/15"
          />
          <div className="relative flex flex-col gap-5 p-6 text-ivory-50 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8">
            <div className="max-w-lg">
              <h2
                id="calc-guidance-heading"
                className="text-xl font-semibold sm:text-[26px]"
              >
                Need help understanding your astrology results?
              </h2>
              <p className="mt-2 text-sm leading-6 text-ivory-50/80">
                Talk to an experienced astrologer for personal guidance.
              </p>
            </div>
            <Button
              type="button"
              variant="conversion"
              onClick={() =>
                toast("Astrologer consultation experience is coming soon.")
              }
              data-route="/astrologers"
              className="shrink-0 transition-all duration-200 hover:-translate-y-px"
            >
              <MessagesSquare aria-hidden="true" />
              Talk to Astrologer
              <ArrowRight aria-hidden="true" />
            </Button>
          </div>
        </section>
      </Container>
    </main>
  );
}
