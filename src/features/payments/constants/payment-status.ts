import type { AdminPayment, PaymentStatus } from "../types/payment-admin.ts";

export const paymentStatusLabels: Record<PaymentStatus, string> = { pending: "Pending", processing: "Processing", succeeded: "Succeeded", failed: "Failed", cancelled: "Cancelled" };
export const paymentStatusVariants: Record<PaymentStatus, "pending" | "online" | "unavailable" | "muted"> = { pending: "pending", processing: "pending", succeeded: "online", failed: "unavailable", cancelled: "muted" };

export const paymentPurpose = (payment: AdminPayment) => (payment.orderId ? "Store order" : payment.consultationId ? "Consultation" : "Wallet top-up");

export const MANUAL_REFUND_NOTICE = "Manual/external refund record — no money is moved by this action. Return the money through the payment provider or bank first, then record it here.";

/** Inline guidance for refund error codes returned by the server. */
export const REFUND_ERROR_HINTS: Record<string, string> = {
  REFUND_EXCEEDS_REFUNDABLE: "Another refund was recorded in the meantime. Close this dialog to see the refundable amount now.",
  INSUFFICIENT_WALLET_BALANCE: "This was a wallet top-up and the customer has already spent part of it. Refund at most the current wallet balance.",
  PAYMENT_NOT_REFUNDABLE: "Only succeeded payments can be refunded.",
  IDEMPOTENCY_CONFLICT: "This attempt was already used for a different refund. Close and reopen the dialog to start a new one.",
};

const readable = (value: string) => value.charAt(0).toUpperCase() + value.slice(1).replace(/[_-]+/g, " ");

/** Human labels for payment providers and methods (unknown values fall back to a readable form). */
export const paymentProviderLabels: Record<string, string> = { razorpay: "Razorpay", manual: "Manual", wallet: "Wallet" };
export const paymentMethodLabels: Record<string, string> = {
  upi: "UPI",
  card: "Card",
  netbanking: "Net banking",
  wallet: "Wallet",
  emi: "EMI",
  paylater: "Pay later",
  bank_transfer: "Bank transfer",
};
export const paymentProviderLabel = (provider: string) => paymentProviderLabels[provider.toLowerCase()] ?? readable(provider);
export const paymentMethodLabel = (method: string) => paymentMethodLabels[method.toLowerCase()] ?? readable(method);
