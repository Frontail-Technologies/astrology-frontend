export type ConsultationStatus = "requested" | "accepted" | "scheduled" | "in_progress" | "completed" | "cancelled" | "rejected";

/** `GET /admin/consultations` item and detail (backend `toAdminConsultation`). */
export type AdminConsultation = {
  id: string;
  consultationMode: { code: "chat" | "voice" | "video"; name: string };
  status: ConsultationStatus;
  concern: string | null;
  pricePaise: number;
  durationMinutes: number | null;
  requestedAt: string;
  requestedStartAt: string | null;
  scheduledStartAt: string | null;
  startedAt: string | null;
  completedAt: string | null;
  cancelledAt: string | null;
  createdAt: string;
  updatedAt: string;
  astrologer: { id: string; displayName: string; slug: string; profileImageUrl: string | null };
  customer: { id: string; email: string | null; phone: string | null };
  /** Next statuses the server state machine allows (server-provided; the server still re-validates). */
  allowedTransitions: ConsultationStatus[];
};

/** `PATCH /admin/consultations/:id/status`: reason required; `scheduledStartAt` only for "scheduled". */
export type ConsultationOverrideInput = { status: ConsultationStatus; reason: string; scheduledStartAt?: string };
