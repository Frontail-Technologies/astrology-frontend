import type { HoroscopePeriod, HoroscopeStatus, ZodiacSign } from "../types/horoscope-admin.ts";

export const horoscopePeriods = ["daily", "weekly", "monthly"] as const satisfies readonly HoroscopePeriod[];
export const horoscopePeriodLabels: Record<HoroscopePeriod, string> = { daily: "Daily", weekly: "Weekly", monthly: "Monthly" };

export const horoscopeStatusLabels: Record<HoroscopeStatus, string> = { draft: "Draft", published: "Published" };
export const horoscopeStatusVariants: Record<HoroscopeStatus, "outline" | "online"> = { draft: "outline", published: "online" };

/** The twelve signs in zodiac order (the API enum). */
export const zodiacSigns = ["aries", "taurus", "gemini", "cancer", "leo", "virgo", "libra", "scorpio", "sagittarius", "capricorn", "aquarius", "pisces"] as const satisfies readonly ZodiacSign[];
export const zodiacSignLabels: Record<ZodiacSign, string> = {
  aries: "Aries",
  taurus: "Taurus",
  gemini: "Gemini",
  cancer: "Cancer",
  leo: "Leo",
  virgo: "Virgo",
  libra: "Libra",
  scorpio: "Scorpio",
  sagittarius: "Sagittarius",
  capricorn: "Capricorn",
  aquarius: "Aquarius",
  pisces: "Pisces",
};

/** Bundled sign artwork (`public/assets/astrology/zodiac`). */
export const zodiacSignImage = (sign: ZodiacSign) => `/assets/astrology/zodiac/zodiac-${sign}.png`;

export const isZodiacSign = (value: string): value is ZodiacSign => (zodiacSigns as readonly string[]).includes(value);
export const isHoroscopePeriod = (value: string): value is HoroscopePeriod => (horoscopePeriods as readonly string[]).includes(value);

/** 409 when the period/sign/start date already has an entry. */
export const HOROSCOPE_DUPLICATE = "HOROSCOPE_DUPLICATE";

export const HOROSCOPE_LIMITS = { guidance: 50_000, section: 10_000 } as const;
