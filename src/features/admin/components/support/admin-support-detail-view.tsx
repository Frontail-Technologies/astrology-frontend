"use client";

import Link from "next/link";
import { useState } from "react";
import { Lock, XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  ticketCategoryLabels,
  ticketPriorityLabels,
  ticketRelatedEntityRoutes,
  ticketSenderLabel,
  ticketStatusLabels,
  ticketStatusVariants,
} from "@/features/support/constants/support-status";
import { useAddInternalNote, useReplyToTicket, useTicketDetail, useUpdateTicketPriority, useUpdateTicketStatus } from "@/features/support/hooks/use-support-admin";
import type { TicketPriority, TicketStatus } from "@/features/support/types/support-admin";
import { cn } from "@/lib/utils";
import { formatDateTime, formatOptionalDateTime } from "../../lib/format";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminEmptyState } from "../shared/admin-empty-state";
import { AdminFormField } from "../shared/admin-form-section";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminSelectField } from "../shared/admin-select-field";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";
import { useConfirmAction } from "../shared/use-confirm-action";

function Composer({
  label,
  placeholder,
  submitLabel,
  disabled,
  disabledHint,
  mutation,
  primary = false,
}: {
  label: string;
  placeholder: string;
  submitLabel: string;
  disabled?: boolean;
  disabledHint?: string;
  mutation: ReturnType<typeof useReplyToTicket>;
  primary?: boolean;
}) {
  const [body, setBody] = useState("");
  const id = label.toLowerCase().replace(/\s+/g, "-");
  return (
    <form
      className="grid gap-2"
      onSubmit={(event) => {
        event.preventDefault();
        if (!body.trim()) return;
        mutation.mutate(body.trim(), { onSuccess: () => setBody("") });
      }}
    >
      <Label htmlFor={id}>{label}</Label>
      <Textarea id={id} rows={3} value={body} maxLength={5000} placeholder={disabled ? disabledHint : placeholder} disabled={disabled || mutation.isPending} onChange={(event) => setBody(event.target.value)} />
      {mutation.error ? <p role="alert" className="text-sm text-destructive">{mutation.error.message}</p> : null}
      <div className="flex justify-end">
        <Button type="submit" size="sm" variant={primary ? "conversion" : "outline"} className={primary ? undefined : "bg-surface"} disabled={disabled || mutation.isPending || !body.trim()}>
          {mutation.isPending ? "Sending…" : submitLabel}
        </Button>
      </div>
    </form>
  );
}

const transitionLabel = (next: TicketStatus) => (next === "open" ? "Reopen" : next === "closed" ? "Close ticket" : `Mark ${ticketStatusLabels[next].toLowerCase()}`);

export function AdminSupportDetailView({ id }: { id: string }) {
  const detail = useTicketDetail(id);
  const reply = useReplyToTicket(id);
  const note = useAddInternalNote(id);
  const status = useUpdateTicketStatus(id);
  const priority = useUpdateTicketPriority(id);
  const confirm = useConfirmAction<TicketStatus>(status);
  const { target } = confirm;

  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="ticket">
      {() => {
        const ticket = detail.data!;
        const closed = ticket.status === "closed";
        const related = ticket.relatedEntity && ticketRelatedEntityRoutes[ticket.relatedEntity.type];
        const relatedLabel = ticket.relatedEntity ? (ticketCategoryLabels as Record<string, string>)[ticket.relatedEntity.type] ?? ticket.relatedEntity.type : null;
        const forward = ticket.allowedTransitions.filter((next) => next !== "closed");
        const canClose = ticket.allowedTransitions.includes("closed");
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={ticket.subject}
              backHref="/admin/support"
              backLabel="Support"
              meta={
                <>
                  <AdminStatusBadge status={ticket.status} labels={ticketStatusLabels} variants={ticketStatusVariants} />
                  <span>{ticketCategoryLabels[ticket.category]}</span>
                  <span className="tabular-nums">Opened {formatDateTime(ticket.createdAt)}</span>
                </>
              }
              actions={
                <>
                  {forward.map((next) => (
                    <Button key={next} size="sm" variant="outline" className="bg-surface" onClick={() => confirm.open(next)}>
                      {transitionLabel(next)}
                    </Button>
                  ))}
                  {canClose ? (
                    <AdminRowActions
                      label="More ticket actions"
                      className="size-9 min-h-9 border border-border bg-surface"
                      actions={[{ label: "Close ticket", icon: XCircle, destructive: true, onSelect: () => confirm.open("closed") }]}
                    />
                  ) : null}
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Conversation" description={ticket.messages.length ? `${ticket.messages.length} ${ticket.messages.length === 1 ? "message" : "messages"}` : undefined}>
                  {ticket.messages.length === 0 ? (
                    <AdminEmptyState variant="inline" title="No messages yet" description="Replies and internal notes appear here." />
                  ) : (
                    <ol className="space-y-2.5">
                      {ticket.messages.map((message) => (
                        <li key={message.id} className={cn("rounded-[calc(var(--radius)-2px)] border p-3", message.internal ? "border-warning/30 bg-warning/5" : message.senderType === "admin" ? "border-border bg-muted/60" : "border-border")}>
                          <div className="mb-1 flex flex-wrap items-center justify-between gap-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1.5 font-medium text-foreground">
                              {ticketSenderLabel(message.senderType)}
                              {message.internal ? (
                                <AdminStatusPill tone="warning" dot={false}>
                                  <Lock className="mr-1 inline size-3" aria-hidden="true" />
                                  Internal note
                                </AdminStatusPill>
                              ) : null}
                            </span>
                            <time className="tabular-nums" dateTime={message.createdAt}>
                              {formatDateTime(message.createdAt)}
                            </time>
                          </div>
                          <p className="whitespace-pre-line wrap-break-word text-sm leading-relaxed">{message.body}</p>
                        </li>
                      ))}
                    </ol>
                  )}
                </AdminSectionCard>
                <AdminSectionCard title="Respond">
                  <div className="space-y-5">
                    <Composer label="Reply to customer" placeholder="Visible to the customer" submitLabel="Send reply" disabled={closed} disabledHint="Closed tickets cannot receive replies." mutation={reply} primary />
                    <Composer label="Internal note" placeholder="Visible to admins only" submitLabel="Add note" mutation={note} />
                  </div>
                </AdminSectionCard>
              </div>
              <AdminDetailStickyRail className="space-y-5">
                <AdminSectionCard title="Ticket">
                  <div className="divide-y divide-border">
                    <DetailRow
                      label="Customer"
                      value={ticket.customer ? <Link className="break-all hover:underline" href={`/admin/customers/${ticket.customer.id}`}>{ticket.customer.email ?? "View customer"}</Link> : "Not linked"}
                    />
                    {ticket.relatedEntity ? (
                      <DetailRow label="About" value={related ? <Link className="hover:underline" href={`${related}/${ticket.relatedEntity.id}`}>{relatedLabel}</Link> : relatedLabel} />
                    ) : null}
                    <DetailRow label="Opened" value={<span className="tabular-nums">{formatDateTime(ticket.createdAt)}</span>} />
                    <DetailRow label="Resolved" value={<span className="tabular-nums">{formatOptionalDateTime(ticket.resolvedAt, "Not yet")}</span>} />
                    <DetailRow label="Closed" value={<span className="tabular-nums">{formatOptionalDateTime(ticket.closedAt, "Not yet")}</span>} />
                  </div>
                  <AdminFormField label="Priority" className="mt-4" error={priority.error?.message}>
                    {(control) => (
                      <AdminSelectField
                        control={control}
                        value={ticket.priority}
                        onValueChange={(value) => {
                          if (value && value !== ticket.priority) priority.mutate(value as TicketPriority);
                        }}
                        options={ticketPriorityLabels}
                        disabled={priority.isPending}
                      />
                    )}
                  </AdminFormField>
                  {ticket.allowedTransitions.length === 0 ? <p className="mt-3 text-[13px] text-muted-foreground">Closed tickets are final. Internal notes can still be added.</p> : null}
                </AdminSectionCard>
              </AdminDetailStickyRail>
            </div>
            <AdminConfirmDialog
              {...confirm.dialogProps}
              title={target === "closed" ? "Close this ticket?" : `Move ticket to ${target ? ticketStatusLabels[target].toLowerCase() : ""}?`}
              description={target === "closed" ? "Closing is final: the customer can no longer reply and the ticket cannot be reopened." : "The customer sees the updated status."}
              confirmLabel={target === "closed" ? "Close ticket" : "Update status"}
              destructive={target === "closed"}
              onConfirm={() => {
                if (target) status.mutate(target, { onSuccess: confirm.close });
              }}
            />
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
