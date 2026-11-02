"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  notificationChannelLabels,
  notificationChannelUsesSubject,
  notificationEventLabel,
  notificationTemplateStatusLabels,
  notificationTemplateStatusVariants,
} from "@/features/notification-templates/constants/notification-template-status";
import { notificationTemplateDeleteOptions, useNotificationTemplateDetail } from "@/features/notification-templates/hooks/use-notification-template-admin";
import { formatDateTime } from "../../lib/format";
import { AdminDeleteAction } from "../shared/admin-delete-action";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";
import { TemplateVariables } from "./template-variables";

export function AdminNotificationDetailView({ id }: { id: string }) {
  const detail = useNotificationTemplateDetail(id);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="template">
      {() => {
        const template = detail.data!;
        const active = template.status === "active";
        const subjectLabel = template.channel === "push" ? "Title" : "Subject";
        return (
          <section className="space-y-5">
            <AdminPageHeader
              title={template.name}
              backHref="/admin/notifications"
              backLabel="Notification templates"
              meta={
                <>
                  <AdminStatusBadge status={template.status} labels={notificationTemplateStatusLabels} variants={notificationTemplateStatusVariants} />
                  <AdminStatusPill tone="neutral" dot={false}>
                    {notificationChannelLabels[template.channel]}
                  </AdminStatusPill>
                  <span>{notificationEventLabel(template.event)}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">Updated {formatDateTime(template.updatedAt)}</span>
                </>
              }
              actions={
                <>
                  <AdminDeleteAction
                    id={template.id}
                    entityLabel="template"
                    {...notificationTemplateDeleteOptions}
                    redirectTo="/admin/notifications"
                    disabled={active}
                    triggerClassName="bg-surface text-destructive hover:text-destructive"
                    description="This removes the notification template. Notifications for this event stop using it."
                  />
                  <Button asChild variant="outline" size="sm" className="bg-surface">
                    <Link href={`/admin/notifications/${template.id}/edit`}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                </>
              }
            />
            {active ? <p className="-mt-2 text-xs text-muted-foreground">Active templates cannot be deleted. Set the status to inactive or draft first.</p> : null}
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Message">
                  {notificationChannelUsesSubject(template.channel) ? (
                    <div className="mb-4">
                      <p className="text-[13px] text-muted-foreground">{subjectLabel}</p>
                      <p className="mt-0.5 font-medium">{template.subject ?? <span className="font-normal text-muted-foreground">No {subjectLabel.toLowerCase()}</span>}</p>
                    </div>
                  ) : null}
                  <p className="text-[13px] text-muted-foreground">Content</p>
                  <p className="mt-1.5 whitespace-pre-wrap rounded-lg border border-border bg-muted/50 p-4 text-sm leading-6">{template.content}</p>
                </AdminSectionCard>
              </div>
              <AdminDetailStickyRail className="space-y-5">
                <AdminSectionCard title="Configuration">
                  <div className="divide-y divide-border">
                    <DetailRow label="Event" value={notificationEventLabel(template.event)} />
                    <DetailRow label="Channel" value={notificationChannelLabels[template.channel]} />
                    <DetailRow label="Status" value={notificationTemplateStatusLabels[template.status]} />
                    <DetailRow label="Created" value={formatDateTime(template.createdAt)} />
                    <DetailRow label="Updated" value={formatDateTime(template.updatedAt)} />
                  </div>
                </AdminSectionCard>
                <AdminSectionCard title="Variables" description="Placeholders filled in when the message is sent.">
                  <TemplateVariables variables={template.variables} />
                </AdminSectionCard>
              </AdminDetailStickyRail>
            </div>
          </section>
        );
      }}
    </AdminDetailFrame>
  );
}
