import type { Metadata } from "next";
import { notFound } from "next/navigation";

import { periodLabels, zodiacSigns } from "@/features/horoscopes/data/horoscopes";
import { PublicHoroscopeView } from "@/features/horoscopes/components/public-horoscope-view";
import type { HoroscopePeriod, ZodiacSign } from "@/features/horoscopes/types/horoscope";

type Props = { params: Promise<{ period: string; sign: string }> };
const periods: HoroscopePeriod[] = ["daily", "weekly", "monthly"];

function parseParams(period: string, sign: string) {
  const validPeriod = periods.includes(period as HoroscopePeriod);
  const validSign = zodiacSigns.some((item) => item.key === sign);
  if (!validPeriod || !validSign) notFound();
  return { period: period as HoroscopePeriod, sign: sign as ZodiacSign };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const values = await params;
  const { period, sign } = parseParams(values.period, values.sign);
  const signLabel = zodiacSigns.find((item) => item.key === sign)?.label ?? sign;
  return {
    title: `${signLabel} ${periodLabels[period]} Horoscope | Astrology`,
    description: `Read the current published ${periodLabels[period].toLowerCase()} horoscope guidance for ${signLabel}.`,
  };
}

export default async function HoroscopeDetailPage({ params }: Props) {
  const values = await params;
  const { period, sign } = parseParams(values.period, values.sign);
  return <PublicHoroscopeView initialPeriod={period} initialSign={sign} />;
}
