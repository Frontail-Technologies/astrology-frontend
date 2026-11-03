import type { ConsultationRequestKind, ConsultationStatus } from "../types/consultation-admin.ts";

export const consultationStatusLabels: Record<ConsultationStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};
export const consultationStatusVariants: Record<ConsultationStatus, "pending" | "online" | "verified" | "unavailable" | "muted"> = {
  requested: "pending",
  accepted: "online",
  scheduled: "online",
  in_progress: "online",
  completed: "verified",
  cancelled: "unavailable",
  rejected: "unavailable",
};
export const consultationModeLabels = { chat: "Chat", voice: "Voice", video: "Video" } as const;

/** Stable error codes the override UI must handle: invalid transition, active paid chat session, races. */
export const CONSULTATION_OVERRIDE_ERRORS = ["INVALID_CONSULTATION_TRANSITION", "CONSULTATION_CHAT_SESSION_ACTIVE", "CONSULTATION_STATUS_CONFLICT"] as const;

export const CONSULTATION_OVERRIDE_HINTS: Record<string, string> & Record<(typeof CONSULTATION_OVERRIDE_ERRORS)[number], string> = {
  CONSULTATION_CHAT_SESSION_ACTIVE: "A paid chat session is still running. End the session first so billing stops; then override.",
  INVALID_CONSULTATION_TRANSITION: "The server does not allow this transition from the current status.",
  CONSULTATION_STATUS_CONFLICT: "The consultation changed while you were working. Close this dialog to reload it, then try again.",
};

/** How the consultation was requested. */
export const consultationRequestKindLabels: Record<ConsultationRequestKind, string> = { instant: "Instant", standard: "Scheduled" };
