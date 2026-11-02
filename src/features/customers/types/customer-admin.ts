import type { Customer } from "./customer.ts";

export type CustomerConsultation = {
  id: string;
  astrologerId: string;
  astrologerName: string;
  mode: string;
  status: "requested" | "accepted" | "scheduled" | "in_progress" | "completed" | "cancelled" | "rejected";
  requestedAt: string;
  scheduledAt: string | null;
  completedAt: string | null;
  pricePaise: number;
};

/** `GET /admin/customers/:id`. */
export type CustomerDetail = Customer & {
  emailVerifiedAt: string | null;
  phoneVerifiedAt: string | null;
  lastLoginAt: string | null;
  consultations: CustomerConsultation[];
  consultationSummary: { total: number; completed: number };
};
