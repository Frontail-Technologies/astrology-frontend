"use client";

import Link from "next/link";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

export function AstrologerGuidanceCta() {
  return (
    <section aria-labelledby="astrologer-guidance-heading">
      <Container className="max-w-[1440px] py-12 sm:py-14 lg:py-16">
        <div className="relative overflow-hidden rounded-2xl border border-gold-400/28">
          <span
            aria-hidden="true"
            style={{
              backgroundImage:
                "url('/assets/astrology/astrologers/hero-visual-wide.png')",
            }}
            className="pointer-events-none absolute inset-0 bg-cover bg-right sm:bg-center"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-0 bg-gradient-to-r from-obsidian-950/90 via-obsidian-950/62 to-obsidian-950/20"
          />
          <span
            aria-hidden="true"
            className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full border border-gold-400/15"
          />

          <div className="relative flex flex-col gap-5 p-6 text-ivory-50 sm:flex-row sm:items-center sm:justify-between sm:gap-8 sm:p-8 lg:p-10">
            <div className="max-w-lg">
              <h2
                id="astrologer-guidance-heading"
                className="text-xl font-semibold sm:text-[26px]"
              >
                Talk to an experienced astrologer
              </h2>
              <p className="mt-2 text-sm leading-6 text-ivory-50/80">
                Get personal guidance on career, relationships, timing and life
                decisions from verified Vedic astrologers.
              </p>
            </div>
            <div className="flex flex-col gap-3 sm:shrink-0 sm:flex-row">
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
              <Button
                type="button"
                variant="conversion"
                onClick={() =>
                  toast("Astrologer consultation experience is coming soon.")
                }
                data-route="/astrologers"
                className="shrink-0 transition-all duration-200 hover:-translate-y-px"
              >
                <MessagesSquare aria-hidden="true" />
                Talk to Astrologer
              </Button>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
