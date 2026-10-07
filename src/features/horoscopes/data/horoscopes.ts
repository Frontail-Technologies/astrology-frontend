import type { HoroscopeEntry, HoroscopePeriod, ZodiacSign } from "../types/horoscope";

export const zodiacSigns: Array<{ key: ZodiacSign; label: string; image: string }> = [
  { key: "aries", label: "Aries", image: "/assets/astrology/zodiac/zodiac-aries.png" },
  { key: "taurus", label: "Taurus", image: "/assets/astrology/zodiac/zodiac-taurus.png" },
  { key: "gemini", label: "Gemini", image: "/assets/astrology/zodiac/zodiac-gemini.png" },
  { key: "cancer", label: "Cancer", image: "/assets/astrology/zodiac/zodiac-cancer.png" },
  { key: "leo", label: "Leo", image: "/assets/astrology/zodiac/zodiac-leo.png" },
  { key: "virgo", label: "Virgo", image: "/assets/astrology/zodiac/zodiac-virgo.png" },
  { key: "libra", label: "Libra", image: "/assets/astrology/zodiac/zodiac-libra.png" },
  { key: "scorpio", label: "Scorpio", image: "/assets/astrology/zodiac/zodiac-scorpio.png" },
  { key: "sagittarius", label: "Sagittarius", image: "/assets/astrology/zodiac/zodiac-sagittarius.png" },
  { key: "capricorn", label: "Capricorn", image: "/assets/astrology/zodiac/zodiac-capricorn.png" },
  { key: "aquarius", label: "Aquarius", image: "/assets/astrology/zodiac/zodiac-aquarius.png" },
  { key: "pisces", label: "Pisces", image: "/assets/astrology/zodiac/zodiac-pisces.png" },
];

export const periodLabels: Record<HoroscopePeriod, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };
export const defaultPeriodDates: Record<HoroscopePeriod, string> = { daily: "2026-10-02", weekly: "2026-09-28", monthly: "2026-10" };

const themes = ["clear priorities", "patient communication", "steady routines", "creative reflection", "practical boundaries", "considered choices"];
export const horoscopeSeedData: HoroscopeEntry[] = (["daily", "weekly", "monthly"] as HoroscopePeriod[]).flatMap((period, periodIndex) =>
  zodiacSigns.map((sign, signIndex) => {
    const theme = themes[(signIndex + periodIndex) % themes.length];
    const now = new Date(Date.UTC(2026, 9, 2, 8 + periodIndex)).toISOString();
    return {
      id: `${period}-${defaultPeriodDates[period]}-${sign.key}`,
      sign: sign.key,
      period,
      date: defaultPeriodDates[period],
      overview: `${sign.label} may benefit from ${theme} during this ${period} cycle. Notice what deserves attention before committing to the next step.`,
      love: "Make room for direct but considerate conversation, and avoid assuming that every concern needs an immediate answer.",
      career: "Review priorities, clarify expectations, and choose progress that can be sustained rather than rushed.",
      health: "Support your energy with consistent rest, movement, and routines that fit your current circumstances.",
      status: signIndex % 5 === 0 ? "draft" : "published",
      createdAt: now,
      updatedAt: now,
    };
  }),
);
