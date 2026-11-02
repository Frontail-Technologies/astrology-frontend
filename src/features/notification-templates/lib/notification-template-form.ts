import { z } from "zod";

import { NOTIFICATION_TEMPLATE_LIMITS, notificationChannelUsesSubject, notificationSubjectRequired } from "../constants/notification-template-status.ts";
import type { ManagedNotificationTemplate, NotificationChannel, NotificationTemplateInput, NotificationTemplateStatus } from "../types/notification-template-admin.ts";

export type NotificationTemplateFormValues = {
  name: string;
  channel: NotificationChannel;
  event: string;
  subject: string;
  content: string;
  status: NotificationTemplateStatus;
};

export const emptyNotificationTemplateForm: NotificationTemplateFormValues = { name: "", channel: "email", event: "", subject: "", content: "", status: "draft" };

const { name, event, subject, content } = NOTIFICATION_TEMPLATE_LIMITS;

export const notificationTemplateFormSchema = z
  .object({
    name: z.string().trim().min(name[0], { error: "Enter a name (at least 2 characters)." }).max(name[1]),
    channel: z.enum(["email", "sms", "whatsapp", "push"]),
    event: z.string().trim().min(event[0], { error: "Enter the event key (at least 2 characters)." }).max(event[1]),
    subject: z.string().trim().max(subject),
    content: z.string().trim().min(1, { error: "Write the message content." }).max(content),
    status: z.enum(["active", "inactive", "draft"]),
  })
  .superRefine((values, context) => {
    if (notificationSubjectRequired(values.channel, values.status) && !values.subject.trim()) {
      context.addIssue({ code: "custom", path: ["subject"], message: values.channel === "push" ? "Active push templates need a title." : "Active email templates need a subject." });
    }
  });

export function notificationTemplateToFormValues(template: ManagedNotificationTemplate): NotificationTemplateFormValues {
  return { name: template.name, channel: template.channel, event: template.event, subject: template.subject ?? "", content: template.content, status: template.status };
}

/** API body. Channels without a subject (SMS, WhatsApp) always send `subject: null`. */
export function notificationTemplateFormToInput(values: NotificationTemplateFormValues): NotificationTemplateInput {
  const trimmedSubject = values.subject.trim();
  return {
    name: values.name.trim(),
    channel: values.channel,
    event: values.event.trim(),
    subject: notificationChannelUsesSubject(values.channel) && trimmedSubject ? trimmedSubject : null,
    content: values.content.trim(),
    status: values.status,
  };
}
