export type ZodiacSign = "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo" | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";
export type HoroscopePeriod = "daily" | "weekly" | "monthly";
export type HoroscopeStatus = "draft" | "published";

export type HoroscopeEntry = {
  id: string;
  sign: ZodiacSign;
  period: HoroscopePeriod;
  date: string;
  overview: string;
  love: string;
  career: string;
  health: string;
  status: HoroscopeStatus;
  createdAt: string;
  updatedAt: string;
};
