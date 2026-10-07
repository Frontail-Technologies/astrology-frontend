import { astrologers } from "@/features/astrologers/data/astrologers";
import { getAstrologerProfileCompleteness } from "@/features/astrologers/selectors/astrologer-domain";
import { calculators } from "@/features/calculators/data/calculators";
import { getCalculatorImplementationState } from "@/features/calculators/selectors/calculator-domain";
import { poojas } from "@/features/pooja/data/poojas";
import { getPoojaContentCompleteness } from "@/features/pooja/selectors/pooja-domain";
import type { InsightsSnapshot } from "./use-insights-data";

/** Current content/catalog state (not date-filtered). */
export function getContentReadiness(s: InsightsSnapshot) {
  const dailyDates = s.horoscopes
    .filter((entry) => entry.period === "daily")
    .map((entry) => entry.date)
    .sort();
  const latestDailyDate = dailyDates.at(-1);
  const latestDaily = s.horoscopes.filter(
    (entry) => entry.period === "daily" && entry.date === latestDailyDate,
  );
  const partial = calculators.filter(
    (calculator) => getCalculatorImplementationState(calculator) === "partial",
  ).length;

  return {
    astrologers: {
      ready: astrologers.filter((item) => getAstrologerProfileCompleteness(item).percentage === 100).length,
      total: astrologers.length,
    },
    poojas: {
      ready: poojas.filter((item) => getPoojaContentCompleteness(item).percentage === 100).length,
      total: poojas.length,
    },
    calculators: { partial, catalogOnly: calculators.length - partial, total: calculators.length },
    articles: {
      published: s.articles.filter((item) => item.status === "published").length,
      scheduled: s.articles.filter((item) => item.status === "scheduled").length,
      draft: s.articles.filter((item) => item.status === "draft").length,
      total: s.articles.length,
    },
    horoscopes: {
      date: latestDailyDate,
      published: latestDaily.filter((entry) => entry.status === "published").length,
      total: latestDaily.length,
    },
  };
}
