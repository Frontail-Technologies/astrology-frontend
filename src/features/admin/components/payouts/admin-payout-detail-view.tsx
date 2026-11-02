"use client";

import Link from "next/link";
import { useState } from "react";
import { Eye } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  payoutActionCopy,
  payoutFailureReasonLabel,
  payoutFailureReasonLabels,
  payoutProviderLabel,
  payoutProviderLabels,
  payoutStatusLabels,
  payoutStatusVariants,
} from "@/features/payouts/constants/payout-status";
import { usePayoutDetail, useUpdatePayoutStatus } from "@/features/payouts/hooks/use-payout-admin";
import type { PayoutTargetStatus } from "@/features/payouts/types/payout-admin";
import { formatDateTime, formatINR, formatOptionalDateTime } from "../../lib/format";
import { AdminCombobox } from "../shared/admin-combobox";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminFormField } from "../shared/admin-form-section";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminSelectField } from "../shared/admin-select-field";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { useConfirmAction } from "../shared/use-confirm-action";

export function AdminPayoutDetailView({ payoutId }: { payoutId: string }) {
  const detail = usePayoutDetail(payoutId);
  const mutation = useUpdatePayoutStatus(payoutId);
  const confirm = useConfirmAction<PayoutTargetStatus>(mutation);
  const { target } = confirm;
  const [provider, setProvider] = useState<string | null>(null);
  const [providerPayoutId, setProviderPayoutId] = useState("");
  const [failureCode, setFailureCode] = useState<string | null>(null);
  const [failureMessage, setFailureMessage] = useState("");

  const open = (next: PayoutTargetStatus) => {
    setProvider(null);
    setProviderPayoutId("");
    setFailureCode(null);
    setFailureMessage("");
    confirm.open(next);
  };

  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="payout">
      {() => {
        const payout = detail.data!;
        const next = payout.allowedTransitions;
        const copy = target ? payoutActionCopy[target] : null;
        const forward = next.filter((status) => !payoutActionCopy[status].destructive);
        const [primary, ...secondary] = forward;
        const destructive = next.filter((status) => payoutActionCopy[status].destructive);
        const astrologerName = payout.astrologer?.displayName ?? "Astrologer";
        const itemCount = payout.items?.length ?? payout.itemCount;
        const timeline = [
          { label: "Requested", value: payout.requestedAt },
          { label: "Processing since", value: payout.processedAt },
          { label: "Paid", value: payout.paidAt },
          { label: "Failed", value: payout.failedAt },
        ].filter((step) => step.label !== "Failed" || step.value);
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={`${formatINR(payout.amountPaise)} payout`}
              backHref="/admin/payouts"
              backLabel="Payouts"
              meta={
                <>
                  <AdminStatusBadge status={payout.status} labels={payoutStatusLabels} variants={payoutStatusVariants} />
                  <span>{astrologerName}</span>
                  <span className="tabular-nums">Requested {formatDateTime(payout.requestedAt)}</span>
                </>
              }
              actions={
                <>
                  {secondary.map((status) => (
                    <Button key={status} size="sm" variant="outline" className="bg-surface" onClick={() => open(status)}>
                      {payoutActionCopy[status].label}
                    </Button>
                  ))}
                  {destructive.length ? (
                    <AdminRowActions
                      label="More payout actions"
                      className="size-9 min-h-9 border border-border bg-surface"
                      actions={destructive.map((status) => ({ label: payoutActionCopy[status].label, destructive: true, onSelect: () => open(status) }))}
                    />
                  ) : null}
                </>
              }
              primaryAction={
                primary ? (
                  <Button size="sm" variant="conversion" onClick={() => open(primary)}>
                    {payoutActionCopy[primary].label}
                  </Button>
                ) : null
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Transfer">
                  <div className="divide-y divide-border">
                    <DetailRow label="Astrologer" value={<Link className="hover:underline" href={`/admin/astrologers/${payout.astrologerId}`}>{astrologerName}</Link>} />
                    <DetailRow label="Amount" value={<span className="tabular-nums">{formatINR(payout.amountPaise)}</span>} />
                    <DetailRow label="Sent by" value={payout.provider ? payoutProviderLabel(payout.provider) : <span className="font-normal text-muted-foreground">Not recorded</span>} />
                    <DetailRow
                      label="Transfer reference"
                      value={payout.providerPayoutId ? <span className="break-all font-mono text-xs">{payout.providerPayoutId}</span> : <span className="font-normal text-muted-foreground">Not recorded</span>}
                    />
                  </div>
                  {payout.failureMessage || payout.failureCode ? (
                    <div className="mt-4 rounded-md border border-destructive/25 bg-destructive/5 p-3 text-sm">
                      <p className="mb-0.5 text-[13px] font-medium text-destructive">{payout.failureCode ? payoutFailureReasonLabel(payout.failureCode) : "Why it failed"}</p>
                      {payout.failureMessage ? <p>{payout.failureMessage}</p> : null}
                    </div>
                  ) : null}
                </AdminSectionCard>
                <AdminSectionCard title="Earnings in this payout" description={`${itemCount} ${itemCount === 1 ? "earning" : "earnings"}`} flush>
                  {payout.items?.length ? (
                    <ul className="divide-y divide-border">
                      {payout.items.map((item, index) => (
                        <li key={item.id} className="flex items-center justify-between gap-3 px-5 py-2.5 text-sm">
                          <Link className="hover:underline" href={`/admin/earnings/${item.earningId}`}>
                            Earning {index + 1}
                          </Link>
                          <span className="flex items-center gap-1">
                            <span className="font-medium tabular-nums">{formatINR(item.amountPaise)}</span>
                            <AdminRowActionLink href={`/admin/earnings/${item.earningId}`} label={`View earning ${index + 1}`} icon={Eye} />
                          </span>
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="px-5 py-4 text-sm text-muted-foreground">{payout.status === "cancelled" ? "The earnings were released when this payout was cancelled." : "No earnings attached."}</p>
                  )}
                </AdminSectionCard>
              </div>
              <AdminDetailStickyRail className="space-y-5">
                <AdminSectionCard title="Progress">
                  <ol className="divide-y divide-border">
                    {timeline.map((step) => (
                      <li key={step.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                        <span className={step.value ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
                        <span className={step.value ? "font-medium tabular-nums" : "text-muted-foreground"}>{formatOptionalDateTime(step.value, "Not yet")}</span>
                      </li>
                    ))}
                  </ol>
                  {payout.status === "failed" ? (
                    <p className="mt-3 text-[13px] text-muted-foreground">The earnings stay reserved. Retry the transfer and mark it paid, or cancel the payout to release them.</p>
                  ) : next.length === 0 ? (
                    <p className="mt-3 text-[13px] text-muted-foreground">
                      {payout.status === "cancelled" ? "This payout is final. Its earnings were released for a new payout." : "This payout is final."}
                    </p>
                  ) : null}
                </AdminSectionCard>
              </AdminDetailStickyRail>
            </div>

            <AdminConfirmDialog
              {...confirm.dialogProps}
              title={copy?.title ?? ""}
              description={copy?.description ?? ""}
              confirmLabel={copy?.label ?? "Confirm"}
              destructive={copy?.destructive}
              onConfirm={() => {
                if (!target) return;
                const optionalText = (value: string | null) => value?.trim() || undefined;
                const providerValue = optionalText(provider);
                const referenceValue = optionalText(providerPayoutId);
                const codeValue = optionalText(failureCode);
                const messageValue = optionalText(failureMessage);
                mutation.mutate(
                  {
                    status: target,
                    ...(target === "processing" || target === "paid"
                      ? { ...(providerValue ? { provider: providerValue } : {}), ...(referenceValue ? { providerPayoutId: referenceValue } : {}) }
                      : {}),
                    ...(target === "failed" ? { ...(codeValue ? { failureCode: codeValue } : {}), ...(messageValue ? { failureMessage: messageValue } : {}) } : {}),
                  },
                  { onSuccess: confirm.close },
                );
              }}
            >
              {target === "processing" || target === "paid" ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  <AdminFormField label="Sent by" description="Optional.">
                    {(control) => (
                      <AdminSelectField
                        control={control}
                        value={provider}
                        onValueChange={setProvider}
                        options={payoutProviderLabels}
                        placeholder="Choose a method"
                        clearable={{ label: "Not recorded" }}
                        other={{ placeholder: "Transfer method", maxLength: 40, inputLabel: "Other transfer method" }}
                        disabled={mutation.isPending}
                      />
                    )}
                  </AdminFormField>
                  <AdminFormField label="Transfer reference" description="Optional. For example the UTR number.">
                    {(control) => <Input {...control} value={providerPayoutId} maxLength={160} onChange={(event) => setProviderPayoutId(event.target.value)} disabled={mutation.isPending} />}
                  </AdminFormField>
                </div>
              ) : null}
              {target === "failed" ? (
                <div className="grid gap-3">
                  <AdminFormField label="Reason" description="Optional. Pick a common reason or type your own.">
                    {(control) => (
                      <AdminCombobox
                        control={control}
                        value={failureCode}
                        onValueChange={setFailureCode}
                        options={payoutFailureReasonLabels}
                        selectedLabel={failureCode ? payoutFailureReasonLabel(failureCode) : undefined}
                        placeholder="Choose a reason"
                        searchPlaceholder="Search or type a reason…"
                        allowCustom={{ label: (query) => `Use “${query.trim()}”`, maxLength: 160 }}
                        clearable
                        disabled={mutation.isPending}
                      />
                    )}
                  </AdminFormField>
                  <AdminFormField label="Details" description="Optional. What the bank or provider said.">
                    {(control) => <Textarea {...control} rows={3} value={failureMessage} maxLength={2000} onChange={(event) => setFailureMessage(event.target.value)} disabled={mutation.isPending} />}
                  </AdminFormField>
                </div>
              ) : null}
            </AdminConfirmDialog>
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
