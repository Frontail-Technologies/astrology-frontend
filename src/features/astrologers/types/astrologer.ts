export type AstrologerAvailability = "bookable" | "soon";

export type ConsultationMode = "Chat" | "Voice" | "Video";

export type AstrologerManagementStatus = "draft" | "active" | "suspended" | "archived";

export type AstrologerVerificationStatus = "unverified" | "pending" | "verified" | "rejected";

export type AstrologerPricing = {
  mode: ConsultationMode;
  priceInPaise: number;
  durationMinutes?: number;
  currency: "INR";
};

/** Admin-owned lifecycle metadata. Timestamps are assigned by the future backend. */
export type AstrologerManagementMetadata = {
  managementStatus?: AstrologerManagementStatus;
  verificationStatus?: AstrologerVerificationStatus;
  createdAt?: string;
  updatedAt?: string;
};

/** Backend-derived operational data, deliberately outside the editorial profile. */
export type AstrologerOperationalSummary = {
  astrologerId: string;
  liveAvailability?: { state: "online" | "offline" | "busy"; updatedAt?: string };
  ratingSummary?: { average: number; reviewCount: number };
  sessionStats?: { total: number; completed: number; cancelled: number };
};

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
  consultationModes: ConsultationMode[];
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
  experienceYears?: number;
  consultationPricing?: AstrologerPricing[];
  management?: AstrologerManagementMetadata;
  detail?: AstrologerDetail;
};

export type FilterOption = {
  value: string;
  label: string;
};
