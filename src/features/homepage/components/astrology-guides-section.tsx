"use client";

import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";

type GuideMotif = "chart" | "moon" | "match";

type Guide = {
  slug: string;
  category: string;
  title: string;
  description: string;
  motif: GuideMotif;
};

// Editorial fixture topics for UI preview — no article bodies, views or counts.
const GUIDES: Guide[] = [
  {
    slug: "understanding-your-birth-chart",
    category: "Basics",
    title: "Understanding Your Birth Chart",
    description:
      "How houses, planets and signs come together to describe a chart.",
    motif: "chart",
  },
  {
    slug: "what-your-moon-sign-represents",
    category: "Zodiac",
    title: "What Your Moon Sign Represents",
    description:
      "Why the Moon sign speaks to emotion, instinct and inner life.",
    motif: "moon",
  },
  {
    slug: "beginners-guide-to-kundli-matching",
    category: "Compatibility",
    title: "A Beginner's Guide to Kundli Matching",
    description: "The ideas behind guna milan and how compatibility is read.",
    motif: "match",
  },
];

function GuideVisual({ motif }: { motif: GuideMotif }) {
  return (
    <div
      aria-hidden="true"
      className="relative h-32 overflow-hidden rounded-xl border border-gold-400/18 bg-editorial-900 sm:h-36 lg:h-40"
    >
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_75%_15%,color-mix(in_srgb,var(--indigo-700)_30%,transparent),transparent_65%)]" />
      <span className="absolute inset-0 bg-[radial-gradient(circle_at_10%_90%,color-mix(in_srgb,var(--gold-400)_10%,transparent),transparent_55%)]" />
      {motif === "chart" && (
        <>
          <span className="absolute left-8 top-1/2 size-28 -translate-y-1/2 rounded-full border border-gold-400/25" />
          <span className="absolute left-8 top-1/2 size-20 -translate-y-1/2 rounded-full border border-gold-400/18" />
          <span className="absolute left-14 top-1/2 size-16 -translate-y-1/2 rotate-45 rounded-[4px] border border-gold-300/40" />
          <span className="absolute left-[4.7rem] top-6 size-1.5 rounded-full bg-gold-300/80" />
          <span className="absolute left-24 bottom-7 size-1 rounded-full bg-gold-400/70" />
          <span className="absolute left-10 top-8 size-1 rounded-full bg-ivory-100/60" />
        </>
      )}
      {motif === "moon" && (
        <>
          <span className="absolute left-10 top-1/2 size-24 -translate-y-1/2 rounded-full border border-gold-400/15" />
          <span className="absolute left-10 top-1/2 size-20 -translate-y-1/2 rounded-full bg-gold-300/18 shadow-[inset_-14px_0_0_0_var(--editorial-900)]" />
          <span className="absolute right-14 top-6 size-1.5 rounded-full bg-gold-300/80" />
          <span className="absolute right-24 top-12 size-1 rounded-full bg-ivory-100/60" />
          <span className="absolute bottom-8 right-10 size-1 rounded-full bg-gold-400/70" />
        </>
      )}
      {motif === "match" && (
        <>
          <span className="absolute left-8 top-1/2 size-20 -translate-y-1/2 rounded-full border border-gold-400/25" />
          <span className="absolute left-20 top-1/2 size-20 -translate-y-1/2 rounded-full border border-gold-400/18" />
          <span className="absolute left-[4.25rem] top-1/2 size-1.5 -translate-y-1/2 rounded-full bg-gold-300/80" />
          <span className="absolute left-7 top-6 size-1 rounded-full bg-ivory-100/60" />
          <span className="absolute right-8 bottom-7 size-1 rounded-full bg-gold-400/70" />
        </>
      )}
    </div>
  );
}

export function AstrologyGuidesSection() {
  return (
    <section
      id="astrology-guides"
      aria-labelledby="astrology-guides-heading"
      className="text-foreground"
    >
      <Container className="max-w-[1440px] py-12 sm:py-14 lg:py-16">
        <SectionHeading
          eyebrow="Learn"
          title="Astrology Guides"
          headingId="astrology-guides-heading"
          description="Practical guides to understand charts, zodiac signs, compatibility and planetary influences."
          action={
            <Button
              type="button"
              variant="outline"
              onClick={() =>
                toast("Guides open when the Articles experience is connected.")
              }
              data-route="/articles"
              className="w-full transition-all duration-200 hover:-translate-y-px hover:border-gold-500/45 sm:w-auto"
            >
              Explore All Guides
              <ArrowRight aria-hidden="true" />
            </Button>
          }
        />

        <div className="mt-7 grid gap-5 sm:mt-8 md:grid-cols-3 md:gap-6">
          {GUIDES.map((guide) => (
            <article
              key={guide.slug}
              className="group relative flex h-full flex-col rounded-2xl border border-border bg-white p-4 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-gold-500/35 dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(239,209,154,0.08)] dark:hover:border-gold-400/35 has-focus-visible:-translate-y-0.5 has-focus-visible:border-gold-500/45 has-focus-visible:ring-2 has-focus-visible:ring-gold-400 has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background"
            >
              <GuideVisual motif={guide.motif} />
              <p className="mt-4 text-[11px] font-semibold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
                {guide.category}
              </p>
              <h3 className="mt-1.5 font-sans text-[15px] font-semibold leading-snug text-foreground lg:text-base">
                <button
                  type="button"
                  data-route={`/article/${guide.slug}`}
                  onClick={() =>
                    toast(
                      "This guide opens when the Articles experience is connected.",
                    )
                  }
                  aria-label={`${guide.title} — read guide`}
                  className="outline-none after:absolute after:inset-0 after:content-['']"
                >
                  {guide.title}
                </button>
              </h3>
              <p className="mt-2 text-[13px] leading-5 text-muted-foreground">
                {guide.description}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-4 text-[13px] font-semibold text-gold-500 transition-transform duration-200 group-hover:translate-x-0.5 dark:text-gold-300">
                Read Guide
                <ArrowRight aria-hidden="true" className="size-4" />
              </span>
            </article>
          ))}
        </div>
      </Container>
    </section>
  );
}
