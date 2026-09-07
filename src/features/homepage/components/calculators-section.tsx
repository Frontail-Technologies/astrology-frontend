"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";
import { CalculatorToolCard } from "@/features/calculators/components/calculator-tool-card";
import { getCalculatorsBySlug } from "@/features/calculators/data/calculators";
import { SectionHeading } from "./section-heading";

// Discovery subset — shared calculator definitions resolved by slug so the
// Homepage never duplicates the Hub data model.
const HOMEPAGE_CALCULATORS = getCalculatorsBySlug([
  "love-compatibility",
  "moon-sign",
  "ascendant",
  "mangal-dosha",
  "numerology",
  "lucky-gemstone",
]);

export function CalculatorsSection() {
  return (
    <section
      id="astrology-calculators"
      aria-labelledby="astrology-calculators-heading"
      className="text-foreground"
    >
      <Container className="max-w-[1440px] py-12 sm:py-14 lg:py-16">
        <SectionHeading
          eyebrow="Tools"
          title="Astrology Calculators"
          headingId="astrology-calculators-heading"
          description="Quick tools for relationships, birth charts, planetary influences and numerology."
          action={
            <Link
              href="/calculators"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full transition-all duration-200 hover:-translate-y-px hover:border-gold-500/45 sm:w-auto",
              )}
            >
              View All Calculators
              <ArrowRight aria-hidden="true" />
            </Link>
          }
        />

        <div className="mt-7 grid gap-4 sm:mt-8 sm:grid-cols-2 lg:grid-cols-3">
          {HOMEPAGE_CALCULATORS.map((calculator) => (
            <CalculatorToolCard key={calculator.slug} calculator={calculator} />
          ))}
        </div>
      </Container>
    </section>
  );
}
