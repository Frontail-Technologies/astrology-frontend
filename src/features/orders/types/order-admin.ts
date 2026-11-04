export type OrderStatus = "pending" | "confirmed" | "processing" | "shipped" | "delivered" | "cancelled";

export type AdminOrderItem = {
  productId: string | null;
  productName: string;
  productSlug: string;
  imageUrl: string | null;
  unitPricePaise: number;
  quantity: number;
  lineTotalPaise: number;
};

/** `GET /admin/orders` item and detail. */
export type AdminOrder = {
  id: string;
  orderNumber: string;
  customerUserId: string;
  status: OrderStatus;
  couponCode: string | null;
  subtotalPaise: number;
  shippingPaise: number;
  discountPaise: number;
  totalPaise: number;
  currency: string;
  /** Phone-only customers (signed up with OTP) have no email. */
  contactEmail: string | null;
  contactPhone: string;
  shippingName: string;
  shippingAddressLine1: string;
  shippingAddressLine2: string | null;
  shippingCity: string;
  shippingState: string;
  shippingPostalCode: string;
  shippingCountry: string;
  placedAt: string | null;
  confirmedAt: string | null;
  shippedAt: string | null;
  deliveredAt: string | null;
  cancelledAt: string | null;
  /** Why the customer cancelled from the app (unpaid orders only). */
  cancellationReason: string | null;
  courier: string | null;
  trackingNumber: string | null;
  trackingUrl: string | null;
  /** Delivery estimate shown to the customer (YYYY-MM-DD). */
  estimatedDeliveryDate: string | null;
  createdAt: string;
  updatedAt: string;
  items: AdminOrderItem[];
  customer: { id: string; email: string | null; phone: string | null; name?: string | null };
  /** Next statuses the server state machine allows (server-provided; the server still re-validates). */
  allowedTransitions: OrderStatus[];
};

/** `PATCH /admin/orders/:id/tracking` body. */
export type OrderTrackingInput = { courier: string; trackingNumber: string; trackingUrl: string | null; estimatedDeliveryDate?: string | null };
