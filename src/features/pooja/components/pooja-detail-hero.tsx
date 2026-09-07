"use client";

import { ArrowRight, MessagesSquare } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import {
  FullBleedHero,
  type HeroAtmosphere,
} from "@/components/layout/full-bleed-hero";
import { SpiritualAmbientLayer } from "@/components/shared/spiritual-ambient-layer";
import type { PoojaDefinition } from "../types/pooja";

const HERO_POINTS = [
  "Clear ritual overview",
  "Simple online request",
  "Guided preparation",
];

function heroAtmosphere(pooja: PoojaDefinition): HeroAtmosphere {
  if (pooja.categories.includes("planetary")) return "planetary";
  if (pooja.categories.includes("shiva")) return "shiva";
  if (pooja.categories.includes("knowledge")) return "knowledge";
  return "default";
}

type PoojaDetailHeroProps = {
  pooja: PoojaDefinition;
};

export function PoojaDetailHero({ pooja }: PoojaDetailHeroProps) {
  return (
    <FullBleedHero
      labelledBy="pooja-detail-heading"
      contentClassName="max-w-[620px]"
      foregroundImage={pooja.imageSrc}
      foregroundAlt={`${pooja.name} illustration`}
      ambientHalo
      atmosphere={heroAtmosphere(pooja)}
      ambientSlot={<SpiritualAmbientLayer variant="pooja" />}
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Online Pooja", href: "/pooja" },
        { label: pooja.name },
      ]}
    >
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500 dark:text-gold-300">
        {pooja.detail.eyebrow ?? "Online Pooja"}
      </span>
      <h1
        id="pooja-detail-heading"
        className="mt-3 font-display text-[40px] font-semibold leading-[1.04] text-foreground sm:text-[48px] lg:text-[58px]"
      >
        {pooja.name}
      </h1>
      <p className="mt-4 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-base">
        {pooja.detail.overview[0]}
      </p>

      <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2">
        {HERO_POINTS.map((point) => (
          <li
            key={point}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground/75"
          >
            <span
              aria-hidden="true"
              className="size-1.5 rounded-full bg-gold-500 dark:bg-gold-300"
            />
            {point}
          </li>
        ))}
      </ul>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <Button
          type="button"
          variant="conversion"
          data-route={`/pooja/${pooja.slug}/request`}
          onClick={() => toast("Pooja request flow will be connected next.")}
          className="transition-transform duration-200 hover:-translate-y-px"
        >
          Request This Pooja
          <ArrowRight aria-hidden="true" />
        </Button>
        <Button
          type="button"
          variant="outline"
          data-route="/astrologers"
          onClick={() =>
            toast("Astrologer consultation experience is coming soon.")
          }
          className="border-gold-500/40 bg-ivory-50/70 text-foreground transition-colors duration-200 hover:border-gold-500/60 hover:bg-ivory-50 dark:border-gold-400/40 dark:bg-espresso-900/50 dark:hover:bg-espresso-800 dark:hover:text-ivory-50"
        >
          <MessagesSquare aria-hidden="true" />
          Talk to Astrologer
        </Button>
      </div>
    </FullBleedHero>
  );
}
