export type PaymentType = "consultation" | "pooja" | "store-order";
export type PaymentMethod = "upi" | "card" | "net-banking" | "wallet";
export type PaymentStatus = "success" | "pending" | "failed" | "refunded" | "partially-refunded";

export type PaymentRefund = { id: string; amountInPaise: number; reason: string; note?: string; createdAt: string };

export type PaymentTransaction = {
  id: string;
  type: PaymentType;
  referenceId: string;
  customerId: string;
  customerName: string;
  amountInPaise: number;
  currency: "INR";
  method: PaymentMethod;
  status: PaymentStatus;
  gateway?: "Razorpay";
  gatewayPaymentId?: string;
  createdAt: string;
  refundedAmountInPaise?: number;
  refunds?: PaymentRefund[];
};
