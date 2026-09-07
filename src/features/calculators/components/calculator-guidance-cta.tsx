"use client";

import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

export function CalculatorGuidanceCta() {
  return (
    <section
      aria-labelledby="calculator-guidance-heading"
      className="relative w-full overflow-hidden bg-[linear-gradient(120deg,#1b130c,#241a10_60%,#1b130c)] text-ivory-50"
    >
      <span
        aria-hidden="true"
        style={{
          backgroundImage:
            "url('/assets/astrology/calculators/calculator-guidance-cta-bg.png')",
        }}
        className="pointer-events-none absolute inset-0 bg-cover bg-right opacity-70"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-gradient-to-r from-[#1b130c] via-[#1b130c]/80 to-[#1b130c]/25"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_88%_50%,color-mix(in_srgb,var(--conversion-600)_16%,transparent),transparent_58%)]"
      />

      <Container className="relative max-w-[1320px]">
        <div className="flex min-h-[180px] flex-col justify-center gap-5 py-9 sm:flex-row sm:items-center sm:justify-between sm:gap-10">
          <div className="max-w-xl">
            <h2
              id="calculator-guidance-heading"
              className="font-display text-2xl font-semibold sm:text-[28px]"
            >
              Need help understanding your result?
            </h2>
            <p className="mt-2 text-sm leading-6 text-ivory-50/80">
              Talk to an experienced astrologer for personalized guidance on your
              relationship journey.
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
              Talk to an Astrologer
            </Button>
            <Link
              href="/calculators"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-gold-400/45 bg-transparent text-ivory-50 transition-colors duration-200 hover:border-gold-400/65 hover:bg-ivory-50/10 hover:text-ivory-50",
              )}
            >
              Explore All Calculators
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
