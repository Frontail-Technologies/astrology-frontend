import { Container } from "@/components/layout/container";
import { getRelatedCalculators } from "../data/calculators";
import type { CalculatorDefinition } from "../types/calculator";
import { CalculatorDetailHero } from "./calculator-detail-hero";
import { CalculatorGuidanceCta } from "./calculator-guidance-cta";
import { CalculatorHowItWorks } from "./calculator-how-it-works";
import { CalculatorWorkspace } from "./calculator-workspace";
import { RelatedCalculators } from "./related-calculators";

type CalculatorDetailPageProps = {
  calculator: CalculatorDefinition;
};

export function CalculatorDetailPage({ calculator }: CalculatorDetailPageProps) {
  const detail = calculator.detail;
  const related = getRelatedCalculators(calculator);

  return (
    <main className="relative text-foreground">
      <CalculatorDetailHero calculator={calculator} />

      {/* Calculator workspace — the primary surface, overlapping the hero */}
      <Container className="relative z-20 max-w-[1280px]">
        <div className="-mt-12 sm:-mt-14 lg:-mt-16">
          <CalculatorWorkspace calculator={calculator} />
        </div>
      </Container>

      <Container className="max-w-[1280px] pt-14 sm:pt-16 lg:pt-20">
        <div className="space-y-14 lg:space-y-16">
          {detail ? (
            <CalculatorHowItWorks steps={detail.howItWorks} />
          ) : null}

          <RelatedCalculators calculators={related} />
        </div>
      </Container>

      <div className="mt-14 lg:mt-16">
        <CalculatorGuidanceCta />
      </div>
    </main>
  );
}
