"use client";

import { useEffect, useState } from "react";
import {
  ArrowRight,
  CircleDot,
  Moon,
  Sparkles,
  Star,
  Sunrise,
  Sunset,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { PanchangEmblem } from "./astrology-emblems";

type PanchangRow = {
  label: string;
  icon: React.ComponentType<{ className?: string }>;
};

// Structure only. No values are rendered until a Panchang service is connected.
const PANCHANG_ROWS: PanchangRow[] = [
  { label: "Tithi", icon: Moon },
  { label: "Nakshatra", icon: Star },
  { label: "Yoga", icon: Sparkles },
  { label: "Karana", icon: CircleDot },
  { label: "Sunrise", icon: Sunrise },
  { label: "Sunset", icon: Sunset },
];

export function PanchangSection() {
  const [today, setToday] = useState<string | null>(null);

  useEffect(() => {
    setToday(
      new Date().toLocaleDateString("en-IN", {
        weekday: "long",
        day: "numeric",
        month: "long",
        year: "numeric",
      }),
    );
  }, []);

  return (
    <section
      id="panchang"
      aria-labelledby="panchang-heading"
      className="relative text-foreground"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 hidden dark:block dark:bg-[radial-gradient(ellipse_50%_50%_at_80%_35%,color-mix(in_srgb,var(--gold-400)_6%,transparent),transparent_70%)]"
      />
      <Container className="max-w-[1440px] py-12 sm:py-14 lg:py-16">
        <div className="grid gap-6 lg:grid-cols-[minmax(0,22rem)_1fr] lg:gap-10">
          <div>
            <div className="flex items-center gap-3">
              <span aria-hidden="true" className="h-px w-8 bg-gold-400/50" />
              <span className="text-xs font-bold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
                Panchang
              </span>
            </div>
            <h2
              id="panchang-heading"
              className="mt-3 text-[26px] font-semibold leading-tight sm:text-3xl lg:text-[32px]"
            >
              Today&rsquo;s Panchang
            </h2>

            <div className="mt-5 flex items-center gap-4">
              <PanchangEmblem size={72} />
              <div>
                <p className="text-sm font-semibold text-foreground" suppressHydrationWarning>
                  {today ?? "Today"}
                </p>
                <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">
                  Location not set yet
                </p>
              </div>
            </div>

            <p className="mt-4 max-w-sm text-[13px] leading-5 text-foreground/75">
              A daily celestial calendar — tithi, nakshatra and timing windows —
              once the Panchang service is connected.
            </p>
          </div>

          <div className="rounded-2xl border border-border bg-white p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.6)] dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(239,209,154,0.08)] sm:p-6">
            <dl className="grid grid-cols-2 gap-x-6 gap-y-5 sm:grid-cols-3">
              {PANCHANG_ROWS.map((row) => {
                const Icon = row.icon;
                return (
                  <div key={row.label} className="flex flex-col gap-2">
                    <dt className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      <Icon
                        aria-hidden="true"
                        className="size-3.5 text-gold-500 dark:text-gold-300"
                      />
                      {row.label}
                    </dt>
                    <dd className="font-display text-xl font-semibold text-foreground/45">
                      <span aria-hidden="true">—</span>
                      <span className="sr-only">Not yet available</span>
                    </dd>
                  </div>
                );
              })}
            </dl>

            <div className="mt-6 flex flex-col gap-3 border-t border-border/60 pt-4 sm:flex-row sm:items-center sm:justify-between">
              <p className="text-[13px] leading-5 text-muted-foreground">
                Daily Panchang values will appear here once the calculation
                service is connected.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() =>
                  toast(
                    "The full Panchang opens when the Panchang service is connected.",
                  )
                }
                data-route="/panchang"
                className="w-full shrink-0 transition-all duration-200 hover:-translate-y-px sm:w-auto"
              >
                View Full Panchang
                <ArrowRight aria-hidden="true" />
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
