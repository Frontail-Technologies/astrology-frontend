"use client";

import Link from "next/link";
import Image from "next/image";
import { ArrowRight, MessagesSquare } from "lucide-react";

import { Button } from "@/components/ui/button";
import type { PoojaDefinition } from "../types/pooja";

type PoojaRequestSummaryProps = {
  pooja: PoojaDefinition;
};

export function PoojaRequestSummary({ pooja }: PoojaRequestSummaryProps) {
  return (
    <div className="lg:sticky lg:top-24">
      <div className="rounded-2xl border border-gold-500/18 bg-white p-5 shadow-[0_1px_2px_rgba(23,32,51,0.05),0_10px_30px_-14px_rgba(23,32,51,0.22)] dark:border-gold-400/18 dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.025)] sm:p-6">
        <div className="flex items-center gap-3.5">
          <span className="grid size-14 shrink-0 place-items-center overflow-hidden rounded-xl bg-conversion-500/10 dark:bg-conversion-500/12">
            <Image
              src={pooja.imageSrc}
              alt=""
              width={120}
              height={120}
              className="size-11 object-contain"
            />
          </span>
          <div className="min-w-0">
            <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
              {pooja.detail.eyebrow ?? "Online Pooja"}
            </p>
            <p className="mt-0.5 font-display text-lg font-semibold leading-tight text-foreground">
              {pooja.name}
            </p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 border-t border-gold-500/14 pt-4 dark:border-gold-400/14">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Format
            </dt>
            <dd className="text-[13px] font-medium text-foreground/85">
              Online request
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Preparation
            </dt>
            <dd className="max-w-[9.5rem] text-right text-[13px] font-medium text-foreground/85">
              Details shared before confirmation
            </dd>
          </div>
        </dl>

        <div className="mt-5 flex flex-col gap-2.5">
          <Button
            type="button"
            variant="conversion"
            disabled
            title="Pooja requests are not available yet"
            className="w-full transition-transform duration-200 hover:-translate-y-px"
          >
            Requests opening soon
          </Button>
          <Button
            asChild
            variant="outline"
            className="w-full border-gold-500/40 text-foreground transition-colors duration-200 hover:border-gold-500/60 hover:bg-gold-300/15 dark:border-gold-400/40 dark:hover:bg-gold-300/10"
          >
            <Link href="/astrologers">
              <MessagesSquare aria-hidden="true" />
              Find Astrologers
              <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>

        <p className="mt-3 text-[11.5px] leading-5 text-muted-foreground">
          Explore the ritual details while online requests are unavailable.
        </p>
      </div>
    </div>
  );
}
