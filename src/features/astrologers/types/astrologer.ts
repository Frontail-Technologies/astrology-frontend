export type AstrologerAvailability = "bookable" | "soon";

export type AstrologerGuidanceArea = {
  title: string;
  description: string;
};

/**
 * Detail-only editorial content for `/astrologer/[slug]`. Deliberately has no
 * ratings, review counts, years of experience, success metrics or testimonials —
 * none exist in the approved fixtures and none may be invented.
 */
export type AstrologerDetail = {
  /** Role line under the name, e.g. "Vedic Astrologer". */
  role: string;
  /** Short hero intro (2 lines max). */
  intro: string;
  /** Long-form bio paragraphs (reflective, non-deterministic tone). */
  bio: string[];
  guidanceAreas: AstrologerGuidanceArea[];
  /** One sentence describing how this astrologer frames a consultation. */
  approachFocus: string;
  /** Planned formats — profile capabilities only, not live actions. */
  consultationModes: string[];
  relatedSlugs: string[];
};

export type AstrologerListItem = {
  id: string;
  slug: string;
  name: string;
  initials: string;
  avatarSrc: string;
  primaryExpertise: string;
  expertiseKey: string;
  specialties: string[];
  languages: string[];
  availability: AstrologerAvailability;
  detail?: AstrologerDetail;
};

export type FilterOption = {
  value: string;
  label: string;
};
