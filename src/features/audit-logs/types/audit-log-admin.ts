/** Mirrors `api/src/modules/audit/audit-actions.ts` (`auditActions`, `auditEntityTypes`). */
export const auditActionValues = [
  "astrologer.updated",
  "astrologer.status_changed",
  "order.status_changed",
  "pooja_request.status_changed",
  "pooja_request.scheduled",
  "pooja_request.rescheduled",
  "coupon.created",
  "coupon.updated",
  "coupon.status_changed",
  "coupon.deleted",
  "banner.created",
  "banner.updated",
  "banner.status_changed",
  "banner.deleted",
  "settings.updated",
  "review.moderated",
  "support.status_changed",
  "support.priority_changed",
  "support.admin_replied",
  "support.internal_note_added",
  "media.uploaded",
  "media.deleted",
  "payout.created",
  "payout.status_changed",
  "customer.status_changed",
  "calculator.created",
  "calculator.updated",
  "calculator.status_changed",
  "calculator.deleted",
  "notification_template.created",
  "notification_template.updated",
  "notification_template.deleted",
  "chat.transcript_accessed",
  "chat.flagged",
  "chat.unflagged",
  "consultation.admin_status_changed",
  "article.created",
  "article.updated",
  "article.status_changed",
  "article.deleted",
  "horoscope.created",
  "horoscope.updated",
  "horoscope.status_changed",
  "horoscope.deleted",
  "pooja.created",
  "pooja.updated",
  "pooja.status_changed",
  "pooja.deleted",
  "store_category.created",
  "store_category.updated",
  "store_category.status_changed",
  "store_category.deleted",
  "product.created",
  "product.updated",
  "product.status_changed",
  "product.deleted",
  "master_data.created",
  "master_data.updated",
  "master_data.status_changed",
  "master_data.deleted",
  "payment.refund_recorded",
  "wallet.adjusted",
] as const;

export type AuditAction = (typeof auditActionValues)[number];

export const auditEntityTypeValues = [
  "astrologer",
  "order",
  "pooja_request",
  "coupon",
  "banner",
  "settings",
  "review",
  "support_ticket",
  "media",
  "payout",
  "customer",
  "calculator",
  "notification_template",
  "chat",
  "consultation",
  "article",
  "horoscope",
  "pooja",
  "store_category",
  "product",
  "master_data",
  "payment",
  "wallet",
] as const;

export type AuditEntityType = (typeof auditEntityTypeValues)[number];

export type AuditActorRole = "customer" | "astrologer" | "admin";

/** `GET /admin/audit-logs` item and `GET /admin/audit-logs/:id`. Newest first. */
export type AdminAuditLog = {
  id: string;
  actorUserId: string | null;
  actorRole: AuditActorRole | null;
  /** Typed loosely so an action added on the server before this list is updated still renders. */
  action: AuditAction | (string & {});
  entityType: AuditEntityType | (string & {});
  entityId: string | null;
  entityLabel: string | null;
  metadata: unknown;
  before: unknown;
  after: unknown;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  actor: { id: string; email: string; name: string | null; role: AuditActorRole } | null;
};
