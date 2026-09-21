"use client";

import Image from "next/image";
import { Languages, UserRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { FullBleedHero } from "@/components/layout/full-bleed-hero";
import { SpiritualAmbientLayer } from "@/components/shared/spiritual-ambient-layer";
import { availabilityLabel } from "../data/astrologers";
import type { AstrologerListItem } from "../types/astrologer";
import { BookConsultationButton } from "./book-consultation-button";

type AstrologerProfileHeroProps = {
  astrologer: AstrologerListItem;
};

function Portrait({ astrologer }: AstrologerProfileHeroProps) {
  return (
    <div className="relative">
      <span
        aria-hidden="true"
        className="absolute -inset-5 rounded-full border border-gold-500/25 dark:border-gold-400/22 sm:-inset-7"
      />
      <span
        aria-hidden="true"
        className="absolute -inset-10 hidden rounded-full border border-gold-500/12 dark:border-gold-400/12 sm:block"
      />
      <span
        aria-hidden="true"
        className="absolute -inset-7 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--gold-500)_14%,transparent),transparent_68%)] dark:bg-[radial-gradient(circle,color-mix(in_srgb,var(--gold-400)_12%,transparent),transparent_68%)]"
      />
      <Image
        src={astrologer.avatarSrc}
        alt={`Portrait of ${astrologer.name}`}
        width={340}
        height={340}
        priority
        className="illustration-lift-lg relative size-[220px] rounded-full border-[5px] border-white bg-ivory-100 object-cover shadow-xl dark:border-espresso-800 dark:bg-espresso-900 sm:size-[270px] lg:size-[330px]"
      />
      <span
        aria-hidden="true"
        className={
          astrologer.availability === "bookable"
            ? "absolute bottom-3 right-4 size-5 rounded-full bg-success ring-4 ring-white dark:ring-espresso-800 lg:bottom-5 lg:right-7"
            : "absolute bottom-3 right-4 size-5 rounded-full bg-gold-500 ring-4 ring-white dark:ring-espresso-800 lg:bottom-5 lg:right-7"
        }
      />
    </div>
  );
}

export function AstrologerProfileHero({ astrologer }: AstrologerProfileHeroProps) {
  const detail = astrologer.detail;

  function scrollToOverview() {
    document
      .getElementById("overview")
      ?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <FullBleedHero
      labelledBy="astrologer-heading"
      contentClassName="max-w-[640px]"
      contentBoxClassName="min-h-[560px] pb-16 pt-20 sm:min-h-[470px] sm:pt-24 lg:min-h-[500px] lg:pb-20"
      ambientSlot={<SpiritualAmbientLayer variant="astrologer" />}
      aside={<Portrait astrologer={astrologer} />}
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Astrologers", href: "/astrologers" },
        { label: astrologer.name },
      ]}
    >
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500 dark:text-gold-300">
        Astrologer
      </span>
      <h1
        id="astrologer-heading"
        className="mt-3 font-display text-[40px] font-semibold leading-[1.04] text-foreground sm:text-[48px] lg:text-[58px]"
      >
        {astrologer.name}
      </h1>
      <p className="mt-2 text-base font-semibold text-gold-500 dark:text-gold-300 sm:text-lg">
        {detail?.role ?? astrologer.primaryExpertise}
      </p>
      {detail ? (
        <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted-foreground sm:text-base">
          {detail.intro}
        </p>
      ) : null}

      <ul
        aria-label="Expertise"
        className="mt-5 flex flex-wrap gap-2"
      >
        {[astrologer.primaryExpertise, ...astrologer.specialties].map((tag) => (
          <li
            key={tag}
            className="inline-flex items-center gap-1.5 rounded-full border border-gold-500/30 bg-white/80 px-3 py-1 text-[12.5px] font-medium text-foreground/85 dark:border-gold-400/28 dark:bg-espresso-900/70"
          >
            <UserRound
              aria-hidden="true"
              className="size-3 text-gold-500 dark:text-gold-300"
            />
            {tag}
          </li>
        ))}
      </ul>
      <p className="mt-3 inline-flex flex-wrap items-center gap-x-2 gap-y-1 text-[13px] font-medium text-foreground/75">
        <Languages
          aria-hidden="true"
          className="size-4 text-gold-500 dark:text-gold-300"
        />
        {astrologer.languages.join(" · ")}
        <span aria-hidden="true" className="text-foreground/30">
          |
        </span>
        {availabilityLabel(astrologer.availability)}
      </p>

      <div className="mt-7 flex flex-col gap-3 sm:flex-row">
        <BookConsultationButton className="w-full sm:w-auto" />
        <Button
          type="button"
          variant="outline"
          onClick={scrollToOverview}
          className="border-gold-500/40 bg-ivory-50/70 text-foreground hover:border-gold-500/60 hover:bg-ivory-50 dark:border-gold-400/40 dark:bg-espresso-900/50 dark:hover:bg-espresso-800 dark:hover:text-ivory-50"
        >
          About This Astrologer
        </Button>
      </div>
    </FullBleedHero>
  );
}
