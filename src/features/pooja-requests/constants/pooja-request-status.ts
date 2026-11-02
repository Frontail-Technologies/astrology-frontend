import type { PoojaRequestStatus, PoojaRequestStatusTarget } from "../types/pooja-request-admin.ts";

export const poojaRequestStatusLabels: Record<PoojaRequestStatus, string> = {
  requested: "Requested",
  accepted: "Accepted",
  scheduled: "Scheduled",
  in_progress: "In progress",
  completed: "Completed",
  cancelled: "Cancelled",
  rejected: "Rejected",
};

export const poojaRequestStatusVariants: Record<PoojaRequestStatus, "pending" | "verified" | "gold" | "saffron" | "online" | "muted" | "unavailable"> = {
  requested: "pending",
  accepted: "verified",
  scheduled: "gold",
  in_progress: "saffron",
  completed: "online",
  cancelled: "muted",
  rejected: "unavailable",
};

export const poojaRequestTransitionLabels: Record<PoojaRequestStatusTarget, string> = {
  accepted: "Accept request",
  in_progress: "Mark in progress",
  completed: "Mark completed",
  cancelled: "Cancel request",
  rejected: "Reject request",
};

export const poojaRequestTransitionDescriptions: Record<PoojaRequestStatusTarget, string> = {
  accepted: "The customer is notified that the request was accepted. Schedule a date and time next.",
  in_progress: "Marks the pooja as being performed now.",
  completed: "Marks the pooja as performed. The customer is notified.",
  cancelled: "Cancels the request. The customer is notified. This cannot be undone.",
  rejected: "Declines the request. The customer is notified. This cannot be undone.",
};

export const poojaRequestTransitionOrder: readonly PoojaRequestStatusTarget[] = ["accepted", "in_progress", "completed", "rejected", "cancelled"];

/** Inline hints for 409 codes from the status and schedule endpoints. */
export const POOJA_REQUEST_CONFLICT_HINTS: Record<string, string> = {
  INVALID_POOJA_REQUEST_TRANSITION: "The request is no longer in a state that allows this action. Reload to see its current status.",
  POOJA_REQUEST_STATUS_CONFLICT: "Someone else changed this request at the same time. Reload and try again.",
};
