/** Admin shapes for `/admin/pooja-requests` (backend `toAdminPoojaRequest`). */
export type PoojaRequestStatus = "requested" | "accepted" | "scheduled" | "in_progress" | "completed" | "cancelled" | "rejected";

/** Targets accepted by `PATCH /:id/status` ("scheduled" goes through `PATCH /:id/schedule`). */
export type PoojaRequestStatusTarget = Exclude<PoojaRequestStatus, "requested" | "scheduled">;

export type ManagedPoojaRequest = {
  id: string;
  customerUserId: string;
  poojaId: string;
  status: PoojaRequestStatus;
  /** Customer's preferred date (`YYYY-MM-DD`). */
  requestedDate: string | null;
  scheduledStartAt: string | null;
  customerName: string;
  phone: string;
  email: string | null;
  addressLine1: string;
  addressLine2: string | null;
  city: string;
  state: string;
  postalCode: string | null;
  country: string;
  notes: string | null;
  intent: string | null;
  /** Snapshot at request time. */
  poojaName: string;
  /** Package chosen in the app (snapshot of its name); null for requests without packages. */
  packageId: string | null;
  packageName: string | null;
  /** Names in the sankalp, as entered by the customer. */
  devotees: string[];
  gotra: string | null;
  pricePaise: number | null;
  currency: "INR" | null;
  acceptedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  rejectedAt: string | null;
  createdAt: string;
  updatedAt: string;
  /** Status-endpoint targets from the server state machine (never "scheduled"). */
  allowedTransitions: PoojaRequestStatusTarget[];
  /** True for accepted (schedule) and scheduled (reschedule) requests. */
  canSchedule: boolean;
  /** Astrologer (pandit) the team assigned to perform the pooja. */
  assignedAstrologerUserId: string | null;
  assignedAstrologer: { userId: string; displayName: string; slug: string } | null;
  /** Assignment can change until the pooja is completed, cancelled or rejected. */
  canAssign: boolean;
  /** "customer" when the customer chose the pandit while booking; "admin" when the team assigned them. */
  assignmentSource: "customer" | "admin" | null;
  assignedAt: string | null;
  /** Set when a customer-chosen pandit declined or did not answer in time; the team must assign someone. */
  returnedToTeamAt: string | null;
  returnReason: "declined" | "no_response" | null;
  /** While a customer-chosen pandit has not answered: when the request returns to the team. */
  panditRespondBy: string | null;
};

export type PoojaRequestAssignmentInput = { astrologerUserId: string | null };

export type PoojaRequestStatusInput = { status: PoojaRequestStatusTarget };
export type PoojaRequestScheduleInput = { scheduledStartAt: string };
