import type {
  AstrologerListItem,
  AstrologerManagementStatus,
  AstrologerOperationalSummary,
  AstrologerPricing,
} from "../types/astrologer";

const MAX_EXPERIENCE_YEARS = 80;

export type AstrologerProfileCompleteness = {
  completed: number;
  total: number;
  percentage: number;
};

const profileCompletenessChecks: Array<(astrologer: AstrologerListItem) => boolean> = [
  (astrologer) => astrologer.name.trim().length > 0,
  (astrologer) => astrologer.initials.trim().length > 0,
  (astrologer) => astrologer.avatarSrc.trim().length > 0,
  (astrologer) => astrologer.primaryExpertise.trim().length > 0,
  (astrologer) => astrologer.expertiseKey.trim().length > 0,
  (astrologer) => astrologer.specialties.length > 0,
  (astrologer) => astrologer.languages.length > 0,
  (astrologer) => Boolean(astrologer.detail?.role.trim()),
  (astrologer) => Boolean(astrologer.detail?.intro.trim()),
  (astrologer) => Boolean(astrologer.detail?.bio.length),
  (astrologer) => Boolean(astrologer.detail?.guidanceAreas.length),
  (astrologer) => Boolean(astrologer.detail?.approachFocus.trim()),
  (astrologer) => Boolean(astrologer.detail?.consultationModes.length),
];

export function getAstrologerProfileCompleteness(astrologer: AstrologerListItem): AstrologerProfileCompleteness {
  const completed = profileCompletenessChecks.filter((check) => check(astrologer)).length;
  const total = profileCompletenessChecks.length;
  return { completed, total, percentage: Math.round((completed / total) * 100) };
}

export function isValidAstrologerExperienceYears(value: number): boolean {
  return Number.isInteger(value) && value >= 0 && value <= MAX_EXPERIENCE_YEARS;
}

export function isValidAstrologerPricing(pricing: AstrologerPricing): boolean {
  return Number.isInteger(pricing.priceInPaise)
    && pricing.priceInPaise >= 0
    && (pricing.durationMinutes === undefined || (Number.isInteger(pricing.durationMinutes) && pricing.durationMinutes > 0));
}

export function isValidAstrologerRatingSummary(summary: NonNullable<AstrologerOperationalSummary["ratingSummary"]>): boolean {
  return summary.average >= 0 && summary.average <= 5 && Number.isInteger(summary.reviewCount) && summary.reviewCount >= 0;
}

/** Lifecycle status remains unset until the Admin workflow stores it. */
export function getAstrologerManagementStatus(astrologer: AstrologerListItem): AstrologerManagementStatus | undefined {
  return astrologer.management?.managementStatus;
}

export function formatAstrologerExperience(experienceYears?: number): string {
  if (experienceYears === undefined) return "\u2014";
  return `${experienceYears} ${experienceYears === 1 ? "year" : "years"}`;
}

export function getAstrologerStartingPrice(pricing?: AstrologerPricing[]): AstrologerPricing | undefined {
  return pricing?.reduce<AstrologerPricing | undefined>(
    (lowest, item) => (!lowest || item.priceInPaise < lowest.priceInPaise ? item : lowest),
    undefined,
  );
}

export function formatAstrologerStartingPrice(pricing?: AstrologerPricing[]): string {
  const startingPrice = getAstrologerStartingPrice(pricing);
  if (!startingPrice) return "\u2014";
  return `From \u20B9${(startingPrice.priceInPaise / 100).toLocaleString("en-IN")}`;
}

export function formatAstrologerRating(summary?: AstrologerOperationalSummary["ratingSummary"]): string {
  if (!summary) return "\u2014";
  return `${summary.average.toFixed(1)} (${summary.reviewCount})`;
}
