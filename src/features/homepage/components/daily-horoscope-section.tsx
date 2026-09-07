"use client";

import Image from "next/image";
import { useState } from "react";
import { toast } from "sonner";

import { Container } from "@/components/layout/container";
import { SectionChakra } from "@/components/shared/section-chakra";
import { cn } from "@/lib/utils";
import { SectionHeading } from "./section-heading";

type ZodiacSign = {
  name: string;
  slug: string;
  dateRange: string;
  imageSrc: string;
};

const ZODIAC_SIGNS: ZodiacSign[] = [
  {
    name: "Aries",
    slug: "aries",
    dateRange: "Mar 21 - Apr 19",
    imageSrc: "/assets/astrology/zodiac/zodiac-aries.png",
  },
  {
    name: "Taurus",
    slug: "taurus",
    dateRange: "Apr 20 - May 20",
    imageSrc: "/assets/astrology/zodiac/zodiac-taurus.png",
  },
  {
    name: "Gemini",
    slug: "gemini",
    dateRange: "May 21 - Jun 20",
    imageSrc: "/assets/astrology/zodiac/zodiac-gemini.png",
  },
  {
    name: "Cancer",
    slug: "cancer",
    dateRange: "Jun 21 - Jul 22",
    imageSrc: "/assets/astrology/zodiac/zodiac-cancer.png",
  },
  {
    name: "Leo",
    slug: "leo",
    dateRange: "Jul 23 - Aug 22",
    imageSrc: "/assets/astrology/zodiac/zodiac-leo.png",
  },
  {
    name: "Virgo",
    slug: "virgo",
    dateRange: "Aug 23 - Sep 22",
    imageSrc: "/assets/astrology/zodiac/zodiac-virgo.png",
  },
  {
    name: "Libra",
    slug: "libra",
    dateRange: "Sep 23 - Oct 22",
    imageSrc: "/assets/astrology/zodiac/zodiac-libra.png",
  },
  {
    name: "Scorpio",
    slug: "scorpio",
    dateRange: "Oct 23 - Nov 21",
    imageSrc: "/assets/astrology/zodiac/zodiac-scorpio.png",
  },
  {
    name: "Sagittarius",
    slug: "sagittarius",
    dateRange: "Nov 22 - Dec 21",
    imageSrc: "/assets/astrology/zodiac/zodiac-sagittarius.png",
  },
  {
    name: "Capricorn",
    slug: "capricorn",
    dateRange: "Dec 22 - Jan 19",
    imageSrc: "/assets/astrology/zodiac/zodiac-capricorn.png",
  },
  {
    name: "Aquarius",
    slug: "aquarius",
    dateRange: "Jan 20 - Feb 18",
    imageSrc: "/assets/astrology/zodiac/zodiac-aquarius.png",
  },
  {
    name: "Pisces",
    slug: "pisces",
    dateRange: "Feb 19 - Mar 20",
    imageSrc: "/assets/astrology/zodiac/zodiac-pisces.png",
  },
];

export function DailyHoroscopeSection() {
  const [activeSlug, setActiveSlug] = useState("aries");
  const active =
    ZODIAC_SIGNS.find((sign) => sign.slug === activeSlug) ?? ZODIAC_SIGNS[0];

  function selectSign(sign: ZodiacSign) {
    setActiveSlug(sign.slug);
    toast(
      `${sign.name} horoscope opens when the Horoscope experience is connected.`,
    );
  }

  return (
    <section
      id="daily-horoscope"
      aria-labelledby="daily-horoscope-heading"
      className="relative overflow-hidden text-foreground"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_62%_46%_at_50%_44%,color-mix(in_srgb,var(--gold-500)_7%,transparent),transparent_70%)] dark:bg-[radial-gradient(ellipse_60%_45%_at_50%_42%,color-mix(in_srgb,var(--gold-400)_7%,transparent),transparent_70%)]"
      />
      <SectionChakra
        faint
        className="-z-10 right-[-15rem] top-1/2 w-[32rem] -translate-y-1/2"
      />
      <Container className="max-w-[1440px] py-12 sm:py-14 lg:py-14">
        <SectionHeading
          eyebrow="Horoscope"
          title="Your Daily Horoscope"
          headingId="daily-horoscope-heading"
          description="Explore today's guidance by zodiac sign and see what each sign is focused on right now."
        />

        <div
          role="group"
          aria-label="Choose a zodiac sign"
          className="mt-8 grid grid-cols-3 gap-x-4 gap-y-7 sm:mt-9 sm:grid-cols-4 sm:gap-x-8 sm:gap-y-8 lg:grid-cols-6 lg:gap-x-10 lg:gap-y-9"
        >
          {ZODIAC_SIGNS.map((sign) => {
            const isActive = sign.slug === active.slug;

            return (
              <button
                key={sign.slug}
                type="button"
                onClick={() => selectSign(sign)}
                data-route={`/horoscope/${sign.slug}`}
                aria-pressed={isActive}
                className={cn(
                  "group flex min-h-[100px] flex-col items-center justify-start gap-0.5 px-1 text-center outline-none",
                  "transition-transform duration-200 ease-out hover:-translate-y-0.5 focus-visible:-translate-y-0.5 focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-4 focus-visible:ring-offset-surface-muted",
                  "sm:min-h-[114px] sm:gap-1 lg:min-h-[128px]",
                )}
              >
                <Image
                  alt={`${sign.name} zodiac illustration`}
                  src={sign.imageSrc}
                  width={164}
                  height={164}
                  className={cn(
                    "illustration-lift h-20 w-20 object-contain transition-transform duration-200 group-hover:scale-[1.04] sm:h-16 sm:w-16 lg:h-52 lg:w-52",
                    isActive && "scale-[1.06]",
                  )}
                />
                <span
                  className={cn(
                    "relative text-[13px] font-semibold leading-tight text-foreground transition-colors duration-200 group-hover:text-gold-500 dark:group-hover:text-gold-300 sm:text-sm",
                    isActive && "text-gold-500 dark:text-gold-300",
                  )}
                >
                  {sign.name}
                  {isActive ? (
                    <span
                      aria-hidden="true"
                      className="absolute left-1/2 top-[calc(100%+4px)] size-1 -translate-x-1/2 rounded-full bg-gold-500 dark:bg-gold-300"
                    />
                  ) : null}
                </span>
                <span className="text-[11px] leading-tight text-muted-foreground sm:text-xs">
                  {sign.dateRange}
                </span>
              </button>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
