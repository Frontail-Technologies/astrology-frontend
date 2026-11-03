import type { AdminAuditLog, AuditAction, AuditActorRole, AuditEntityType } from "../types/audit-log-admin.ts";
import { auditActionValues, auditEntityTypeValues } from "../types/audit-log-admin.ts";

export const auditEntityLabels: Record<AuditEntityType, string> = {
  astrologer: "Astrologer",
  order: "Order",
  pooja_request: "Pooja request",
  coupon: "Coupon",
  banner: "Banner",
  settings: "Settings",
  review: "Review",
  support_ticket: "Support ticket",
  media: "Media",
  payout: "Payout",
  customer: "Customer",
  calculator: "Calculator",
  notification_template: "Notification template",
  chat: "Chat",
  consultation: "Consultation",
  article: "Article",
  horoscope: "Horoscope",
  pooja: "Pooja",
  store_category: "Store category",
  product: "Product",
  master_data: "Master data",
  payment: "Payment",
  wallet: "Wallet",
  faq: "FAQ",
  product_review: "Product review",
  pooja_package: "Pooja package",
};

/** Action prefixes that are not entity type names. */
const ACTION_GROUP_LABELS: Record<string, string> = { support: "Support ticket" };

const VERB_LABELS: Record<string, string> = {
  admin_status_changed: "Status overridden",
  transcript_accessed: "Transcript viewed",
  admin_replied: "Admin replied",
  internal_note_added: "Internal note added",
  refund_recorded: "Refund recorded",
  phone_changed: "Sign-in phone changed",
  tracking_updated: "Tracking updated",
};

const humanize = (text: string) => {
  const spaced = text.replace(/[_-]+/g, " ").trim();
  return spaced ? spaced[0].toUpperCase() + spaced.slice(1) : text;
};

export function auditActionGroup(action: string): string {
  const prefix = action.split(".")[0] ?? action;
  return ACTION_GROUP_LABELS[prefix] ?? auditEntityLabels[prefix as AuditEntityType] ?? humanize(prefix);
}

/** "pooja_request.status_changed" -> "Status changed". */
export function auditActionVerb(action: string): string {
  const verb = action.split(".").slice(1).join(".") || action;
  return VERB_LABELS[verb] ?? humanize(verb);
}

/** "pooja_request.status_changed" -> "Pooja request · Status changed". */
export function auditActionLabel(action: string): string {
  return `${auditActionGroup(action)} · ${auditActionVerb(action)}`;
}

export function auditEntityLabel(entityType: string): string {
  return auditEntityLabels[entityType as AuditEntityType] ?? humanize(entityType);
}

/** Select options for every action, grouped by entity (sorted by group, then verb). */
export const auditActionOptions: Record<AuditAction, string> = Object.fromEntries(
  [...auditActionValues]
    .sort((a, b) => auditActionLabel(a).localeCompare(auditActionLabel(b)))
    .map((action) => [action, auditActionLabel(action)]),
) as Record<AuditAction, string>;

export const auditEntityOptions: Record<AuditEntityType, string> = Object.fromEntries(
  [...auditEntityTypeValues].sort((a, b) => auditEntityLabels[a].localeCompare(auditEntityLabels[b])).map((type) => [type, auditEntityLabels[type]]),
) as Record<AuditEntityType, string>;

export const auditRoleLabels: Record<AuditActorRole, string> = { admin: "Admin", astrologer: "Astrologer", customer: "Customer" };

/** Badge tone per verb family (deletions and sensitive reads stand out). */
export function auditActionVariant(action: string): "outline" | "unavailable" | "saffron" | "verified" {
  if (action.endsWith(".deleted")) return "unavailable";
  if (action === "chat.transcript_accessed" || action === "chat.flagged") return "saffron";
  if (action.endsWith(".created") || action.endsWith(".uploaded")) return "verified";
  return "outline";
}

const ID_ROUTES: Partial<Record<AuditEntityType, string>> = {
  astrologer: "/admin/astrologers",
  order: "/admin/orders",
  pooja_request: "/admin/pooja-requests",
  coupon: "/admin/coupons",
  banner: "/admin/banners",
  review: "/admin/reviews",
  support_ticket: "/admin/support",
  payout: "/admin/payouts",
  customer: "/admin/customers",
  calculator: "/admin/calculators",
  notification_template: "/admin/notifications",
  chat: "/admin/chats",
  consultation: "/admin/consultations",
  article: "/admin/articles",
  pooja: "/admin/poojas",
  store_category: "/admin/store/categories",
  product: "/admin/store/products",
  payment: "/admin/payments",
  product_review: "/admin/product-reviews",
};

const MASTER_DATA_ENTITIES = new Set(["languages", "countries", "states", "cities", "expertise", "specialties", "tags", "consultation-modes", "pooja-categories"]);

const field = (value: unknown, key: string): unknown =>
  typeof value === "object" && value !== null && !Array.isArray(value) ? (value as Record<string, unknown>)[key] : undefined;

/**
 * Admin route for the audited record, or null where none exists (media, horoscopes, deleted records still link and
 * show the detail screen's not-found state). Master data uses `metadata.{entity,key}`; wallets link to the owner's
 * wallet (`userId` in before/after); settings link to the settings screen.
 */
export function auditEntityHref(log: Pick<AdminAuditLog, "entityType" | "entityId" | "metadata" | "before" | "after">): string | null {
  const type = log.entityType as AuditEntityType;
  if (type === "settings") return "/admin/settings";
  if (type === "master_data") {
    const entity = field(log.metadata, "entity");
    const key = field(log.metadata, "key");
    if (typeof entity === "string" && MASTER_DATA_ENTITIES.has(entity) && typeof key === "string" && key) {
      return `/admin/master-data/${entity}/${encodeURIComponent(key)}/edit`;
    }
    return null;
  }
  if (type === "faq") return log.entityId ? `/admin/faqs/${log.entityId}/edit` : null;
  if (type === "pooja_package") {
    const poojaId = field(log.after, "poojaId") ?? field(log.before, "poojaId");
    return typeof poojaId === "string" && poojaId ? `/admin/poojas/${poojaId}` : null;
  }
  if (type === "wallet") {
    const userId = field(log.after, "userId") ?? field(log.before, "userId");
    return typeof userId === "string" && userId ? `/admin/wallets/${userId}` : null;
  }
  const base = ID_ROUTES[type];
  return base && log.entityId ? `${base}/${log.entityId}` : null;
}

/** Picker option (same shape as the Admin select/combobox options). */
export type AuditPickerOption = { value: string; label: string; description?: string };

/**
 * Action picker options grouped by entity: sorted by group, then verb. The label is the verb and the description
 * names the group, so a search for either ("pooja", "deleted") finds the action.
 */
export const auditActionPickerOptions: readonly AuditPickerOption[] = [...auditActionValues]
  .map((action) => ({ value: action, label: auditActionVerb(action), description: auditActionGroup(action) }))
  .sort((a, b) => a.description.localeCompare(b.description) || a.label.localeCompare(b.label));

/** Entity type picker options, sorted by label. */
export const auditEntityPickerOptions: readonly AuditPickerOption[] = Object.entries(auditEntityOptions).map(([value, label]) => ({ value, label }));

/** Semantic tone for an action pill (deletions and sensitive reads stand out). */
export function auditActionTone(action: string): "neutral" | "danger" | "warning" | "info" {
  const variant = auditActionVariant(action);
  return variant === "unavailable" ? "danger" : variant === "saffron" ? "warning" : variant === "verified" ? "info" : "neutral";
}
