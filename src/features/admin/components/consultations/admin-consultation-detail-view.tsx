"use client";

import Link from "next/link";
import { useState } from "react";
import { ShieldAlert } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ADMIN_REASON } from "@/features/admin/data/admin-reason";
import { CONSULTATION_OVERRIDE_HINTS, consultationStatusLabels, consultationStatusVariants } from "@/features/consultations/constants/consultation-status";
import { useConsultationDetail, useConsultationOverride } from "@/features/consultations/hooks/use-consultation-admin";
import type { ConsultationStatus } from "@/features/consultations/types/consultation-admin";
import { personPrimaryLabel } from "@/features/customers/lib/customer-display";
import { formatDateTime, formatINR, formatOptionalDateTime } from "../../lib/format";
import { PaymentRefundsForEntity } from "../payments/admin-refunds";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";
import { useConfirmAction } from "../shared/use-confirm-action";
import { ConsultationRelatedPanels } from "./consultation-related-panels";

const isDestructive = (status: ConsultationStatus) => status === "cancelled" || status === "rejected";

export function AdminConsultationDetailView({ consultationId }: { consultationId: string }) {
  const detail = useConsultationDetail(consultationId);
  const override = useConsultationOverride(consultationId);
  const confirm = useConfirmAction<ConsultationStatus>(override);
  const { target } = confirm;
  const [scheduledAt, setScheduledAt] = useState("");

  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="consultation">
      {() => {
        const consultation = detail.data!;
        const next = consultation.allowedTransitions;
        const needsSchedule = target === "scheduled";
        const hint = override.error?.code ? CONSULTATION_OVERRIDE_HINTS[override.error.code] : undefined;
        const customerLabel = personPrimaryLabel(consultation.customer);
        const timeline = [
          { label: "Requested", value: consultation.requestedAt },
          { label: "Preferred start", value: consultation.requestedStartAt },
          { label: "Scheduled start", value: consultation.scheduledStartAt },
          { label: "Started", value: consultation.startedAt },
          { label: "Completed", value: consultation.completedAt },
          { label: "Cancelled", value: consultation.cancelledAt },
        ];
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={`${consultation.consultationMode.name} consultation`}
              backHref="/admin/consultations"
              backLabel="Consultations"
              meta={
                <>
                  <AdminStatusBadge status={consultation.status} labels={consultationStatusLabels} variants={consultationStatusVariants} />
                  {consultation.requestKind === "instant" ? (
                    <AdminStatusPill tone="neutral" dot={false}>
                      Instant
                    </AdminStatusPill>
                  ) : null}
                  <span>
                    {customerLabel} with {consultation.astrologer.displayName}
                  </span>
                  <span className="tabular-nums">Requested {formatDateTime(consultation.requestedAt)}</span>
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Booking">
                  <div className="divide-y divide-border">
                    <DetailRow
                      label="Customer"
                      value={
                        <Link className="break-all hover:underline" href={`/admin/customers/${consultation.customer.id}`}>
                          {customerLabel}
                        </Link>
                      }
                    />
                    <DetailRow
                      label="Astrologer"
                      value={
                        <Link className="hover:underline" href={`/admin/astrologers/${consultation.astrologer.id}`}>
                          {consultation.astrologer.displayName}
                        </Link>
                      }
                    />
                    <DetailRow label="Mode" value={consultation.consultationMode.name} />
                    <DetailRow label="Requested as" value={consultation.requestKind === "instant" ? "Instant (Chat now / Call now)" : "Scheduled booking"} />
                    <DetailRow label="Price" value={<span className="tabular-nums">{formatINR(consultation.pricePaise)}</span>} />
                    <DetailRow label="Session length" value={consultation.durationMinutes ? `${consultation.durationMinutes} min` : "Not set"} />
                  </div>
                  {consultation.concern ? (
                    <div className="mt-4">
                      <p className="mb-1.5 text-[13px] text-muted-foreground">What the customer wants to discuss</p>
                      <p className="whitespace-pre-line rounded-[calc(var(--radius)-2px)] bg-muted p-3 text-sm leading-relaxed">{consultation.concern}</p>
                    </div>
                  ) : null}
                </AdminSectionCard>
                <AdminSectionCard title="Timeline">
                  <ol className="divide-y divide-border">
                    {timeline.map((step) => (
                      <li key={step.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                        <span className={step.value ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
                        <span className={step.value ? "text-right font-medium tabular-nums" : "text-right text-muted-foreground"}>{formatOptionalDateTime(step.value, "Not yet")}</span>
                      </li>
                    ))}
                  </ol>
                </AdminSectionCard>
                <PaymentRefundsForEntity filter={{ consultationId: consultation.id }} />
              </div>
              <AdminDetailStickyRail className="space-y-5">
                <AdminSectionCard title="Change status" description={next.length ? "Overrides need a reason and are recorded in the audit log." : undefined}>
                  {next.length === 0 ? (
                    <p className="text-sm text-muted-foreground">This consultation is finished. No further status changes are possible.</p>
                  ) : (
                    <div className="grid gap-2">
                      {next.map((status) => (
                        <Button
                          key={status}
                          size="sm"
                          variant="outline"
                          className={isDestructive(status) ? "bg-surface text-destructive hover:text-destructive" : "bg-surface"}
                          onClick={() => {
                            setScheduledAt("");
                            confirm.open(status);
                          }}
                        >
                          <ShieldAlert aria-hidden="true" />
                          Move to {consultationStatusLabels[status].toLowerCase()}
                        </Button>
                      ))}
                    </div>
                  )}
                </AdminSectionCard>
                <ConsultationRelatedPanels consultationId={consultationId} />
              </AdminDetailStickyRail>
            </div>

            <AdminConfirmDialog
              {...confirm.dialogProps}
              title={target ? `Move to ${consultationStatusLabels[target].toLowerCase()}?` : ""}
              description="This changes the consultation for both the customer and the astrologer. Payments and earnings are not changed by an override."
              confirmLabel="Change status"
              destructive={target ? isDestructive(target) : false}
              reason={ADMIN_REASON}
              confirmDisabled={needsSchedule && !scheduledAt}
              onConfirm={(reason) => {
                if (!target || !reason) return;
                override.mutate(
                  { status: target, reason, ...(needsSchedule ? { scheduledStartAt: new Date(scheduledAt).toISOString() } : {}) },
                  { onSuccess: confirm.close },
                );
              }}
            >
              {needsSchedule ? (
                <div className="grid gap-1.5">
                  <Label htmlFor="scheduledStartAt">Scheduled start</Label>
                  <Input id="scheduledStartAt" type="datetime-local" value={scheduledAt} onChange={(event) => setScheduledAt(event.target.value)} disabled={override.isPending} />
                  <p className="text-xs text-muted-foreground">In your local time.</p>
                </div>
              ) : null}
              {hint ? <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">{hint}</p> : null}
            </AdminConfirmDialog>
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
