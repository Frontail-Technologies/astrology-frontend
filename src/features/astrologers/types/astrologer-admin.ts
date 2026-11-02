/** Admin shapes for `/admin/astrologers`. Separate from the public-site `types/astrologer.ts`. */
export type AstrologerMode = "chat" | "voice" | "video";
export type AstrologerVerificationStatus = "pending" | "verified" | "rejected";
export type AstrologerVisibilityStatus = "draft" | "published" | "suspended";

export type AstrologerTaxonomy = { id: string; name: string; slug: string };
export type AstrologerModePricing = { mode: AstrologerMode; enabled: boolean; pricePaise: number; durationMinutes: number | null };

/** `GET /admin/astrologers` item and detail (backend `toManagedAstrologer`). */
export type ManagedAstrologer = {
  id: string;
  userId: string;
  displayName: string;
  slug: string;
  bio: string;
  profileImageUrl: string | null;
  experienceYears: number;
  city: string | null;
  country: string;
  languages: string[];
  verificationStatus: AstrologerVerificationStatus;
  visibilityStatus: AstrologerVisibilityStatus;
  featured: boolean;
  createdAt: string;
  updatedAt: string;
  expertise: AstrologerTaxonomy[];
  specialties: AstrologerTaxonomy[];
  consultationModes: AstrologerModePricing[];
};

export type AstrologerProfileInput = Partial<{
  displayName: string;
  bio: string;
  profileImageUrl: string | null;
  experienceYears: number;
  city: string | null;
  country: string;
  languages: string[];
  consultationModes: AstrologerModePricing[];
  expertiseIds: string[];
  specialtyIds: string[];
}>;

export type AstrologerStatusInput = {
  verificationStatus?: AstrologerVerificationStatus;
  visibilityStatus?: AstrologerVisibilityStatus;
  featured?: boolean;
};

export type AstrologerStatusResult = { id: string; verificationStatus: AstrologerVerificationStatus; visibilityStatus: AstrologerVisibilityStatus; featured: boolean };
