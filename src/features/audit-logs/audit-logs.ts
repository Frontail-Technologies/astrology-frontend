"use client";

import { useMockRepository } from "@/features/admin/hooks/use-mock-repository";

export type AuditLog = {
  id: string;
  actorName: string;
  actorEmail: string;
  action: string;
  entityType: string;
  entityId: string;
  summary: string;
  ip: string;
  before?: Record<string, unknown> | null;
  after?: Record<string, unknown> | null;
  createdAt: string;
};

export const auditLogSeed: AuditLog[] = [
  { id: "aud_9015", actorName: "Neha Admin", actorEmail: "neha@astrodharma.in", action: "payout.status_updated", entityType: "payout", entityId: "pout_1008", summary: "Marked payout as processing", ip: "103.21.58.14", before: { status: "pending" }, after: { status: "processing", reference: "UTR2610160021" }, createdAt: "2026-10-17T09:20:00Z" },
  { id: "aud_9014", actorName: "Neha Admin", actorEmail: "neha@astrodharma.in", action: "astrologer.status_updated", entityType: "astrologer", entityId: "isha-kapoor", summary: "Approved astrologer profile", ip: "103.21.58.14", before: { status: "pending" }, after: { status: "approved" }, createdAt: "2026-10-16T12:02:00Z" },
  { id: "aud_9013", actorName: "Vikas Ops", actorEmail: "vikas@astrodharma.in", action: "store.product_updated", entityType: "store_product", entityId: "rudraksha-5-mukhi", summary: "Updated price and stock", ip: "49.36.112.8", before: { pricePaise: 149900, stock: 12 }, after: { pricePaise: 129900, stock: 40 }, createdAt: "2026-10-15T15:44:00Z" },
  { id: "aud_9012", actorName: "Neha Admin", actorEmail: "neha@astrodharma.in", action: "review.status_updated", entityType: "review", entityId: "rev-4410", summary: "Hid review for policy violation", ip: "103.21.58.14", before: { status: "published" }, after: { status: "hidden" }, createdAt: "2026-10-14T08:10:00Z" },
  { id: "aud_9011", actorName: "Vikas Ops", actorEmail: "vikas@astrodharma.in", action: "coupon.created", entityType: "coupon", entityId: "DIWALI25", summary: "Created coupon DIWALI25", ip: "49.36.112.8", before: null, after: { code: "DIWALI25", percentOff: 25, active: true }, createdAt: "2026-10-12T10:30:00Z" },
  { id: "aud_9010", actorName: "Neha Admin", actorEmail: "neha@astrodharma.in", action: "customer.status_updated", entityType: "customer", entityId: "cust-vikram-reddy", summary: "Suspended customer account", ip: "103.21.58.14", before: { status: "active" }, after: { status: "suspended" }, createdAt: "2026-10-10T18:25:00Z" },
  { id: "aud_9009", actorName: "Vikas Ops", actorEmail: "vikas@astrodharma.in", action: "settings.updated", entityType: "setting", entityId: "chat.minimum_balance", summary: "Changed minimum chat balance", ip: "49.36.112.8", before: { valuePaise: 5000 }, after: { valuePaise: 10000 }, createdAt: "2026-10-08T07:55:00Z" },
];

export function useAuditLogRepository() {
  return useMockRepository<AuditLog>("astrology-admin-audit-logs-v1", auditLogSeed);
}
