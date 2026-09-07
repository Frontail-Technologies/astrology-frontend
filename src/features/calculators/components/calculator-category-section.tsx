import { cn } from "@/lib/utils";
import type { CalculatorDefinition } from "../types/calculator";
import { CalculatorToolCard } from "./calculator-tool-card";

type CalculatorCategorySectionProps = {
  title: string;
  headingId: string;
  calculators: CalculatorDefinition[];
  columns?: 2 | 3 | 4;
};

const COLUMN_CLASS: Record<NonNullable<CalculatorCategorySectionProps["columns"]>, string> = {
  2: "sm:grid-cols-2",
  3: "sm:grid-cols-2 lg:grid-cols-3",
  4: "sm:grid-cols-2 lg:grid-cols-4",
};

export function CalculatorCategorySection({
  title,
  headingId,
  calculators,
  columns = 3,
}: CalculatorCategorySectionProps) {
  if (calculators.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby={headingId}>
      <h2
        id={headingId}
        className="text-2xl font-semibold text-foreground sm:text-[26px]"
      >
        {title}
      </h2>
      <div className={cn("mt-5 grid gap-3.5", COLUMN_CLASS[columns])}>
        {calculators.map((calculator) => (
          <CalculatorToolCard key={calculator.slug} calculator={calculator} />
        ))}
      </div>
    </section>
  );
}
