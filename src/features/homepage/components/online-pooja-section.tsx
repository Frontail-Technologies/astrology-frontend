"use client";

import type { CSSProperties } from "react";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { DiyaFlameAccent } from "@/components/shared/diya-flame-accent";
import { cn } from "@/lib/utils";
import { PoojaCard } from "@/features/pooja/components/pooja-card";
import { featuredPoojas } from "@/features/pooja/data/poojas";

// Two local accent petals — the homepage page-backdrop carries only gold dust,
// so the Online Pooja section gets its own faint marigold/rose fall.
const LOCAL_PETALS = [
  {
    src: "/assets/astrology/ambient/petals/marigold-petal-03.png",
    style: {
      left: "4%",
      width: "22px",
      "--ambient-duration": "17s",
      "--ambient-delay": "-6s",
      "--ambient-drift": "22px",
      "--ambient-spin": "210deg",
      "--ambient-max-opacity": 0.44,
    } as CSSProperties & Record<string, string | number>,
  },
  {
    src: "/assets/astrology/ambient/petals/rose-petal-04.png",
    style: {
      left: "93%",
      width: "18px",
      "--ambient-duration": "20s",
      "--ambient-delay": "-13s",
      "--ambient-drift": "-16px",
      "--ambient-spin": "-190deg",
      "--ambient-max-opacity": 0.38,
    } as CSSProperties & Record<string, string | number>,
  },
];

export function OnlinePoojaSection() {
  return (
    <section
      id="online-pooja"
      aria-labelledby="online-pooja-heading"
      className="relative overflow-hidden text-foreground"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block dark:bg-[radial-gradient(ellipse_55%_50%_at_18%_30%,color-mix(in_srgb,var(--conversion-500)_6%,transparent),transparent_68%)]"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        {LOCAL_PETALS.map((petal) => (
          <img
            key={petal.src}
            src={petal.src}
            alt=""
            loading="lazy"
            decoding="async"
            className="ambient-petal absolute top-[-6%]"
            style={petal.style}
          />
        ))}
      </div>
      <DiyaFlameAccent className="left-[-0.5rem] top-14 sm:left-[-1rem] sm:top-20" />
      <Container className="max-w-[1440px] py-12 sm:py-14 lg:py-16">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="max-w-xl">
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-gold-500/50" />
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
                Ritual
              </span>
            </div>
            <h2
              id="online-pooja-heading"
              className="mt-3 text-[26px] font-semibold leading-tight sm:text-3xl lg:text-[32px]"
            >
              Online Pooja &amp; Rituals
            </h2>
            <p className="mt-3 text-sm leading-6 text-foreground/75 sm:text-base">
              Book meaningful Vedic rituals and pujas with guided preparation
              and clear ceremony details.
            </p>
          </div>
          <Link
            href="/pooja"
            className={cn(
              buttonVariants({ variant: "discovery" }),
              "w-full shrink-0 transition-all duration-200 hover:-translate-y-px sm:w-auto",
            )}
          >
            Explore Online Pooja
            <ArrowRight aria-hidden="true" />
          </Link>
        </div>

        <div className="mt-7 grid grid-cols-2 gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-4">
          {featuredPoojas.slice(0, 4).map((pooja) => (
            <PoojaCard key={pooja.slug} pooja={pooja} />
          ))}
        </div>
      </Container>
    </section>
  );
}
