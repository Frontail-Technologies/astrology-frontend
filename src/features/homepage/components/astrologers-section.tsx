"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";
import { AstrologerCard } from "@/features/astrologers/components/astrologer-card";
import { astrologers } from "@/features/astrologers/data/astrologers";
import { SectionHeading } from "./section-heading";

const HOMEPAGE_ASTROLOGERS = astrologers.slice(0, 4);

export function AstrologersSection() {
  return (
    <section
      id="astrologers"
      aria-labelledby="astrologers-heading"
      className="text-foreground"
    >
      <Container className="max-w-[1440px] py-12 sm:py-14 lg:py-16">
        <SectionHeading
          eyebrow="Consult"
          title="Guidance From Experienced Astrologers"
          headingId="astrologers-heading"
          description="Connect with astrologers across Vedic astrology, Kundli, compatibility and career guidance."
          action={
            <Link
              href="/astrologers"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "w-full transition-all duration-200 hover:-translate-y-px hover:border-gold-500/45 sm:w-auto",
              )}
            >
              View All Astrologers
              <ArrowRight aria-hidden="true" />
            </Link>
          }
        />

        <ul className="mt-7 flex snap-x snap-mandatory gap-4 overflow-x-auto no-scrollbar px-0.5 py-1 sm:mt-8 sm:grid sm:grid-cols-2 sm:gap-5 sm:overflow-visible sm:p-0 lg:grid-cols-4">
          {HOMEPAGE_ASTROLOGERS.map((astrologer) => (
            <li
              key={astrologer.slug}
              className="flex w-[80%] shrink-0 snap-start sm:w-auto"
            >
              <AstrologerCard astrologer={astrologer} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
