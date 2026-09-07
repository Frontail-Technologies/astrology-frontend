import { ListChecks, ShieldCheck, Sparkles } from "lucide-react";

import { FullBleedHero } from "@/components/layout/full-bleed-hero";
import { SpiritualAmbientLayer } from "@/components/shared/spiritual-ambient-layer";
import { getCalculatorHeroBackground } from "../data/calculators";
import type { CalculatorDefinition } from "../types/calculator";

const UTILITY_CUES = [
  { icon: Sparkles, label: "Simple inputs" },
  { icon: ListChecks, label: "Clear result structure" },
  { icon: ShieldCheck, label: "Privacy-conscious details" },
];

type CalculatorDetailHeroProps = {
  calculator: CalculatorDefinition;
};

export function CalculatorDetailHero({ calculator }: CalculatorDetailHeroProps) {
  return (
    <FullBleedHero
      labelledBy="calculator-detail-heading"
      bgImage={getCalculatorHeroBackground(calculator)}
      foregroundImage={calculator.imageSrc}
      foregroundAlt={`${calculator.name} illustration`}
      ambientHalo
      ambientSlot={<SpiritualAmbientLayer variant="calculator" />}
      contentClassName="max-w-[620px]"
      contentBoxClassName="min-h-[430px] pb-16 pt-20 sm:min-h-[340px] sm:pt-20 lg:min-h-[350px] lg:pb-20"
      crumbs={[
        { label: "Home", href: "/" },
        { label: "Calculators", href: "/calculators" },
        { label: calculator.name },
      ]}
    >
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-gold-500 dark:text-gold-300">
        Astrology Calculator
      </span>
      <h1
        id="calculator-detail-heading"
        className="mt-3 font-display text-[34px] font-semibold leading-[1.05] text-foreground sm:text-[42px] lg:text-[48px]"
      >
        {calculator.name}
      </h1>
      <p className="mt-3 max-w-xl text-[15px] leading-7 text-muted-foreground">
        {calculator.shortDescription}
      </p>

      <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2">
        {UTILITY_CUES.map(({ icon: Icon, label }) => (
          <li
            key={label}
            className="inline-flex items-center gap-1.5 text-[13px] font-medium text-foreground/75"
          >
            <Icon
              aria-hidden="true"
              className="size-4 text-gold-500 dark:text-gold-300"
            />
            {label}
          </li>
        ))}
      </ul>
    </FullBleedHero>
  );
}
