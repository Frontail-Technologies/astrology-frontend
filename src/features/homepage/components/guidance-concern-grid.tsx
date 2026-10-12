import Link from "next/link";
import {
  ArrowRight,
  BriefcaseBusiness,
  Compass,
  Heart,
  Landmark,
  ScrollText,
  UsersRound,
} from "lucide-react";

import { Container } from "@/components/layout/container";
import { SectionHeading } from "./section-heading";

const concerns = [
  {
    title: "Love & Relationships",
    description: "Connection, communication, and relationship patterns.",
    icon: Heart,
  },
  {
    title: "Career",
    description: "Work direction, strengths, and professional choices.",
    icon: BriefcaseBusiness,
  },
  {
    title: "Marriage",
    description: "Marriage questions and compatibility perspectives.",
    icon: UsersRound,
  },
  {
    title: "Finance & Business",
    description: "Reflect on priorities, timing, and practical decisions.",
    icon: Landmark,
  },
  {
    title: "Kundli Guidance",
    description: "Understand chart themes and planetary placements.",
    icon: ScrollText,
  },
  {
    title: "General Guidance",
    description: "Explore broader questions with an astrologer.",
    icon: Compass,
  },
] as const;

export function GuidanceConcernGrid() {
  return (
    <section
      id="guidance-concerns"
      aria-labelledby="guidance-concern-heading"
      className="border-y border-gold-500/10 bg-surface-muted/55 text-foreground dark:border-gold-400/10 dark:bg-espresso-900/35"
    >
      <Container className="max-w-[1440px] py-10 sm:py-12 lg:py-14">
        <SectionHeading
          eyebrow="Find your focus"
          headingId="guidance-concern-heading"
          title="Find the right guidance for you"
          description="Choose what you want help with and explore relevant astrologers."
        />

        <div className="mt-7 grid grid-cols-2 gap-3 sm:mt-8 sm:gap-4 lg:grid-cols-3 lg:gap-5">
          {concerns.map(({ title, description, icon: Icon }) => (
            <Link
              className="group flex min-h-40 min-w-0 flex-col rounded-lg border border-gold-500/16 bg-white p-4 outline-none transition-[border-color,transform,box-shadow] duration-200 hover:-translate-y-0.5 hover:border-gold-500/38 hover:shadow-[0_10px_28px_-18px_rgba(38,28,19,0.38)] focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-surface-muted dark:border-gold-400/16 dark:bg-espresso-900 dark:hover:border-gold-400/38 dark:focus-visible:ring-offset-espresso-900 sm:min-h-36 sm:p-5"
              href="/astrologers"
              key={title}
            >
              <span className="grid size-9 place-items-center rounded-md bg-gold-300/22 text-saffron-600 dark:bg-gold-400/12 dark:text-gold-300">
                <Icon aria-hidden="true" className="size-4.5" />
              </span>
              <h3 className="mt-3 text-sm font-semibold leading-5 sm:text-base">
                {title}
              </h3>
              <p className="mt-1.5 line-clamp-3 text-xs leading-5 text-muted-foreground sm:text-[13px]">
                {description}
              </p>
              <span className="mt-auto inline-flex items-center gap-1.5 pt-3 text-xs font-semibold text-conversion-500 dark:text-gold-300">
                Find guidance
                <ArrowRight
                  aria-hidden="true"
                  className="size-3.5 transition-transform group-hover:translate-x-0.5"
                />
              </span>
            </Link>
          ))}
        </div>
      </Container>
    </section>
  );
}
