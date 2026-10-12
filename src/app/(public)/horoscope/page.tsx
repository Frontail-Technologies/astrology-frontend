import type { Metadata } from "next";

import { PublicHoroscopeView } from "@/features/horoscopes/components/public-horoscope-view";

export const metadata: Metadata = {
  title: "Daily, Weekly & Monthly Horoscopes | Astrology",
  description: "Explore published daily, weekly, and monthly horoscope guidance for all twelve zodiac signs.",
};

export default function HoroscopePage() {
  return <PublicHoroscopeView />;
}
