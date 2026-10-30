import type { ChatSession, Earning, Payout, Wallet } from "../types/finance";

export const payoutSeed: Payout[] = [
  { id: "pout_1009", astrologerId: "anay-sharma", astrologerName: "Anay Sharma", amountInPaise: 4825000, periodStart: "2026-10-01", periodEnd: "2026-10-15", method: "bank-transfer", accountLabel: "HDFC •••• 4821", status: "pending", createdAt: "2026-10-16T06:00:00Z", updatedAt: "2026-10-16T06:00:00Z" },
  { id: "pout_1008", astrologerId: "meera-iyer", astrologerName: "Meera Iyer", amountInPaise: 3612000, periodStart: "2026-10-01", periodEnd: "2026-10-15", method: "upi", accountLabel: "meera@okaxis", status: "processing", reference: "UTR2610160021", createdAt: "2026-10-16T06:00:00Z", updatedAt: "2026-10-17T09:20:00Z" },
  { id: "pout_1007", astrologerId: "rohan-joshi", astrologerName: "Rohan Joshi", amountInPaise: 2140000, periodStart: "2026-09-16", periodEnd: "2026-09-30", method: "bank-transfer", accountLabel: "ICICI •••• 1290", status: "paid", reference: "UTR2610010134", createdAt: "2026-10-01T06:00:00Z", updatedAt: "2026-10-02T11:05:00Z" },
  { id: "pout_1006", astrologerId: "kavya-nair", astrologerName: "Kavya Nair", amountInPaise: 1785000, periodStart: "2026-09-16", periodEnd: "2026-09-30", method: "upi", accountLabel: "kavya.n@oksbi", status: "failed", note: "Beneficiary UPI ID inactive", createdAt: "2026-10-01T06:00:00Z", updatedAt: "2026-10-01T14:40:00Z" },
  { id: "pout_1005", astrologerId: "anay-sharma", astrologerName: "Anay Sharma", amountInPaise: 5210000, periodStart: "2026-09-16", periodEnd: "2026-09-30", method: "bank-transfer", accountLabel: "HDFC •••• 4821", status: "paid", reference: "UTR2610010131", createdAt: "2026-10-01T06:00:00Z", updatedAt: "2026-10-02T10:55:00Z" },
  { id: "pout_1004", astrologerId: "devika-rao", astrologerName: "Devika Rao", amountInPaise: 980000, periodStart: "2026-09-16", periodEnd: "2026-09-30", method: "bank-transfer", accountLabel: "Axis •••• 7702", status: "cancelled", note: "Merged into next cycle", createdAt: "2026-10-01T06:00:00Z", updatedAt: "2026-10-01T08:10:00Z" },
];

export const earningSeed: Earning[] = [
  { id: "earn_5021", astrologerId: "anay-sharma", astrologerName: "Anay Sharma", consultationId: "con-1001", mode: "chat", grossInPaise: 129900, commissionInPaise: 38970, netInPaise: 90930, status: "available", createdAt: "2026-10-18T08:30:00Z" },
  { id: "earn_5020", astrologerId: "meera-iyer", astrologerName: "Meera Iyer", consultationId: "con-1002", mode: "call", grossInPaise: 89900, commissionInPaise: 26970, netInPaise: 62930, status: "pending", createdAt: "2026-10-18T07:10:00Z" },
  { id: "earn_5019", astrologerId: "rohan-joshi", astrologerName: "Rohan Joshi", consultationId: "con-1004", mode: "video", grossInPaise: 149900, commissionInPaise: 44970, netInPaise: 104930, status: "available", createdAt: "2026-10-17T15:45:00Z" },
  { id: "earn_5018", astrologerId: "anay-sharma", astrologerName: "Anay Sharma", consultationId: "con-1005", mode: "chat", grossInPaise: 119900, commissionInPaise: 35970, netInPaise: 83930, status: "paid-out", payoutId: "pout_1005", createdAt: "2026-09-28T12:00:00Z" },
  { id: "earn_5017", astrologerId: "kavya-nair", astrologerName: "Kavya Nair", consultationId: "con-1008", mode: "call", grossInPaise: 99900, commissionInPaise: 29970, netInPaise: 69930, status: "paid-out", payoutId: "pout_1006", createdAt: "2026-09-25T10:20:00Z" },
  { id: "earn_5016", astrologerId: "devika-rao", astrologerName: "Devika Rao", consultationId: "con-1009", mode: "chat", grossInPaise: 74900, commissionInPaise: 22470, netInPaise: 52430, status: "available", createdAt: "2026-10-16T18:05:00Z" },
  { id: "earn_5015", astrologerId: "meera-iyer", astrologerName: "Meera Iyer", consultationId: "con-1010", mode: "chat", grossInPaise: 159900, commissionInPaise: 47970, netInPaise: 111930, status: "paid-out", payoutId: "pout_1008", createdAt: "2026-10-05T09:40:00Z" },
];

export const walletSeed: Wallet[] = [
  {
    id: "cust-aisha-khan", customerId: "cust-aisha-khan", customerName: "Aisha Khan", phone: "+91 98201 44120", balanceInPaise: 48200, updatedAt: "2026-10-18T08:42:00Z",
    transactions: [
      { id: "wtx_901", kind: "consultation", amountInPaise: -129900, balanceAfterInPaise: 48200, description: "Chat with Anay Sharma · 13 min", createdAt: "2026-10-18T08:42:00Z" },
      { id: "wtx_900", kind: "topup", amountInPaise: 100000, balanceAfterInPaise: 178100, description: "Wallet top-up · UPI", createdAt: "2026-10-18T08:20:00Z" },
      { id: "wtx_880", kind: "topup", amountInPaise: 50000, balanceAfterInPaise: 78100, description: "Wallet top-up · Card", createdAt: "2026-10-10T19:02:00Z" },
    ],
  },
  {
    id: "cust-rohan-mehta", customerId: "cust-rohan-mehta", customerName: "Rohan Mehta", phone: "+91 99870 21934", balanceInPaise: 215000, updatedAt: "2026-10-17T21:15:00Z",
    transactions: [
      { id: "wtx_895", kind: "refund", amountInPaise: 45000, balanceAfterInPaise: 215000, description: "Refund · session dropped", createdAt: "2026-10-17T21:15:00Z" },
      { id: "wtx_894", kind: "consultation", amountInPaise: -89900, balanceAfterInPaise: 170000, description: "Call with Meera Iyer · 9 min", createdAt: "2026-10-17T20:50:00Z" },
      { id: "wtx_870", kind: "topup", amountInPaise: 200000, balanceAfterInPaise: 259900, description: "Wallet top-up · UPI", createdAt: "2026-10-12T11:30:00Z" },
    ],
  },
  {
    id: "cust-kavya-nair", customerId: "cust-kavya-nair", customerName: "Kavya Nair", phone: "+91 90040 66218", balanceInPaise: 0, updatedAt: "2026-10-15T07:05:00Z",
    transactions: [{ id: "wtx_860", kind: "consultation", amountInPaise: -50000, balanceAfterInPaise: 0, description: "Chat with Devika Rao · balance exhausted", createdAt: "2026-10-15T07:05:00Z" }],
  },
  {
    id: "cust-priya-sharma", customerId: "cust-priya-sharma", customerName: "Priya Sharma", phone: "+91 98111 30942", balanceInPaise: 512500, updatedAt: "2026-10-14T13:40:00Z",
    transactions: [
      { id: "wtx_851", kind: "adjustment", amountInPaise: 12500, balanceAfterInPaise: 512500, description: "Goodwill credit · support ticket TKT-2041", createdAt: "2026-10-14T13:40:00Z" },
      { id: "wtx_850", kind: "topup", amountInPaise: 500000, balanceAfterInPaise: 500000, description: "Wallet top-up · Net banking", createdAt: "2026-10-14T13:00:00Z" },
    ],
  },
];

export const chatSessionSeed: ChatSession[] = [
  { id: "cs_7110", consultationId: "con-1011", conversationId: "chat-2011", customerId: "cust-rohan-mehta", customerName: "Rohan Mehta", astrologerId: "anay-sharma", astrologerName: "Anay Sharma", ratePerMinuteInPaise: 4500, billableSeconds: 412, chargedInPaise: 31500, status: "active", startedAt: "2026-10-18T09:02:00Z" },
  { id: "cs_7109", consultationId: "con-1001", conversationId: "chat-2001", customerId: "cust-aisha-khan", customerName: "Aisha Khan", astrologerId: "anay-sharma", astrologerName: "Anay Sharma", ratePerMinuteInPaise: 9900, billableSeconds: 780, chargedInPaise: 129900, status: "ended", endReason: "customer-ended", startedAt: "2026-10-18T08:29:00Z", endedAt: "2026-10-18T08:42:00Z" },
  { id: "cs_7108", consultationId: "con-1009", conversationId: "chat-1999", customerId: "cust-kavya-nair", customerName: "Kavya Nair", astrologerId: "devika-rao", astrologerName: "Devika Rao", ratePerMinuteInPaise: 2500, billableSeconds: 1200, chargedInPaise: 50000, status: "insufficient-balance", endReason: "balance-exhausted", startedAt: "2026-10-15T06:45:00Z", endedAt: "2026-10-15T07:05:00Z" },
  { id: "cs_7107", consultationId: "con-1010", conversationId: "chat-1990", customerId: "cust-priya-sharma", customerName: "Priya Sharma", astrologerId: "meera-iyer", astrologerName: "Meera Iyer", ratePerMinuteInPaise: 6500, billableSeconds: 1476, chargedInPaise: 159900, status: "ended", endReason: "astrologer-ended", startedAt: "2026-10-05T09:15:00Z", endedAt: "2026-10-05T09:40:00Z" },
  { id: "cs_7106", consultationId: "con-1006", conversationId: "chat-1981", customerId: "cust-arjun-pillai", customerName: "Arjun Pillai", astrologerId: "rohan-joshi", astrologerName: "Rohan Joshi", ratePerMinuteInPaise: 3500, billableSeconds: 95, chargedInPaise: 7000, status: "ended", endReason: "timeout", startedAt: "2026-10-03T17:10:00Z", endedAt: "2026-10-03T17:12:00Z" },
];
