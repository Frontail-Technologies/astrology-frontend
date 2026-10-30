export type PayoutStatus = "pending" | "processing" | "paid" | "failed" | "cancelled";

export type Payout = {
  id: string;
  astrologerId: string;
  astrologerName: string;
  amountInPaise: number;
  periodStart: string;
  periodEnd: string;
  method: "bank-transfer" | "upi";
  accountLabel: string;
  status: PayoutStatus;
  reference?: string;
  note?: string;
  createdAt: string;
  updatedAt: string;
};

export type EarningStatus = "pending" | "available" | "paid-out";

export type Earning = {
  id: string;
  astrologerId: string;
  astrologerName: string;
  consultationId: string;
  mode: "chat" | "call" | "video";
  grossInPaise: number;
  commissionInPaise: number;
  netInPaise: number;
  status: EarningStatus;
  payoutId?: string;
  createdAt: string;
};

export type WalletTransaction = {
  id: string;
  kind: "topup" | "consultation" | "refund" | "adjustment";
  amountInPaise: number;
  balanceAfterInPaise: number;
  description: string;
  createdAt: string;
};

export type Wallet = {
  id: string;
  customerId: string;
  customerName: string;
  phone: string;
  balanceInPaise: number;
  updatedAt: string;
  transactions: WalletTransaction[];
};

export type ChatSessionStatus = "active" | "ended" | "insufficient-balance";

export type ChatSession = {
  id: string;
  consultationId: string;
  conversationId: string;
  customerId: string;
  customerName: string;
  astrologerId: string;
  astrologerName: string;
  ratePerMinuteInPaise: number;
  billableSeconds: number;
  chargedInPaise: number;
  status: ChatSessionStatus;
  endReason?: "customer-ended" | "astrologer-ended" | "balance-exhausted" | "timeout";
  startedAt: string;
  endedAt?: string;
};
