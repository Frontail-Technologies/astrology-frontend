"use client";

import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { DiyaFlameAccent } from "@/components/shared/diya-flame-accent";
import { cn } from "@/lib/utils";

export function PoojaDetailCta() {
  return (
    <section
      aria-labelledby="pooja-detail-cta-heading"
      className="relative w-full overflow-hidden bg-[linear-gradient(120deg,#1b130c,#241a10_60%,#1b130c)] text-ivory-50"
    >
      {/* Gold ritual line-art detail */}
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-16 top-1/2 hidden size-64 -translate-y-1/2 rounded-full border border-gold-400/15 sm:block"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 top-1/2 hidden size-40 -translate-y-1/2 rounded-full border border-gold-400/12 sm:block"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-24 top-1/2 hidden size-1.5 -translate-y-1/2 rounded-full bg-gold-400/50 sm:block"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,color-mix(in_srgb,var(--conversion-600)_16%,transparent),transparent_60%)]"
      />
      <DiyaFlameAccent
        size={46}
        className="bottom-2 left-4 sm:bottom-3 sm:left-8"
      />

      <Container className="relative max-w-[1320px]">
        <div className="flex min-h-[170px] flex-col justify-center gap-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:py-9">
          <div className="max-w-xl">
            <h2
              id="pooja-detail-cta-heading"
              className="font-display text-2xl font-semibold sm:text-[28px]"
            >
              Not sure if this Pooja fits what you&rsquo;re looking for?
            </h2>
            <p className="mt-2 text-sm leading-6 text-ivory-50/80">
              Talk to an astrologer for general guidance before sending a
              request.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:shrink-0 sm:flex-row">
            <Button
              type="button"
              variant="conversion"
              data-route="/astrologers"
              onClick={() =>
                toast("Astrologer consultation experience is coming soon.")
              }
              className="transition-transform duration-200 hover:-translate-y-px"
            >
              <MessagesSquare aria-hidden="true" />
              Talk to Astrologer
            </Button>
            <Link
              href="/pooja"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-gold-400/45 bg-transparent text-ivory-50 transition-colors duration-200 hover:border-gold-400/65 hover:bg-ivory-50/10 hover:text-ivory-50",
              )}
            >
              Explore All Poojas
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
