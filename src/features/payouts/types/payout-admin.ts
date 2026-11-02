export type PayoutStatus = "pending" | "processing" | "paid" | "failed" | "cancelled";
export type PayoutTargetStatus = Exclude<PayoutStatus, "pending">;

/** `GET /admin/payouts` item; the detail also carries `items`. */
export type AdminPayout = {
  id: string;
  astrologerId: string;
  status: PayoutStatus;
  amountPaise: number;
  currency: string;
  provider: string | null;
  providerPayoutId: string | null;
  failureCode: string | null;
  failureMessage: string | null;
  requestedAt: string;
  processedAt: string | null;
  paidAt: string | null;
  failedAt: string | null;
  createdAt: string;
  updatedAt: string;
  itemCount: number;
  astrologer: { id: string; userId: string; displayName: string } | null;
  items?: { id: string; payoutId: string; earningId: string; amountPaise: number }[];
  /** Next statuses the server state machine allows (server-provided; the server still re-validates). */
  allowedTransitions: PayoutTargetStatus[];
};

export type CreatePayoutInput = { astrologerId: string; earningIds?: string[] };

export type PayoutStatusInput = {
  status: PayoutTargetStatus;
  provider?: string | null;
  providerPayoutId?: string | null;
  failureCode?: string | null;
  failureMessage?: string | null;
};
