"use client";

import { useMemo, useState } from "react";
import { HeartHandshake, LifeBuoy, ScrollText, Sprout } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { DiyaFlameAccent } from "@/components/shared/diya-flame-accent";
import { SectionChakra } from "@/components/shared/section-chakra";
import { featuredPoojas, poojas } from "../data/poojas";
import type { PoojaCategoryValue } from "../types/pooja";
import { PoojaCard } from "./pooja-card";
import { PoojaGuidanceCta } from "./pooja-guidance-cta";
import { PoojaHero } from "./pooja-hero";
import { PoojaProcess } from "./pooja-process";
import { PoojaPurposeFilter } from "./pooja-purpose-filter";

const ASSURANCE = [
  {
    icon: ScrollText,
    title: "Clear Ritual Details",
    text: "Each pooja lists its purpose and what it involves.",
  },
  {
    icon: Sprout,
    title: "Guided Preparation",
    text: "Simple preparation guidance before the ritual.",
  },
  {
    icon: HeartHandshake,
    title: "Respectful Service Experience",
    text: "Rituals are presented with cultural respect.",
  },
  {
    icon: LifeBuoy,
    title: "Support Before Booking",
    text: "Ask questions before you decide.",
  },
];

export function PoojaListingPage() {
  const [category, setCategory] = useState<PoojaCategoryValue>("all");

  const visible = useMemo(
    () =>
      category === "all"
        ? poojas
        : poojas.filter((pooja) => pooja.categories.includes(category)),
    [category],
  );

  return (
    <main className="relative text-foreground">
      <PoojaHero />

      <Container className="max-w-[1440px] pb-6 pt-10 sm:pt-12 lg:pt-14">
        <section aria-labelledby="popular-poojas-heading">
          <h2
            id="popular-poojas-heading"
            className="text-2xl font-semibold text-foreground sm:text-[26px]"
          >
            Popular Poojas
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            A few widely performed rituals to start with.
          </p>
          <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-4 lg:gap-5">
            {featuredPoojas.map((pooja) => (
              <PoojaCard key={pooja.slug} pooja={pooja} variant="featured" />
            ))}
          </div>
        </section>

        <section
          id="pooja-catalog"
          aria-labelledby="pooja-catalog-heading"
          className="mt-12 scroll-mt-24"
        >
          <h2
            id="pooja-catalog-heading"
            className="text-2xl font-semibold text-foreground sm:text-[26px]"
          >
            Poojas by Purpose
          </h2>
          <p className="mt-2 max-w-xl text-sm leading-6 text-muted-foreground">
            Browse the full list of available rituals by what you are exploring.
          </p>

          <div className="mt-5">
            <PoojaPurposeFilter value={category} onValueChange={setCategory} />
          </div>

          {visible.length > 0 ? (
            <div className="mt-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 lg:gap-5 xl:grid-cols-5">
              {visible.map((pooja) => (
                <PoojaCard key={pooja.slug} pooja={pooja} />
              ))}
            </div>
          ) : (
            <div className="mt-6 flex min-h-[180px] flex-col items-center justify-center rounded-2xl border border-gold-500/16 bg-white px-6 py-10 text-center shadow-[0_1px_2px_rgba(23,32,51,0.04)] dark:border-gold-400/16 dark:bg-espresso-900 dark:shadow-none">
              <p className="text-sm font-semibold text-foreground">
                No poojas match this purpose.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setCategory("all")}
                className="mt-4"
              >
                Show all poojas
              </Button>
            </div>
          )}
        </section>

        <div className="relative mt-14 overflow-hidden">
          <SectionChakra
            spin={false}
            className="-z-10 -left-40 -bottom-44 w-[26rem]"
          />
          <DiyaFlameAccent className="left-[-0.75rem] top-1 sm:left-[-1.5rem] sm:top-0" />
          <PoojaProcess />
        </div>

        <section
          aria-label="Service assurance"
          className="mt-12 grid gap-5 rounded-2xl border border-gold-500/16 bg-white p-5 shadow-[0_1px_2px_rgba(23,32,51,0.04)] dark:border-gold-400/16 dark:bg-espresso-900 dark:shadow-none sm:grid-cols-2 sm:p-6 lg:grid-cols-4"
        >
          {ASSURANCE.map(({ icon: Icon, title, text }) => (
            <div key={title} className="flex gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full border border-gold-500/22 bg-gold-300/18 text-gold-500 dark:border-gold-400/22 dark:bg-gold-400/10 dark:text-gold-300">
                <Icon className="size-[18px]" aria-hidden="true" />
              </span>
              <div>
                <p className="font-sans text-sm font-semibold text-foreground">
                  {title}
                </p>
                <p className="mt-0.5 text-[12px] leading-[1.45] text-muted-foreground">
                  {text}
                </p>
              </div>
            </div>
          ))}
        </section>

        <div className="mt-14">
          <PoojaGuidanceCta />
        </div>
      </Container>
    </main>
  );
}
