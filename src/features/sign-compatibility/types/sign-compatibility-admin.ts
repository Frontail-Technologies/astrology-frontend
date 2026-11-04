import type { ZodiacSign } from "@/features/horoscopes/types/horoscope-admin";

/** One editorial entry per unordered pair; the API stores it with signA before signB in zodiac order. */
export type SignCompatibilityEntry = {
  id: string;
  signA: ZodiacSign;
  signB: ZodiacSign;
  score: number;
  love: number;
  trust: number;
  communication: number;
  summary: string;
  published: boolean;
  createdAt: string;
  updatedAt: string;
};

export type SignCompatibilityInput = Pick<SignCompatibilityEntry, "score" | "love" | "trust" | "communication" | "summary" | "published">;
