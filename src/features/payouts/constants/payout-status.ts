import type { PayoutStatus, PayoutTargetStatus } from "../types/payout-admin.ts";

export const payoutStatusLabels: Record<PayoutStatus, string> = { pending: "Pending", processing: "Processing", paid: "Paid", failed: "Failed", cancelled: "Cancelled" };
export const payoutStatusVariants: Record<PayoutStatus, "pending" | "online" | "verified" | "unavailable" | "muted"> = { pending: "pending", processing: "online", paid: "verified", failed: "unavailable", cancelled: "muted" };

export const payoutActionCopy: Record<PayoutTargetStatus, { label: string; title: string; description: string; destructive?: boolean }> = {
  processing: { label: "Mark processing", title: "Start processing this payout?", description: "Use this when the transfer to the astrologer has been initiated." },
  paid: { label: "Mark paid", title: "Mark this payout as paid?", description: "Confirms the money reached the astrologer. This is final and the earnings become paid." },
  failed: { label: "Mark failed", title: "Mark this payout as failed?", description: "The earnings stay reserved for this payout. After a successful retry you can mark it paid, or cancel it to release the earnings.", destructive: true },
  cancelled: { label: "Cancel payout", title: "Cancel this payout?", description: "The earnings are released and can be included in a new payout. This payout is final.", destructive: true },
};

/** Inline guidance for payout creation error codes. */
export const PAYOUT_CREATE_ERROR_HINTS: Record<string, string> = {
  NO_AVAILABLE_EARNINGS: "This astrologer has no available earnings that are not already in a payout.",
  PAYOUT_EARNINGS_UNAVAILABLE: "Some selected earnings were already paid out or attached to another payout. Reopen the dialog to refresh the list.",
  PAYOUT_EARNING_ALREADY_SELECTED: "An earning was attached to another payout at the same time. Reopen the dialog to refresh the list.",
};

/**
 * How a payout was sent. The API stores free text (1–40 chars), so the editor offers these keys plus "Other…";
 * labels are what admins read. Unknown stored values are shown as written.
 */
export const payoutProviderLabels: Record<string, string> = {
  bank_transfer: "Bank transfer",
  upi: "UPI",
  imps: "IMPS",
  neft: "NEFT",
  rtgs: "RTGS",
  razorpayx: "RazorpayX",
};
export const payoutProviderLabel = (provider: string) => payoutProviderLabels[provider] ?? provider;

/** Common reasons a payout fails. Free text on the API (1–160 chars), so custom reasons are allowed too. */
export const payoutFailureReasonLabels: Record<string, string> = {
  invalid_account: "Invalid account details",
  beneficiary_name_mismatch: "Account holder name does not match",
  bank_rejected: "Rejected by the bank",
  limit_exceeded: "Transfer limit exceeded",
  account_closed: "Account closed or frozen",
};
export const payoutFailureReasonLabel = (code: string) => payoutFailureReasonLabels[code] ?? code;
