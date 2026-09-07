import type { Metadata } from "next";

import { CalculatorHub } from "@/features/calculators/components/calculator-hub";

export const metadata: Metadata = {
  title: "Astrology Calculators | Astrology",
  description:
    "Explore astrology calculators for relationships, birth charts, planetary influences, numerology and more.",
};

export default function CalculatorsPage() {
  return <CalculatorHub />;
}
