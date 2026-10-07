import type { ConsultationMode } from "@/features/astrologers/types/astrologer";

/**
 * Future backend-owned booking contract. Consultation records must reference
 * customer and astrologer identities rather than duplicate their profiles.
 */
export type ConsultationBookingStatus = "pending" | "confirmed" | "completed" | "cancelled";

export type ConsultationPaymentStatus = "pending" | "paid" | "failed" | "refunded";

export type Consultation = {
  id: string;
  customerId: string;
  astrologerId: string;
  mode: ConsultationMode;
  scheduledAt?: string;
  durationMinutes?: number;
  bookingStatus?: ConsultationBookingStatus;
  paymentStatus?: ConsultationPaymentStatus;
  createdAt?: string;
  updatedAt?: string;
};
