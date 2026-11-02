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
};

export type PoojaRequestStatusInput = { status: PoojaRequestStatusTarget };
export type PoojaRequestScheduleInput = { scheduledStartAt: string };
