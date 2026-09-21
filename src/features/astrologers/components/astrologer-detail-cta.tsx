import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";
import { BookConsultationButton } from "./book-consultation-button";

export function AstrologerDetailCta() {
  return (
    <section
      aria-labelledby="astrologer-detail-cta-heading"
      className="relative w-full overflow-hidden bg-[linear-gradient(120deg,#1b130c,#241a10_60%,#1b130c)] text-ivory-50"
    >
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
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_85%_50%,color-mix(in_srgb,var(--conversion-600)_16%,transparent),transparent_60%)]"
      />
      <Container className="relative max-w-[1320px]">
        <div className="flex min-h-[170px] flex-col justify-center gap-5 py-8 sm:flex-row sm:items-center sm:justify-between sm:gap-10 sm:py-9">
          <div className="max-w-xl">
            <h2
              id="astrologer-detail-cta-heading"
              className="font-display text-2xl font-semibold sm:text-[28px]"
            >
              Need personalized guidance?
            </h2>
            <p className="mt-2 text-sm leading-6 text-ivory-50/80">
              Consultations will let you share your questions and receive
              reflective, traditional astrology guidance. Booking opens soon.
            </p>
          </div>
          <div className="flex flex-col gap-3 sm:shrink-0 sm:flex-row">
            <BookConsultationButton className="w-full sm:w-auto" />
            <Link
              href="/astrologers"
              className={cn(
                buttonVariants({ variant: "outline" }),
                "border-gold-400/45 bg-transparent text-ivory-50 transition-colors duration-200 hover:border-gold-400/65 hover:bg-ivory-50/10 hover:text-ivory-50",
              )}
            >
              Browse Astrologers
              <ArrowRight aria-hidden="true" />
            </Link>
          </div>
        </div>
      </Container>
    </section>
  );
}
