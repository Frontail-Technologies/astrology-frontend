import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { CalculatorDetailPage } from "@/features/calculators/components/calculator-detail-page";
import {
  getCalculatorBySlug,
  getReadyCalculators,
} from "@/features/calculators/data/calculators";

type CalculatorDetailRouteProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getReadyCalculators().map((calculator) => ({ slug: calculator.slug }));
}

export async function generateMetadata({
  params,
}: CalculatorDetailRouteProps): Promise<Metadata> {
  const { slug } = await params;
  const calculator = getCalculatorBySlug(slug);

  if (!calculator?.detail) {
    return { title: "Calculator Not Found | Astrology Calculators | Astrology" };
  }

  return {
    title: `${calculator.name} | Astrology`,
    description:
      "Explore an astrology compatibility calculator using birth details in a clear, structured tool experience.",
  };
}

export default async function CalculatorDetailRoute({
  params,
}: CalculatorDetailRouteProps) {
  const { slug } = await params;
  const calculator = getCalculatorBySlug(slug);

  if (!calculator?.detail) {
    notFound();
  }

  return <CalculatorDetailPage calculator={calculator} />;
}
