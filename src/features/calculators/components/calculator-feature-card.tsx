"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { toast } from "sonner";

import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { isCalculatorReady } from "../data/calculators";
import type { CalculatorDefinition } from "../types/calculator";

type CalculatorFeatureCardProps = {
  calculator: CalculatorDefinition;
};

const OPEN_BTN_CLASS =
  "w-full border-gold-500/45 bg-gold-300/35 text-midnight-950 transition-colors duration-200 hover:border-gold-500/65 hover:bg-gold-300/55 dark:border-gold-400/35 dark:bg-gold-400/12 dark:text-ivory-50 dark:hover:border-gold-400/50 dark:hover:bg-gold-400/20";

export function CalculatorFeatureCard({ calculator }: CalculatorFeatureCardProps) {
  const route = `/calculators/${calculator.slug}`;
  const ready = isCalculatorReady(calculator);

  return (
    <article className="group relative flex h-full flex-col rounded-2xl border border-gold-500/22 bg-ivory-50 p-5 text-foreground shadow-[0_1px_2px_rgba(23,32,51,0.05),0_6px_18px_-6px_rgba(23,32,51,0.1)] transition-[transform,border-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-gold-500/45 dark:border-gold-400/20 dark:bg-espresso-900 dark:shadow-none dark:hover:border-gold-400/42 dark:hover:bg-espresso-700">
      <div className="relative flex h-44 items-center justify-center">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_44%,color-mix(in_srgb,var(--gold-500)_14%,transparent),color-mix(in_srgb,var(--gold-500)_4%,transparent)_46%,transparent_70%)] dark:bg-[radial-gradient(circle_at_50%_42%,color-mix(in_srgb,var(--gold-400)_14%,transparent),transparent_68%)]"
        />
        <Image
          src={calculator.imageSrc}
          alt={`${calculator.name} illustration`}
          width={320}
          height={320}
          className="illustration-lift relative size-[132px] object-contain transition-transform duration-200 group-hover:scale-[1.03] sm:size-[150px]"
        />
      </div>
      <h3 className="mt-3 font-sans text-base font-bold text-foreground">
        {calculator.name}
      </h3>
      <p className="mt-1 text-[13px] leading-5 text-muted-foreground">
        {calculator.shortDescription}
      </p>
      <div className="mt-auto pt-4">
        {ready ? (
          <Link
            href={route}
            aria-label={`Open ${calculator.name}`}
            className={cn(buttonVariants({ variant: "outline" }), OPEN_BTN_CLASS)}
          >
            Open Calculator
            <ArrowRight
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Link>
        ) : (
          <Button
            type="button"
            variant="outline"
            onClick={() => toast(`${calculator.name} is coming next.`)}
            data-route={route}
            aria-label={`Open ${calculator.name}`}
            className={OPEN_BTN_CLASS}
          >
            Open Calculator
            <ArrowRight
              aria-hidden="true"
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </Button>
        )}
      </div>
    </article>
  );
}
