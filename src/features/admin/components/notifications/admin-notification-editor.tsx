"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminForm } from "@/features/admin/data/use-admin-form";
import {
  NOTIFICATION_TEMPLATE_LIMITS,
  notificationChannelLabels,
  notificationChannelUsesSubject,
  notificationSubjectRequired,
  notificationTemplateEventLabels,
  notificationTemplateStatusLabels,
} from "@/features/notification-templates/constants/notification-template-status";
import { useCreateNotificationTemplate, useNotificationTemplateDetail, useUpdateNotificationTemplate } from "@/features/notification-templates/hooks/use-notification-template-admin";
import {
  emptyNotificationTemplateForm,
  notificationTemplateFormSchema,
  notificationTemplateFormToInput,
  notificationTemplateToFormValues,
  type NotificationTemplateFormValues,
} from "@/features/notification-templates/lib/notification-template-form";
import type {
  ManagedNotificationTemplate,
  NotificationChannel,
  NotificationTemplateInput,
  NotificationTemplateStatus,
} from "@/features/notification-templates/types/notification-template-admin";
import { AdminFormError, AdminFormField, AdminFormSection, fieldError } from "../shared/admin-form-section";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSelectField } from "../shared/admin-select-field";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { TemplateVariables } from "./template-variables";

/** `/admin/notifications/new` (no id) or `/admin/notifications/[id]/edit` (fetched by id). */
export function AdminNotificationEditor({ id }: { id?: string }) {
  const detail = useNotificationTemplateDetail(id ?? "");
  if (!id) return <TemplateForm />;
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="template">
      {() => <TemplateForm key={detail.data!.id} template={detail.data!} />}
    </AdminDetailFrame>
  );
}

function TemplateForm({ template }: { template?: ManagedNotificationTemplate }) {
  const router = useRouter();
  const create = useCreateNotificationTemplate();
  const update = useUpdateNotificationTemplate(template?.id ?? "");
  const { form, submit, formError, pending } = useAdminForm<NotificationTemplateFormValues, NotificationTemplateFormValues, NotificationTemplateInput, ManagedNotificationTemplate>({
    schema: notificationTemplateFormSchema,
    defaultValues: template ? notificationTemplateToFormValues(template) : emptyNotificationTemplateForm,
    mutation: template ? update : create,
    toInput: notificationTemplateFormToInput,
    onSuccess: (saved) => router.push(`/admin/notifications/${saved.id}`),
  });
  const errors = form.formState.errors;
  const channel = form.watch("channel");
  const status = form.watch("status");
  const content = form.watch("content");
  const usesSubject = notificationChannelUsesSubject(channel);
  const subjectLabel = channel === "push" ? "Title" : "Subject";
  const cancelHref = template ? `/admin/notifications/${template.id}` : "/admin/notifications";
  const revalidateSubject = () => {
    if (form.formState.isSubmitted || form.formState.touchedFields.subject) void form.trigger("subject");
  };
  const saveButton = (
    <Button type="submit" variant="conversion" size="sm" disabled={pending || (Boolean(template) && !form.formState.isDirty)}>
      {pending ? "Saving…" : template ? "Save changes" : "Create template"}
    </Button>
  );
  const cancelButton = (
    <Button asChild variant="outline" size="sm" className="bg-surface">
      <Link href={cancelHref}>Cancel</Link>
    </Button>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <AdminPageHeader
        title={template ? `Edit ${template.name}` : "New template"}
        description={template ? undefined : "Choose the event and channel, then write the message."}
        backHref={cancelHref}
        backLabel={template ? "Back to template" : "Notification templates"}
        actions={cancelButton}
        primaryAction={saveButton}
      />
      <AdminFormError message={formError} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <AdminFormSection title="Template">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminFormField label="Name" required error={fieldError(errors, "name")}>
                {(control) => <Input {...control} {...form.register("name")} maxLength={NOTIFICATION_TEMPLATE_LIMITS.name[1]} />}
              </AdminFormField>
              <Controller
                name="event"
                control={form.control}
                render={({ field }) => (
                  <AdminFormField label="Event" required description="What happened that this message is about." error={fieldError(errors, "event")}>
                    {(control) => (
                      <AdminSelectField
                        control={control}
                        value={field.value}
                        onValueChange={(value) => field.onChange(value ?? "")}
                        onBlur={field.onBlur}
                        options={notificationTemplateEventLabels}
                        placeholder="Choose an event"
                        other={{ label: "Other event…", placeholder: "custom_event", maxLength: NOTIFICATION_TEMPLATE_LIMITS.event[1], inputLabel: "Custom event key" }}
                        disabled={pending}
                      />
                    )}
                  </AdminFormField>
                )}
              />
            </div>
          </AdminFormSection>
          <AdminFormSection title="Message" description="Use {{lower_snake}} placeholders such as {{customer_name}}. Variables are detected when you save.">
            {usesSubject ? (
              <AdminFormField label={subjectLabel} required={notificationSubjectRequired(channel, status)} error={fieldError(errors, "subject")}>
                {(control) => <Input {...control} {...form.register("subject")} maxLength={NOTIFICATION_TEMPLATE_LIMITS.subject} />}
              </AdminFormField>
            ) : null}
            <AdminFormField
              label="Content"
              required
              description={channel === "sms" ? `${content.length} characters` : undefined}
              error={fieldError(errors, "content")}
            >
              {(control) => <Textarea {...control} {...form.register("content")} className="min-h-48 resize-y font-mono text-sm leading-6" maxLength={NOTIFICATION_TEMPLATE_LIMITS.content} />}
            </AdminFormField>
          </AdminFormSection>
        </div>
        <aside className="min-w-0 space-y-5">
          <AdminFormSection title="Configuration">
            <Controller
              name="channel"
              control={form.control}
              render={({ field }) => (
                <AdminFormField label="Channel" error={fieldError(errors, "channel")}>
                  {(control) => (
                    <AdminSelectField
                      control={control}
                      value={field.value}
                      onBlur={field.onBlur}
                      options={notificationChannelLabels}
                      onValueChange={(value) => {
                        if (!value) return;
                        field.onChange(value as NotificationChannel);
                        revalidateSubject();
                      }}
                      disabled={pending}
                    />
                  )}
                </AdminFormField>
              )}
            />
            <Controller
              name="status"
              control={form.control}
              render={({ field }) => (
                <AdminFormField label="Status" description="Only active templates are sent." error={fieldError(errors, "status")}>
                  {(control) => (
                    <AdminSelectField
                      control={control}
                      value={field.value}
                      onBlur={field.onBlur}
                      options={notificationTemplateStatusLabels}
                      onValueChange={(value) => {
                        if (!value) return;
                        field.onChange(value as NotificationTemplateStatus);
                        revalidateSubject();
                      }}
                      disabled={pending}
                    />
                  )}
                </AdminFormField>
              )}
            />
          </AdminFormSection>
          <AdminFormSection title="Variables">
            {template ? (
              <>
                <TemplateVariables variables={template.variables} />
                <p className="text-xs text-muted-foreground">As last saved. Saving recalculates them from the subject and content.</p>
              </>
            ) : (
              <p className="text-xs text-muted-foreground">Detected from the subject and content when the template is saved.</p>
            )}
          </AdminFormSection>
        </aside>
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-4 md:hidden">
        {cancelButton}
        {saveButton}
      </div>
    </form>
  );
}
