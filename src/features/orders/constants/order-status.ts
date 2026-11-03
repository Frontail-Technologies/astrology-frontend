import type { OrderStatus } from "../types/order-admin.ts";

export const orderStatusLabels: Record<OrderStatus, string> = { pending: "Pending", confirmed: "Confirmed", processing: "Processing", shipped: "Shipped", delivered: "Delivered", cancelled: "Cancelled" };
export const orderStatusVariants: Record<OrderStatus, "pending" | "online" | "verified" | "unavailable"> = { pending: "pending", confirmed: "online", processing: "online", shipped: "online", delivered: "verified", cancelled: "unavailable" };

export const orderTransitionCopy: Record<OrderStatus, string> = {
  pending: "",
  confirmed: "Confirms the order for fulfilment.",
  processing: "Marks the order as being packed.",
  shipped: "Marks the order as handed to the courier.",
  delivered: "Marks the order as delivered. This is final.",
  cancelled: "Cancels the order. This is final; refund any payment separately as a manual refund.",
};

/** Couriers offered in the tracking form; the API stores free text (2–80 characters), so "Other…" is allowed. */
export const orderCourierLabels: Readonly<Record<string, string>> = {
  Delhivery: "Delhivery",
  "Blue Dart": "Blue Dart",
  DTDC: "DTDC",
  "India Post": "India Post",
  "Ekart Logistics": "Ekart Logistics",
  "Xpressbees": "Xpressbees",
  "Shadowfax": "Shadowfax",
};
