import type { TicketCategory, TicketPriority, TicketStatus } from "../types/support-admin.ts";

export const ticketStatusLabels: Record<TicketStatus, string> = { open: "Open", in_progress: "In progress", resolved: "Resolved", closed: "Closed" };
export const ticketStatusVariants: Record<TicketStatus, "pending" | "online" | "verified" | "muted"> = { open: "pending", in_progress: "online", resolved: "verified", closed: "muted" };
export const ticketPriorityLabels: Record<TicketPriority, string> = { low: "Low", normal: "Normal", high: "High" };
export const ticketPriorityVariants: Record<TicketPriority, "muted" | "outline" | "saffron"> = { low: "muted", normal: "outline", high: "saffron" };
export const ticketCategoryLabels: Record<TicketCategory, string> = {
  consultation: "Consultation",
  order: "Order",
  payment: "Payment",
  pooja: "Pooja",
  account: "Account",
  technical: "Technical",
  other: "Other",
};

/** Admin routes for ticket `relatedEntity.type` values that have a detail screen. */
export const ticketRelatedEntityRoutes: Record<string, string> = { order: "/admin/orders", consultation: "/admin/consultations", payment: "/admin/payments" };

/** Human labels for ticket message senders (unknown values fall back to a capitalised value). */
export const ticketSenderLabels: Record<string, string> = { customer: "Customer", admin: "Support team", system: "System" };
export const ticketSenderLabel = (sender: string) => ticketSenderLabels[sender] ?? sender.charAt(0).toUpperCase() + sender.slice(1).replace(/[_-]+/g, " ");
