"use client";

import { ArrowRight, MessagesSquare } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";
import {
  AstrologyServiceCard,
  type AstrologyServiceCardProps,
} from "./astrology-service-card";

const consultation = {
  title: "Talk to Astrologer",
  description:
    "Connect with an experienced astrologer for personal guidance.",
  /** Preserved for future activation once the destination route ships. */
  route: "/astrologers",
  previewMessage: "Astrologer consultation experience is coming soon.",
};

const consultationAvatars = [
  { src: "/assets/astrology/avatars/astrologer-01.png", initials: "A1" },
  { src: "/assets/astrology/avatars/astrologer-02.png", initials: "A2" },
  { src: "/assets/astrology/avatars/astrologer-03.png", initials: "A3" },
];

const tools: AstrologyServiceCardProps[] = [
  {
    title: "Kundli",
    description: "Understand your birth chart and planetary placements.",
    emblem: "kundli",
    route: "/kundli",
    previewMessage: "The Kundli experience is coming soon.",
  },
  {
    title: "Horoscope",
    description: "Explore daily guidance for your zodiac sign.",
    emblem: "horoscope",
    route: "/horoscope",
    previewMessage: "The Horoscope experience is coming soon.",
  },
  {
    title: "Compatibility",
    description: "Explore relationship compatibility using birth details.",
    emblem: "compatibility",
    route: "/compatibility",
    previewMessage: "The Compatibility experience is coming soon.",
  },
  {
    title: "Panchang",
    description: "Check tithi, nakshatra and important daily timings.",
    emblem: "panchang",
    route: "/panchang",
    previewMessage: "The Panchang experience is coming soon.",
  },
];

function FeaturedConsultationCard() {
  return (
    <article
      data-route={consultation.route}
      className={cn(
        "group relative flex h-full flex-col justify-between gap-5 overflow-hidden rounded-[20px]",
        "border border-gold-400/25 bg-espresso-900 p-6 text-ivory-50",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.025)] dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.03)]",
        "transition-[transform,border-color] duration-200 ease-out hover:border-gold-400/45",
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 -top-16 size-48 rounded-full border border-gold-400/15 transition-opacity duration-200 group-hover:opacity-100"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-9 -top-9 size-28 rounded-full border border-gold-400/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_0%,color-mix(in_srgb,var(--gold-400)_10%,transparent),transparent_60%)]"
      />

      <div className="relative space-y-4">
        <div aria-hidden="true" className="relative flex items-center">
          <div className="flex -space-x-2.5">
            {consultationAvatars.map((avatar) => (
              <Avatar
                key={avatar.src}
                className="size-9 border border-espresso-900 ring-2 ring-espresso-900"
              >
                <AvatarImage src={avatar.src} alt="" className="object-cover" />
                <AvatarFallback className="bg-espresso-800 text-xs text-ivory-50">
                  {avatar.initials}
                </AvatarFallback>
              </Avatar>
            ))}
          </div>
          <span className="ml-3 h-px w-10 bg-gold-400/30" />
          <span className="ml-1 size-1 rounded-full bg-gold-400/60" />
          <span className="ml-2 size-1.5 rounded-full bg-gold-400/40" />
        </div>
        <div className="space-y-1.5">
          <h3 className="font-sans text-lg font-semibold text-ivory-50 lg:text-xl">
            {consultation.title}
          </h3>
          <p className="max-w-sm text-sm leading-6 text-ivory-50/75">
            {consultation.description}
          </p>
        </div>
      </div>

      <div className="relative space-y-3">
        <span className="inline-flex items-center gap-2 text-xs font-medium text-ivory-50/80">
          <span
            aria-hidden="true"
            className="size-2 rounded-full bg-success"
          />
          Astrologers available now
        </span>
        <Button
          type="button"
          variant="conversion"
          onClick={() => toast(consultation.previewMessage)}
          className="h-11 w-full px-5 transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_color-mix(in_srgb,var(--conversion-500)_22%,transparent)] sm:w-auto"
        >
          <MessagesSquare aria-hidden="true" />
          Talk to Astrologer
          <ArrowRight aria-hidden="true" />
        </Button>
      </div>
    </article>
  );
}

export function ExploreAstrologySection() {
  return (
    <section
      id="explore-astrology"
      aria-labelledby="explore-astrology-heading"
      className="relative text-foreground"
    >
      <Container className="max-w-[1440px] pb-14 pt-8 sm:pb-16 sm:pt-10 lg:pb-20 lg:pt-12">
        <div className="max-w-xl">
          <div className="flex items-center gap-3">
            <span aria-hidden="true" className="h-px w-8 bg-gold-400/50" />
            <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
              Discover
            </span>
          </div>
          <h2
            id="explore-astrology-heading"
            className="mt-3 text-[26px] font-semibold leading-tight sm:text-3xl lg:text-[32px]"
          >
            Explore Astrology
          </h2>
          <p className="mt-3 text-sm leading-6 text-muted-foreground sm:text-base">
            Choose expert guidance or explore astrology tools designed to help
            you understand your chart, relationships and daily influences.
          </p>
        </div>

        <div className="mt-7 grid max-w-[1320px] gap-4 sm:mt-8 sm:gap-5 lg:grid-cols-[1.05fr_2fr] lg:gap-5">
          <FeaturedConsultationCard />
          <div className="grid grid-cols-2 gap-4 sm:gap-5 lg:gap-5">
            {tools.map((tool) => (
              <AstrologyServiceCard key={tool.title} {...tool} />
            ))}
          </div>
        </div>
      </Container>
    </section>
  );
}
