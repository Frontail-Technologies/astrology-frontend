"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { isCalculatorReady } from "../data/calculators";
import type { CalculatorDefinition } from "../types/calculator";

type RelatedCalculatorsProps = {
  calculators: CalculatorDefinition[];
};

const CARD_CLASS =
  "group relative flex h-full flex-col rounded-2xl border border-gold-500/22 bg-white p-4 text-left shadow-[0_1px_2px_rgba(23,32,51,0.05),0_4px_14px_-6px_rgba(23,32,51,0.1)] transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-gold-500/40 has-focus-visible:-translate-y-0.5 has-focus-visible:border-gold-500/45 has-focus-visible:ring-2 has-focus-visible:ring-gold-400 has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background dark:border-gold-400/16 dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.025)] dark:hover:border-gold-400/30 dark:hover:bg-espresso-700";

export function RelatedCalculators({ calculators }: RelatedCalculatorsProps) {
  if (calculators.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-calculators-heading">
      <div className="flex items-end justify-between gap-4">
        <div>
          <h2
            id="related-calculators-heading"
            className="font-display text-[26px] font-semibold text-foreground sm:text-[30px]"
          >
            Related Calculators
          </h2>
          <p className="mt-1.5 text-[14px] leading-6 text-muted-foreground">
            You may also be interested in these astrology calculators.
          </p>
        </div>
        <Link
          href="/calculators"
          className="hidden shrink-0 items-center gap-1 text-[13px] font-semibold text-gold-500 hover:text-gold-500/80 dark:text-gold-300 sm:inline-flex"
        >
          View All Calculators
          <ArrowRight aria-hidden="true" className="size-3.5" />
        </Link>
      </div>

      <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
        {calculators.map((calculator) => {
          const ready = isCalculatorReady(calculator);
          const route = `/calculators/${calculator.slug}`;

          return (
            <article key={calculator.slug} className={CARD_CLASS}>
              <div className="grid place-items-center rounded-xl bg-gold-300/20 py-4 transition-colors duration-200 group-hover:bg-gold-300/30 dark:bg-gold-400/10">
                <Image
                  src={calculator.imageSrc}
                  alt={`${calculator.name} illustration`}
                  width={280}
                  height={280}
                  className="illustration-lift size-[92px] object-contain"
                />
              </div>
              <h3 className="mt-3 font-sans text-[14px] font-bold leading-tight text-foreground">
                {ready ? (
                  <Link
                    href={route}
                    className="outline-none after:absolute after:inset-0 after:content-['']"
                  >
                    {calculator.name}
                  </Link>
                ) : (
                  <button
                    type="button"
                    data-route={route}
                    onClick={() => toast(`${calculator.name} is coming next.`)}
                    aria-label={`Open ${calculator.name}`}
                    className="text-left outline-none after:absolute after:inset-0 after:content-['']"
                  >
                    {calculator.name}
                  </button>
                )}
              </h3>
              <p className="mt-1.5 line-clamp-2 text-[12px] leading-5 text-muted-foreground">
                {calculator.shortDescription}
              </p>
              <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-gold-500 dark:text-gold-300">
                Open Calculator
                <ArrowRight aria-hidden="true" className="size-3.5" />
              </span>
            </article>
          );
        })}
      </div>
    </section>
  );
}
