import type { NotificationChannel, NotificationTemplateStatus } from "../types/notification-template-admin.ts";

export const notificationChannelLabels: Record<NotificationChannel, string> = { email: "Email", sms: "SMS", whatsapp: "WhatsApp", push: "Push" };
export const notificationTemplateStatusLabels: Record<NotificationTemplateStatus, string> = { active: "Active", inactive: "Inactive", draft: "Draft" };
export const notificationTemplateStatusVariants: Record<NotificationTemplateStatus, "online" | "muted" | "outline"> = { active: "online", inactive: "muted", draft: "outline" };

/** Returned when deleting an active template (deactivate it first). */
export const NOTIFICATION_TEMPLATE_ACTIVE = "NOTIFICATION_TEMPLATE_ACTIVE";

export const NOTIFICATION_TEMPLATE_LIMITS = { name: [2, 180], event: [2, 120], subject: 240, content: 20_000 } as const;

/** Mirrors the server rule: active email and push templates need a subject (push uses it as the title). */
export function notificationSubjectRequired(channel: NotificationChannel, status: NotificationTemplateStatus): boolean {
  return status === "active" && (channel === "email" || channel === "push");
}

/** Channels where a subject/title is meaningful; SMS and WhatsApp send only the content. */
export function notificationChannelUsesSubject(channel: NotificationChannel): boolean {
  return channel === "email" || channel === "push";
}

/** Valid `event` list filter (exact match on the server). */
export const isNotificationEventFilter = (value: string) => value.trim() === value && value.length >= 1 && value.length <= NOTIFICATION_TEMPLATE_LIMITS.event[1];

/**
 * Canonical notification events: the notification types the API sends (`api/src/modules/notifications/notification.types.ts`).
 * The template `event` field accepts any 2–120 character key, so editors keep an "Other" escape.
 */
export const notificationTemplateEventLabels: Readonly<Record<string, string>> = {
  consultation_update: "Consultation update",
  chat_message: "New chat message",
  support_reply: "Support reply",
  review_update: "Review update",
  payment_succeeded: "Payment succeeded",
  payment_failed: "Payment failed",
  pooja_request_update: "Pooja request update",
  payout_update: "Payout update",
  system: "System announcement",
};

/** Human label for an event key; custom keys are shown as written. */
export const notificationEventLabel = (event: string) => (Object.hasOwn(notificationTemplateEventLabels, event) ? notificationTemplateEventLabels[event]! : event);

/** Event filter options: the canonical set plus the current URL value when it is a custom key. */
export function notificationEventFilterOptions(current: string | undefined): Record<string, string> {
  if (!current || Object.hasOwn(notificationTemplateEventLabels, current)) return { ...notificationTemplateEventLabels };
  return { ...notificationTemplateEventLabels, [current]: current };
}
