"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BellRing, Eye, Pencil, Plus } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import {
  notificationChannelLabels,
  notificationEventFilterOptions,
  notificationEventLabel,
  notificationTemplateStatusLabels,
  notificationTemplateStatusVariants,
} from "@/features/notification-templates/constants/notification-template-status";
import { useNotificationTemplateList } from "@/features/notification-templates/hooks/use-notification-template-admin";
import type { ManagedNotificationTemplate } from "@/features/notification-templates/types/notification-template-admin";
import { formatDateOnly } from "../../lib/format";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";

function NewTemplateButton() {
  return (
    <Button asChild variant="conversion" size="sm">
      <Link href="/admin/notifications/new">
        <Plus aria-hidden="true" />
        New template
      </Link>
    </Button>
  );
}

function TemplateMobileCard({ template }: { template: ManagedNotificationTemplate }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/admin/notifications/${template.id}`} className="line-clamp-2 font-medium text-foreground hover:underline">
            {template.name}
          </Link>
          <p className="mt-0.5 truncate text-xs text-muted-foreground">{notificationEventLabel(template.event)}</p>
        </div>
        <AdminRowActions
          label={`Actions for ${template.name}`}
          actions={[
            { label: "View", icon: Eye, href: `/admin/notifications/${template.id}` },
            { label: "Edit", icon: Pencil, href: `/admin/notifications/${template.id}/edit` },
          ]}
          className="-mr-1.5 -mt-1 shrink-0"
        />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <AdminStatusBadge status={template.status} labels={notificationTemplateStatusLabels} variants={notificationTemplateStatusVariants} />
          <AdminStatusPill tone="neutral" dot={false}>
            {notificationChannelLabels[template.channel]}
          </AdminStatusPill>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">Updated {formatDateOnly(template.updatedAt)}</span>
      </div>
    </div>
  );
}

export function AdminNotificationsView() {
  const list = useNotificationTemplateList();
  const currentEvent = list.state.filters.event;
  const eventOptions = useMemo(() => notificationEventFilterOptions(currentEvent), [currentEvent]);
  const columns = useMemo<ColumnDef<ManagedNotificationTemplate>[]>(
    () => [
      {
        id: "template",
        header: "Template",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-56 max-w-md">
            <Link href={`/admin/notifications/${row.original.id}`} className="block truncate font-medium text-foreground hover:underline">
              {row.original.name}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{row.original.subject ?? row.original.content}</p>
          </div>
        ),
      },
      {
        id: "event",
        header: "Event",
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm text-muted-foreground">{notificationEventLabel(row.original.event)}</span>,
      },
      {
        id: "channel",
        header: "Channel",
        enableSorting: false,
        cell: ({ row }) => (
          <AdminStatusPill tone="neutral" dot={false}>
            {notificationChannelLabels[row.original.channel]}
          </AdminStatusPill>
        ),
      },
      {
        id: "status",
        header: "Status",
        enableSorting: false,
        cell: ({ row }) => <AdminStatusBadge status={row.original.status} labels={notificationTemplateStatusLabels} variants={notificationTemplateStatusVariants} />,
      },
      { id: "variables", header: "Variables", enableSorting: false, cell: ({ row }) => <span className="text-sm tabular-nums text-muted-foreground">{row.original.variables.length}</span> },
      {
        id: "updated",
        header: "Updated",
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatDateOnly(row.original.updatedAt)}</span>,
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/notifications/${row.original.id}`} label={`View ${row.original.name}`} icon={Eye} />
            <AdminRowActionLink href={`/admin/notifications/${row.original.id}/edit`} label={`Edit ${row.original.name}`} icon={Pencil} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Notification templates"
      description="Message templates for customer and astrologer notifications, by event and channel."
      noun="templates"
      primaryAction={<NewTemplateButton />}
      list={list}
      columns={columns}
      searchPlaceholder="Search name, event or content…"
      searchMaxLength={200}
      filters={[
        { key: "event", allLabel: "All events", options: eventOptions },
        { key: "channel", allLabel: "All channels", options: notificationChannelLabels },
        { key: "status", allLabel: "All statuses", options: notificationTemplateStatusLabels },
      ]}
      emptyLabel="No notification templates yet"
      emptyDescription="Create a template for an event, such as a payment or a consultation update."
      emptyIcon={BellRing}
      emptyAction={<NewTemplateButton />}
      renderMobileCard={(template) => <TemplateMobileCard key={template.id} template={template} />}
    />
  );
}
