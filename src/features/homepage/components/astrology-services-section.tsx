"use client";

import Image from "next/image";
import { toast } from "sonner";

import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

type ServiceSlug =
  | "career-guidance"
  | "relationship-guidance"
  | "kundli-consultation"
  | "ask-an-astrologer"
  | "birth-chart-reading"
  | "marriage-guidance";

type ServiceTile = {
  label: string;
  slug: ServiceSlug;
};

// Discovery categories only — not approved functional flows. No pricing or
// outcome promises attached to any tile.
const SERVICE_TILES: ServiceTile[] = [
  { label: "Career Guidance", slug: "career-guidance" },
  { label: "Relationship Guidance", slug: "relationship-guidance" },
  { label: "Kundli Consultation", slug: "kundli-consultation" },
  { label: "Ask an Astrologer", slug: "ask-an-astrologer" },
  { label: "Birth Chart Reading", slug: "birth-chart-reading" },
  { label: "Marriage Guidance", slug: "marriage-guidance" },
];

export function AstrologyServicesSection() {
  return (
    <section
      id="astrology-services"
      aria-labelledby="astrology-services-heading"
      className="text-foreground"
    >
      <Container className="max-w-[1440px] py-10 sm:py-12 lg:py-12">
        <div className="flex items-center gap-3">
          <span aria-hidden="true" className="h-px w-8 bg-gold-400/50" />
          <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
            Services
          </span>
        </div>
        <div className="mt-2 flex flex-col gap-1 sm:flex-row sm:items-baseline sm:justify-between">
          <h2
            id="astrology-services-heading"
            className="text-xl font-semibold leading-tight sm:text-2xl"
          >
            Astrology Services
          </h2>
          <p className="text-[13px] text-muted-foreground sm:text-sm">
            Focused guidance across the areas that matter most.
          </p>
        </div>

        <ul
          role="list"
          className="mt-6 flex snap-x snap-mandatory gap-4 overflow-x-auto no-scrollbar px-0.5 py-1 sm:grid sm:grid-cols-3 sm:gap-4 sm:overflow-visible sm:p-0 lg:grid-cols-6"
        >
          {SERVICE_TILES.map(({ label, slug }) => (
            <li key={slug} className="w-[46%] shrink-0 snap-start sm:w-auto">
              <button
                type="button"
                data-route={`/services/${slug}`}
                onClick={() =>
                  toast(`${label} opens when this service is connected.`)
                }
                className={cn(
                  "group flex h-full w-full flex-col rounded-2xl border border-gold-500/16 bg-white p-3 text-center",
                  "shadow-[0_1px_2px_rgba(23,32,51,0.04)] transition-[transform,border-color] duration-200 ease-out",
                  "hover:-translate-y-0.5 hover:border-gold-500/45",
                  "focus-visible:-translate-y-0.5 focus-visible:border-gold-500/50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
                  "dark:bg-espresso-900 dark:shadow-none dark:hover:border-gold-400/45",
                )}
              >
                <div className="grid h-32 w-full place-items-center overflow-hidden rounded-xl bg-conversion-500/10 transition-colors duration-200 group-hover:bg-conversion-500/16 dark:bg-conversion-500/12 dark:group-hover:bg-conversion-500/18">
                  <Image
                    src={`/assets/astrology/services/${slug}.png`}
                    alt={`${label} illustration`}
                    width={240}
                    height={240}
                    className="size-[92px] object-contain"
                  />
                </div>
                <span className="mt-2.5 text-[13px] font-semibold leading-tight text-foreground">
                  {label}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
