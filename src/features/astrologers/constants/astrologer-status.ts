import type { AstrologerAvailability, AstrologerMode, AstrologerVerificationStatus, AstrologerVisibilityStatus } from "../types/astrologer-admin.ts";

export const astrologerModes = ["chat", "voice", "video"] as const satisfies readonly AstrologerMode[];
export const astrologerModeLabels: Record<AstrologerMode, string> = { chat: "Chat", voice: "Voice call", video: "Video call" };

export const verificationLabels: Record<AstrologerVerificationStatus, string> = { pending: "Pending review", verified: "Verified", rejected: "Rejected" };
export const visibilityLabels: Record<AstrologerVisibilityStatus, string> = { draft: "Draft", published: "Published", suspended: "Suspended" };

export const verificationVariants: Record<AstrologerVerificationStatus, "verified" | "pending" | "unavailable"> = { pending: "pending", verified: "verified", rejected: "unavailable" };
export const visibilityVariants: Record<AstrologerVisibilityStatus, "muted" | "online" | "unavailable"> = { draft: "muted", published: "online", suspended: "unavailable" };

/** Returned when publishing an unverified astrologer or un-verifying a published one. */
export const ASTROLOGER_NOT_VERIFIED = "ASTROLOGER_NOT_VERIFIED";

/** Live availability the astrologer sets in the app (read-only for admins). */
export const availabilityLabels: Record<AstrologerAvailability, string> = { online: "Online", busy: "In a session", offline: "Offline" };
export const availabilityVariants: Record<AstrologerAvailability, "online" | "pending" | "muted"> = { online: "online", busy: "pending", offline: "muted" };

/** Inline guidance for provisioning and phone-change conflicts. */
export const ASTROLOGER_IDENTITY_HINTS: Record<string, string> = {
  PHONE_ALREADY_REGISTERED: "This phone number already belongs to another account.",
  EMAIL_ALREADY_REGISTERED: "This email already belongs to another account.",
  IDENTITY_ALREADY_REGISTERED: "The phone, email or profile link is already in use.",
};
