"use client";

import Link from "next/link";
import { useState } from "react";
import { CalendarClock, UserRoundCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  POOJA_REQUEST_CONFLICT_HINTS,
  poojaRequestStatusLabels,
  poojaRequestStatusVariants,
  poojaRequestTransitionDescriptions,
  poojaRequestTransitionLabels,
  poojaRequestTransitionOrder,
} from "@/features/pooja-requests/constants/pooja-request-status";
import { useAstrologerPicker } from "@/features/astrologers/hooks/use-astrologer-admin";
import { usePoojaRequestAssignment, usePoojaRequestDetail, usePoojaRequestSchedule, usePoojaRequestStatusUpdate } from "@/features/pooja-requests/hooks/use-pooja-request-admin";
import type { ManagedPoojaRequest } from "@/features/pooja-requests/types/pooja-request-admin";
import { formatDateOnly, formatDateTime, formatINR, formatOptionalDateTime } from "../../lib/format";
import { AdminCombobox } from "../shared/admin-combobox";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminDateTimeInput } from "../shared/admin-datetime-input";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { AdminTransitionActions } from "../shared/admin-transition-actions";
import { useConfirmAction } from "../shared/use-confirm-action";

function ConflictHint({ code }: { code: string | undefined }) {
  const hint = code ? POOJA_REQUEST_CONFLICT_HINTS[code] : undefined;
  return hint ? <p className="rounded-[calc(var(--radius)-2px)] border border-warning/30 bg-warning/10 p-3 text-sm">{hint}</p> : null;
}

function Paragraph({ title, text }: { title: string; text: string | null }) {
  if (!text) return null;
  return (
    <AdminSectionCard title={title}>
      <p className="whitespace-pre-line text-sm leading-6">{text}</p>
    </AdminSectionCard>
  );
}

function ScheduleAction({ request }: { request: ManagedPoojaRequest }) {
  const schedule = usePoojaRequestSchedule(request.id);
  const confirm = useConfirmAction<"schedule">(schedule);
  const [when, setWhen] = useState<string | null>(null);
  const rescheduling = request.status === "scheduled";
  const label = rescheduling ? "Reschedule" : "Schedule";
  const open = () => {
    setWhen(request.scheduledStartAt ?? null);
    confirm.open("schedule");
  };
  return (
    <>
      <Button type="button" size="sm" variant="outline" className="w-full justify-start bg-surface" disabled={!request.canSchedule || schedule.isPending} onClick={open}>
        <CalendarClock aria-hidden="true" />
        {label}
      </Button>
      {!request.canSchedule ? <p className="text-xs text-muted-foreground">Accept the request before scheduling it.</p> : null}
      <AdminConfirmDialog
        {...confirm.dialogProps}
        title={rescheduling ? "Reschedule pooja?" : "Schedule pooja?"}
        description={
          rescheduling
            ? `Currently ${formatOptionalDateTime(request.scheduledStartAt)}. The customer is notified of the new time.`
            : "The request moves to Scheduled and the customer sees this date and time."
        }
        confirmLabel={rescheduling ? "Save new time" : "Schedule"}
        confirmDisabled={!when || (rescheduling && when === request.scheduledStartAt)}
        onConfirm={() => {
          if (when) schedule.mutate({ scheduledStartAt: when }, { onSuccess: confirm.close });
        }}
      >
        <div className="grid gap-1.5">
          <Label htmlFor="pooja-request-when">Date and time (your local time)</Label>
          <AdminDateTimeInput id="pooja-request-when" value={when} onChange={setWhen} disabled={schedule.isPending} />
          {request.requestedDate ? <p className="text-xs text-muted-foreground">Customer preferred {formatDateOnly(request.requestedDate)}.</p> : null}
        </div>
        <ConflictHint code={schedule.error?.code} />
      </AdminConfirmDialog>
    </>
  );
}

/** Who performs the pooja. Only verified astrologers are offered; the chosen astrologer sees it in their app schedule. */
function AssignmentCard({ request }: { request: ManagedPoojaRequest }) {
  const assign = usePoojaRequestAssignment(request.id);
  const confirm = useConfirmAction<"assign">(assign);
  const [choice, setChoice] = useState<string | null>(null);
  const astrologers = useAstrologerPicker(confirm.dialogProps.open);
  const current = request.assignedAstrologer;
  const open = () => {
    setChoice(request.assignedAstrologerUserId);
    confirm.open("assign");
  };
  return (
    <AdminSectionCard title="Performing astrologer">
      <div className="grid gap-3">
        <p className="text-sm">{current ? <span className="font-medium">{current.displayName}</span> : <span className="text-muted-foreground">Not assigned yet</span>}</p>
        {current ? <p className="text-xs text-muted-foreground">{request.assignmentSource === "customer" ? "Chosen by the customer while booking" : "Assigned by the team"}{request.assignedAt ? ` · ${formatDateTime(request.assignedAt)}` : ""}</p> : null}
        {request.panditRespondBy ? <p className="rounded-[calc(var(--radius)-2px)] bg-muted p-2 text-xs">Waiting for the pandit to accept. If they don&apos;t answer by {formatDateTime(request.panditRespondBy)}, it comes back to the team.</p> : null}
        {!current && request.returnedToTeamAt && request.canAssign ? (
          <p className="rounded-[calc(var(--radius)-2px)] border border-warning/30 bg-warning/10 p-2 text-xs">
            The customer&apos;s chosen pandit {request.returnReason === "declined" ? "declined" : "didn't answer in time"} ({formatDateTime(request.returnedToTeamAt)}). Assign another pandit; the customer has been told.
          </p>
        ) : null}
        <Button type="button" size="sm" variant="outline" className="w-full justify-start bg-surface" disabled={!request.canAssign || assign.isPending} onClick={open}>
          <UserRoundCheck aria-hidden="true" />
          {current ? "Change astrologer" : "Assign astrologer"}
        </Button>
        {!request.canAssign ? <p className="text-xs text-muted-foreground">Closed requests can&apos;t be reassigned.</p> : null}
      </div>
      <AdminConfirmDialog
        {...confirm.dialogProps}
        title={current ? "Change performing astrologer?" : "Assign an astrologer?"}
        description="The astrologer is notified and sees the pooja, date and sankalp names in their app. Customer contact details stay private."
        confirmLabel={choice ? "Save assignment" : "Remove assignment"}
        confirmDisabled={choice === request.assignedAstrologerUserId}
        onConfirm={() => assign.mutate({ astrologerUserId: choice }, { onSuccess: confirm.close })}
      >
        <div className="grid gap-1.5">
          <Label>Astrologer</Label>
          <AdminCombobox
            value={choice}
            onValueChange={setChoice}
            options={(astrologers.data?.items ?? []).map((astrologer) => ({ value: astrologer.userId, label: astrologer.displayName }))}
            selectedLabel={current && choice === current.userId ? current.displayName : undefined}
            loading={astrologers.isPending}
            placeholder="Choose an astrologer"
            searchPlaceholder="Search astrologers…"
            clearable
          />
          <p className="text-xs text-muted-foreground">Only verified astrologers are listed. Clear the choice to remove the assignment.</p>
        </div>
        {assign.error?.code === "POOJA_REQUEST_NOT_ASSIGNABLE" ? <p className="rounded-[calc(var(--radius)-2px)] border border-warning/30 bg-warning/10 p-3 text-sm">This request is closed, so its astrologer can no longer change.</p> : null}
      </AdminConfirmDialog>
    </AdminSectionCard>
  );
}

function RequestActions({ request }: { request: ManagedPoojaRequest }) {
  const update = usePoojaRequestStatusUpdate(request.id);
  return (
    <div className="grid gap-3">
      <ScheduleAction request={request} />
      <AdminTransitionActions
        allowed={request.allowedTransitions}
        labels={poojaRequestTransitionLabels}
        descriptions={poojaRequestTransitionDescriptions}
        variants={{ accepted: "conversion", completed: "conversion", rejected: "destructive", cancelled: "destructive" }}
        order={poojaRequestTransitionOrder}
        mutation={update}
        onConfirm={(status, _reason, close) => update.mutate({ status }, { onSuccess: close })}
        finalStateText={`This request is ${poojaRequestStatusLabels[request.status].toLowerCase()}; no further changes are possible.`}
        className="grid"
      >
        {() => <ConflictHint code={update.error?.code} />}
      </AdminTransitionActions>
    </div>
  );
}

export function AdminPoojaRequestDetailView({ requestId }: { requestId: string }) {
  const detail = usePoojaRequestDetail(requestId);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="pooja request">
      {() => {
        const request = detail.data!;
        const customerLabel = request.customerName || request.email || request.phone;
        const address = [request.addressLine1, request.addressLine2, `${request.city}, ${request.state}${request.postalCode ? ` ${request.postalCode}` : ""}`, request.country].filter(Boolean);
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={request.poojaName}
              description={`Requested by ${customerLabel}`}
              backHref="/admin/pooja-requests"
              backLabel="Pooja requests"
              meta={
                <>
                  <AdminStatusBadge status={request.status} labels={poojaRequestStatusLabels} variants={poojaRequestStatusVariants} />
                  <span className="tabular-nums">Requested {formatDateTime(request.createdAt)}</span>
                  {request.scheduledStartAt ? <span className="tabular-nums">Scheduled {formatDateTime(request.scheduledStartAt)}</span> : null}
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Booking">
                  <div className="divide-y divide-border">
                    <DetailRow label="Pooja" value={<Link className="hover:underline" href={`/admin/poojas/${request.poojaId}`}>{request.poojaName}</Link>} />
                    <DetailRow label="Amount" value={request.pricePaise === null ? "On request" : formatINR(request.pricePaise)} />
                    <DetailRow label="Preferred date" value={request.requestedDate ? formatDateOnly(request.requestedDate) : "Flexible"} />
                    <DetailRow label="Scheduled for" value={formatOptionalDateTime(request.scheduledStartAt, "Not scheduled")} />
                  </div>
                </AdminSectionCard>
                <div className="grid gap-5 md:grid-cols-2">
                  <AdminSectionCard title="Customer">
                    <div className="divide-y divide-border">
                      <DetailRow label="Name" value={<Link className="hover:underline" href={`/admin/customers/${request.customerUserId}`}>{customerLabel}</Link>} />
                      <DetailRow label="Phone" value={<a className="hover:underline" href={`tel:${request.phone.replace(/[^+\d]/g, "")}`}>{request.phone}</a>} />
                      <DetailRow label="Email" value={request.email ? <a className="break-all hover:underline" href={`mailto:${request.email}`}>{request.email}</a> : "—"} />
                    </div>
                  </AdminSectionCard>
                  <AdminSectionCard title="Ritual address">
                    <address className="text-sm not-italic leading-6">
                      {address.map((line) => (
                        <span key={line} className="block">
                          {line}
                        </span>
                      ))}
                    </address>
                  </AdminSectionCard>
                </div>
                {request.packageName || request.devotees?.length || request.gotra ? (
                  <AdminSectionCard title="Sankalp">
                    <div className="divide-y divide-border">
                      {request.packageName ? <DetailRow label="Package" value={request.packageName} /> : null}
                      {request.gotra ? <DetailRow label="Gotra" value={request.gotra} /> : null}
                    </div>
                    {request.devotees?.length ? (
                      <div className="mt-3 border-t border-border pt-3">
                        <p className="mb-2 text-[13px] text-muted-foreground">Names in the sankalp</p>
                        <ol className="flex flex-wrap gap-1.5">
                          {request.devotees.map((name, index) => (
                            <li key={`${index}-${name}`} className="inline-flex h-7 items-center rounded-full border border-border bg-muted px-2.5 text-[13px] font-medium">
                              {name}
                            </li>
                          ))}
                        </ol>
                      </div>
                    ) : null}
                  </AdminSectionCard>
                ) : null}
                <Paragraph title="Intention (sankalp)" text={request.intent} />
                <Paragraph title="Customer notes" text={request.notes} />
                <AdminSectionCard title="Timeline">
                  <div className="divide-y divide-border">
                    <DetailRow label="Requested" value={formatDateTime(request.createdAt)} />
                    <DetailRow label="Accepted" value={formatOptionalDateTime(request.acceptedAt)} />
                    <DetailRow label="Scheduled start" value={formatOptionalDateTime(request.scheduledStartAt)} />
                    <DetailRow label="Completed" value={formatOptionalDateTime(request.completedAt)} />
                    {request.cancelledAt ? <DetailRow label="Cancelled" value={formatDateTime(request.cancelledAt)} /> : null}
                    {request.rejectedAt ? <DetailRow label="Rejected" value={formatDateTime(request.rejectedAt)} /> : null}
                    <DetailRow label="Last updated" value={formatDateTime(request.updatedAt)} />
                  </div>
                </AdminSectionCard>
              </div>
              <AdminDetailStickyRail className="order-first xl:order-none">
                <AdminSectionCard title="Next steps">
                  <RequestActions request={request} />
                </AdminSectionCard>
                <AssignmentCard request={request} />
                <AdminSectionCard title="Summary">
                  <div className="divide-y divide-border">
                    <DetailRow label="Amount" value={<span className="tabular-nums">{request.pricePaise === null ? "On request" : formatINR(request.pricePaise)}</span>} />
                    <DetailRow label="City" value={`${request.city}, ${request.state}`} />
                    <DetailRow label="Preferred date" value={request.requestedDate ? formatDateOnly(request.requestedDate) : "Flexible"} />
                  </div>
                </AdminSectionCard>
              </AdminDetailStickyRail>
            </div>
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
