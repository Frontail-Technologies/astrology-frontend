export type EarningStatus = "pending" | "available" | "held" | "paid" | "reversed";

/** `GET /admin/earnings` item and detail. */
export type AdminEarning = {
  id: string;
  chatSessionId: string | null;
  consultationId: string | null;
  astrologerId: string;
  customerUserId: string;
  grossAmountPaise: number;
  commissionRateBps: number;
  platformFeePaise: number;
  astrologerEarningPaise: number;
  status: EarningStatus;
  availableAt: string | null;
  createdAt: string;
  updatedAt: string;
  astrologer: { id: string; userId: string; displayName: string } | null;
  customer: { userId: string; email: string | null } | null;
};

export type EarningSummary = {
  grossRevenuePaise: number;
  platformRevenuePaise: number;
  totalAstrologerEarningsPaise: number;
  astrologerPayablePaise: number;
  pendingPaise: number;
  availablePaise: number;
  paidPaise: number;
};
