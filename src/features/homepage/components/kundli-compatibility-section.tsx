"use client";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { CompatibilityEmblem, KundliEmblem } from "./astrology-emblems";

function KundliMotif() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-14 -top-14 size-64 opacity-80"
    >
      <span className="absolute inset-0 rounded-full border border-gold-400/20" />
      <span className="absolute inset-7 rounded-full border border-gold-400/15" />
      <span className="absolute inset-[3.5rem] rotate-45 rounded-[6px] border border-gold-400/25" />
      <span className="absolute right-16 top-14 size-1.5 rounded-full bg-gold-400/70" />
      <span className="absolute right-10 top-32 size-1 rounded-full bg-gold-300/60" />
    </div>
  );
}

function CompatibilityMotif() {
  return (
    <div
      aria-hidden="true"
      className="pointer-events-none absolute -right-12 -top-12 size-56 opacity-90"
    >
      <span className="absolute left-4 top-10 size-32 rounded-full border border-gold-500/25" />
      <span className="absolute left-[5.25rem] top-10 size-32 rounded-full border border-gold-500/20" />
      <span className="absolute left-24 top-26 size-1.5 rounded-full bg-gold-500/60" />
    </div>
  );
}

export function KundliCompatibilitySection() {
  return (
    <section
      id="birth-tools"
      aria-labelledby="birth-tools-heading"
      className="text-foreground"
    >
      <Container className="max-w-[1440px] py-12 sm:py-14 lg:py-16">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-gold-400/50" />
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
            Birth Details
          </span>
        </div>
        <h2
          id="birth-tools-heading"
          className="mt-3 text-[26px] font-semibold leading-tight sm:text-3xl lg:text-[32px]"
        >
          Kundli &amp; Compatibility
        </h2>

        <div className="mt-7 grid gap-5 sm:mt-8 lg:grid-cols-2 lg:gap-6">
          <article className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-gold-400/25 bg-obsidian-950 p-6 text-ivory-50 shadow-[inset_0_1px_0_0_rgba(239,209,154,0.08)] sm:min-h-[240px] sm:p-8">
            <KundliMotif />
            <div className="relative flex flex-1 flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <div className="flex flex-1 flex-col">
                <h3 className="font-sans text-xl font-semibold text-ivory-50 lg:text-2xl">
                  Understand Your Kundli
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-ivory-50/80">
                  Birth chart, planetary placements and astrology insights based
                  on your birth details.
                </p>
                <div className="mt-auto pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() =>
                      toast(
                        "Kundli creation opens when the Kundli experience is connected.",
                      )
                    }
                    data-route="/kundli"
                    className="border-gold-400/40 bg-transparent text-ivory-50 transition-all duration-200 hover:-translate-y-px hover:bg-gold-300/10 hover:text-ivory-50"
                  >
                    Create Your Kundli
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
              </div>
              <KundliEmblem
                size={104}
                tone="onDark"
                className="mx-auto shrink-0 sm:mx-0"
              />
            </div>
          </article>

          <article className="group relative flex h-full flex-col overflow-hidden rounded-[20px] border border-border bg-white p-6 text-foreground shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(239,209,154,0.08)] sm:min-h-[240px] sm:p-8">
            <CompatibilityMotif />
            <div className="relative flex flex-1 flex-col gap-6 sm:flex-row sm:items-center sm:justify-between sm:gap-8">
              <div className="flex flex-1 flex-col">
                <h3 className="font-sans text-xl font-semibold text-foreground lg:text-2xl">
                  Explore Compatibility
                </h3>
                <p className="mt-2 max-w-md text-sm leading-6 text-muted-foreground">
                  Compare birth details and explore relationship compatibility
                  through astrology.
                </p>
                <div className="mt-auto pt-6">
                  <Button
                    type="button"
                    variant="discovery"
                    onClick={() =>
                      toast(
                        "Compatibility opens when the Compatibility experience is connected.",
                      )
                    }
                    data-route="/compatibility"
                    className="transition-all duration-200 hover:-translate-y-px"
                  >
                    Check Compatibility
                    <ArrowRight aria-hidden="true" />
                  </Button>
                </div>
              </div>
              <CompatibilityEmblem size={104} className="mx-auto shrink-0 sm:mx-0" />
            </div>
          </article>
        </div>
      </Container>
    </section>
  );
}
