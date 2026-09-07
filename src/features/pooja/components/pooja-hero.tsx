"use client";

import { ArrowRight, MessagesSquare } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { FullBleedHero } from "@/components/layout/full-bleed-hero";
import { SpiritualAmbientLayer } from "@/components/shared/spiritual-ambient-layer";
import { cn } from "@/lib/utils";

const HERO_POINTS = [
  "Guided ritual details",
  "Simple booking process",
  "Clear preparation guidance",
];

const HERO_IMAGE = "/assets/astrology/pooja/17-online-pooja-hero-wide.png";

export function PoojaHero() {
  return (
    <FullBleedHero
      bgImage={HERO_IMAGE}
      labelledBy="pooja-hero-heading"
      ambientSlot={<SpiritualAmbientLayer variant="pooja" />}
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Online Pooja" },
      ]}
    >
      <span className="text-xs font-bold uppercase tracking-[0.18em] text-gold-500 dark:text-gold-300">
        Online Pooja
      </span>
      <h1
        id="pooja-hero-heading"
        className="mt-3 font-display text-[34px] font-semibold leading-[1.08] text-foreground sm:text-[42px] lg:text-[46px]"
      >
        Book Meaningful Online Poojas &amp; Rituals
      </h1>
      <p className="mt-3 max-w-lg text-[15px] leading-6 text-muted-foreground">
        Explore guided Vedic rituals and Poojas with clear preparation details
        and a simple booking experience.
      </p>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row">
        <a
          href="#pooja-catalog"
          className={cn(
            buttonVariants({ variant: "conversion" }),
            "transition-transform duration-200 hover:-translate-y-px",
          )}
        >
          Explore Poojas
          <ArrowRight aria-hidden="true" />
        </a>
        <Button
          type="button"
          variant="outline"
          onClick={() =>
            toast("Astrologer consultation experience is coming soon.")
          }
          data-route="/astrologers"
          className="border-gold-500/40 bg-ivory-50/70 text-foreground transition-colors duration-200 hover:border-gold-500/60 hover:bg-ivory-50 dark:border-gold-400/40 dark:bg-espresso-900/50 dark:text-ivory-50 dark:hover:bg-espresso-800 dark:hover:text-ivory-50"
        >
          <MessagesSquare aria-hidden="true" />
          Talk to Astrologer
        </Button>
      </div>

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
    </FullBleedHero>
  );
}
