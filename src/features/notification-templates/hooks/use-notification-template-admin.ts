"use client";

import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import {
  createNotificationTemplate,
  deleteNotificationTemplate,
  getNotificationTemplate,
  listNotificationTemplates,
  updateNotificationTemplate,
} from "../api/notification-template-admin-api";
import { notificationTemplateKeys } from "../queries/notification-template-query-keys";
import { notificationTemplateListConfig } from "../state/notification-template-list-state";
import type { NotificationTemplateInput } from "../types/notification-template-admin";

export function useNotificationTemplateList() {
  return useAdminList(notificationTemplateListConfig, notificationTemplateKeys.list, listNotificationTemplates);
}

export function useNotificationTemplateDetail(id: string) {
  return useAdminDetail(notificationTemplateKeys.detail(id), (signal) => getNotificationTemplate(id, signal), Boolean(id));
}

export function useCreateNotificationTemplate() {
  return useAdminMutation({
    mutationFn: (input: NotificationTemplateInput) => createNotificationTemplate(input),
    invalidate: [notificationTemplateKeys.all],
    successMessage: "Template created",
    toastErrors: false,
  });
}

export function useUpdateNotificationTemplate(id: string) {
  return useAdminMutation({
    mutationFn: (input: NotificationTemplateInput) => updateNotificationTemplate(id, input),
    invalidate: [notificationTemplateKeys.all],
    successMessage: "Template saved",
    toastErrors: false,
  });
}

/** Options for `AdminDeleteAction` (views never import the API module). */
export const notificationTemplateDeleteOptions = {
  mutationFn: deleteNotificationTemplate,
  invalidate: [notificationTemplateKeys.all],
  remove: (id: string) => [notificationTemplateKeys.detail(id)],
};
