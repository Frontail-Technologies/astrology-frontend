/** Admin shapes for `/admin/horoscopes`. Separate from the public-site `types/horoscope.ts`. */
export type HoroscopePeriod = "daily" | "weekly" | "monthly";
export type HoroscopeStatus = "draft" | "published";
export type ZodiacSign = "aries" | "taurus" | "gemini" | "cancer" | "leo" | "virgo" | "libra" | "scorpio" | "sagittarius" | "capricorn" | "aquarius" | "pisces";

/** `GET /admin/horoscopes` item and detail (backend `toAdminHoroscope`). Sections are `""` when missing. */
export type ManagedHoroscope = {
  id: string;
  sign: ZodiacSign;
  period: HoroscopePeriod;
  /** `periodStart` (`YYYY-MM-DD`). */
  date: string;
  periodEnd: string | null;
  /** `guidance`. */
  overview: string;
  love: string;
  career: string;
  health: string;
  status: HoroscopeStatus;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
};

export type HoroscopeSections = { love?: string; career?: string; health?: string };

export type HoroscopeCreateInput = {
  period: HoroscopePeriod;
  zodiacSign: ZodiacSign;
  periodStart: string;
  periodEnd: string | null;
  guidance: string;
  sections: HoroscopeSections | null;
  status: HoroscopeStatus;
};

/** `PATCH /:id` body used by the editor (period, sign and start date stay fixed for an entry). */
export type HoroscopeUpdateInput = { periodEnd: string | null; guidance: string; sections: HoroscopeSections | null };
