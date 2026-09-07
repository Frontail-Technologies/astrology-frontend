"use client";

import Image from "next/image";
import { ArrowRight, MessagesSquare } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function PoojaGuidanceCta() {
  return (
    <section
      aria-labelledby="pooja-guidance-heading"
      style={{
        backgroundImage:
          "linear-gradient(120deg, color-mix(in srgb, var(--conversion-600) 24%, var(--obsidian-950)), color-mix(in srgb, var(--conversion-600) 46%, var(--obsidian-950)))",
      }}
      className="relative overflow-hidden rounded-2xl border border-gold-400/30 bg-obsidian-950 text-ivory-50"
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-16 -top-16 size-56 rounded-full border border-gold-400/15"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -left-8 -top-8 size-32 rounded-full border border-gold-400/10"
      />
      <Image
        src="/assets/astrology/pooja/02-festive-puja-entrance.png"
        alt=""
        width={720}
        height={720}
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 bottom-0 hidden h-[118%] w-auto object-contain opacity-95 sm:block"
      />

      <div className="relative max-w-xl p-6 sm:p-8">
        <h2
          id="pooja-guidance-heading"
          className="text-xl font-semibold sm:text-[26px]"
        >
          Not sure which Pooja fits what you&rsquo;re looking for?
        </h2>
        <p className="mt-2 text-sm leading-6 text-ivory-50/80">
          Explore the available rituals or speak with an astrologer for general
          guidance.
        </p>
        <div className="mt-5 flex flex-col gap-3 sm:flex-row">
          <a
            href="#pooja-catalog"
            className={cn(
              buttonVariants({ variant: "outline" }),
              "border-gold-400/45 bg-transparent text-ivory-50 transition-colors duration-200 hover:border-gold-400/65 hover:bg-ivory-50/10 hover:text-ivory-50",
            )}
          >
            Browse All Poojas
            <ArrowRight aria-hidden="true" />
          </a>
          <Button
            type="button"
            variant="conversion"
            onClick={() =>
              toast("Astrologer consultation experience is coming soon.")
            }
            data-route="/astrologers"
            className="transition-transform duration-200 hover:-translate-y-px"
          >
            <MessagesSquare aria-hidden="true" />
            Talk to Astrologer
          </Button>
        </div>
      </div>
    </section>
  );
}
