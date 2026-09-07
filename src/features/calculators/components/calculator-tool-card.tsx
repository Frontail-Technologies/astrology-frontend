"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { isCalculatorReady } from "../data/calculators";
import type { CalculatorDefinition } from "../types/calculator";

type CalculatorToolCardProps = {
  calculator: CalculatorDefinition;
};

export function CalculatorToolCard({ calculator }: CalculatorToolCardProps) {
  const route = `/calculators/${calculator.slug}`;
  const ready = isCalculatorReady(calculator);

  return (
    <article className="group relative flex h-full items-center gap-4 rounded-2xl border border-gold-500/22 bg-white p-4 text-left shadow-[0_1px_2px_rgba(23,32,51,0.04)] transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-gold-500/42 has-focus-visible:-translate-y-0.5 has-focus-visible:border-gold-500/45 has-focus-visible:ring-2 has-focus-visible:ring-gold-400 has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background dark:border-gold-400/16 dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.025)] dark:hover:border-gold-400/30 dark:hover:bg-espresso-700 dark:hover:shadow-[0_10px_32px_rgba(0,0,0,0.24),0_0_26px_color-mix(in_srgb,var(--gold-400)_5%,transparent)]">
      <span className="grid size-[76px] shrink-0 place-items-center rounded-xl border border-gold-500/15 bg-gold-300/30 transition-colors duration-200 group-hover:bg-gold-300/45 dark:border-gold-400/15 dark:bg-gold-400/10 dark:group-hover:bg-gold-400/16">
        <Image
          src={calculator.imageSrc}
          alt={`${calculator.name} illustration`}
          width={144}
          height={144}
          className="illustration-lift size-[54px] object-contain transition-transform duration-200 group-hover:scale-[1.03]"
        />
      </span>
      <div className="min-w-0 flex-1">
        <h3 className="font-sans text-sm font-semibold text-foreground">
          {ready ? (
            <Link
              href={route}
              aria-label={`Open ${calculator.name}`}
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
        <p className="mt-0.5 text-[12px] leading-[1.45] text-muted-foreground">
          {calculator.shortDescription}
        </p>
      </div>
      <ArrowRight
        aria-hidden="true"
        className="size-4 shrink-0 text-muted-foreground transition-transform duration-200 group-hover:translate-x-0.5 group-hover:text-gold-500 dark:group-hover:text-gold-300"
      />
    </article>
  );
}
