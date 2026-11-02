"use client";

import Link from "next/link";
import { Archive, CalendarClock, CheckCircle2, Eye, PauseCircle, RotateCcw } from "lucide-react";

import { Button } from "@/components/ui/button";
import { consultationModeLabels, consultationStatusLabels, consultationStatusVariants } from "@/features/consultations/constants/consultation-status";
import { customerStatusLabels, customerStatusVariants } from "@/features/customers/constants/customer-status";
import { useCustomerDetail, useUpdateCustomerStatus } from "@/features/customers/hooks/use-customer-admin";
import { personPrimaryLabel } from "@/features/customers/lib/customer-display";
import type { CustomerAccountStatus } from "@/features/customers/types/customer";
import { formatAdminDate, formatClockTime, formatDateLong, formatINR, formatOptionalDateTime } from "../../lib/format";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminEmptyState } from "../shared/admin-empty-state";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";
import { useConfirmAction } from "../shared/use-confirm-action";
import { CustomerIdentity } from "./customer-mobile-card";
import { CustomerRelatedPanels } from "./customer-related-panels";

const statusCopy: Record<CustomerAccountStatus, { title: string; description: string; confirmLabel: string }> = {
  active: { title: "Reactivate this customer?", description: "They will be able to sign in and book consultations again.", confirmLabel: "Reactivate" },
  suspended: { title: "Suspend this customer?", description: "They will be signed out and blocked from signing in until reactivated.", confirmLabel: "Suspend" },
  archived: { title: "Archive this customer?", description: "The account is hidden from active lists and cannot sign in.", confirmLabel: "Archive" },
};

const modeLabel = (mode: string) => (consultationModeLabels as Record<string, string>)[mode] ?? mode.charAt(0).toUpperCase() + mode.slice(1).replace(/[_-]+/g, " ");

function Verified({ at }: { at: string | null }) {
  return at ? (
    <AdminStatusPill tone="success">Verified</AdminStatusPill>
  ) : (
    <AdminStatusPill tone="neutral" dot={false}>
      Not verified
    </AdminStatusPill>
  );
}

export function AdminCustomerDetailView({ customerId }: { customerId: string }) {
  const { customer, ready, error, reload } = useCustomerDetail(customerId);
  const statusMutation = useUpdateCustomerStatus(customerId);
  const confirm = useConfirmAction<CustomerAccountStatus>(statusMutation);
  const pendingStatus = confirm.target;
  // With no target (dialog closing) the copy falls back to "archive", matching the previous ternaries.
  const copy = statusCopy[pendingStatus ?? "archived"];

  return (
    <AdminDetailFrame ready={ready} error={error} onRetry={reload} noun="customer">
      {() => {
        const c = customer!;
        const title = personPrimaryLabel(c);
        const consultations = c.consultations;
        const canReactivate = c.accountStatus !== "active";
        const canSuspend = c.accountStatus !== "suspended" && c.accountStatus !== "archived";
        const canArchive = c.accountStatus !== "archived";
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={title}
              backHref="/admin/customers"
              backLabel="Customers"
              meta={
                <>
                  {c.accountStatus ? <AdminStatusBadge status={c.accountStatus} labels={customerStatusLabels} variants={customerStatusVariants} /> : null}
                  <span className="tabular-nums">Joined {c.createdAt ? formatDateLong(c.createdAt) : "date unknown"}</span>
                  {c.lastLoginAt ? <span className="tabular-nums">Last sign-in {formatOptionalDateTime(c.lastLoginAt)}</span> : null}
                </>
              }
              actions={
                <>
                  {canReactivate ? (
                    <Button size="sm" variant="outline" className="bg-surface" onClick={() => confirm.open("active")}>
                      <RotateCcw aria-hidden="true" />
                      Reactivate
                    </Button>
                  ) : null}
                  {canSuspend ? (
                    <Button size="sm" variant="outline" className="bg-surface text-destructive hover:text-destructive" onClick={() => confirm.open("suspended")}>
                      <PauseCircle aria-hidden="true" />
                      Suspend
                    </Button>
                  ) : null}
                  {canArchive ? (
                    <AdminRowActions
                      label="More account actions"
                      className="size-9 min-h-9 border border-border bg-surface"
                      actions={[{ label: "Archive customer", icon: Archive, onSelect: () => confirm.open("archived"), destructive: true }]}
                    />
                  ) : null}
                </>
              }
            />

            <AdminConfirmDialog
              {...confirm.dialogProps}
              title={copy.title}
              description={copy.description}
              confirmLabel={copy.confirmLabel}
              destructive={pendingStatus !== "active"}
              onConfirm={() => {
                if (!pendingStatus) return;
                statusMutation.mutate(pendingStatus, { onSuccess: confirm.close });
              }}
            />

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Profile">
                  <CustomerIdentity customer={c} size="lg" />
                  <div className="mt-4 divide-y divide-border border-t border-border">
                    <DetailRow
                      label="Email"
                      value={
                        c.email ? (
                          <span className="flex flex-wrap items-center justify-end gap-2">
                            <span className="break-all">{c.email}</span>
                            <Verified at={c.emailVerifiedAt} />
                          </span>
                        ) : (
                          <span className="font-normal text-muted-foreground">Not added</span>
                        )
                      }
                    />
                    <DetailRow
                      label="Phone"
                      value={
                        c.phone ? (
                          <span className="flex flex-wrap items-center justify-end gap-2">
                            <span className="tabular-nums">{c.phone}</span>
                            <Verified at={c.phoneVerifiedAt} />
                          </span>
                        ) : (
                          <span className="font-normal text-muted-foreground">Not added</span>
                        )
                      }
                    />
                  </div>
                </AdminSectionCard>

                <AdminSectionCard title="Birth details" description="As entered by the customer for their charts.">
                  {c.birthDetails && (c.birthDetails.date || c.birthDetails.time || c.birthDetails.place) ? (
                    <dl className="grid gap-4 sm:grid-cols-3">
                      {[
                        { label: "Date of birth", value: c.birthDetails.date ? formatAdminDate(c.birthDetails.date) : null },
                        { label: "Time of birth", value: c.birthDetails.time ? formatClockTime(c.birthDetails.time) : null },
                        { label: "Place of birth", value: c.birthDetails.place },
                      ].map((item) => (
                        <div key={item.label} className="grid gap-0.5">
                          <dt className="text-[13px] text-muted-foreground">{item.label}</dt>
                          <dd className={item.value ? "text-sm font-medium tabular-nums" : "text-sm text-muted-foreground"}>{item.value ?? "Not added"}</dd>
                        </div>
                      ))}
                    </dl>
                  ) : (
                    <p className="text-sm text-muted-foreground">No birth details added yet.</p>
                  )}
                </AdminSectionCard>

                <AdminSectionCard
                  title="Consultations"
                  description={consultations.length ? `${c.consultationSummary.total} in total, ${c.consultationSummary.completed} completed` : undefined}
                  flush
                  actions={
                    c.consultationSummary.total > consultations.length ? (
                      <Link href={`/admin/consultations?customerUserId=${c.id}`} className="text-xs font-medium text-muted-foreground hover:text-foreground hover:underline">
                        View all {c.consultationSummary.total}
                      </Link>
                    ) : null
                  }
                >
                  {consultations.length === 0 ? (
                    <AdminEmptyState variant="inline" icon={CalendarClock} title="No consultations yet" description="Bookings this customer makes with astrologers appear here." />
                  ) : (
                    <ul className="divide-y divide-border">
                      {consultations.map((con) => (
                        <li key={con.id} className="flex items-center justify-between gap-3 px-5 py-3">
                          <div className="min-w-0">
                            <Link href={`/admin/consultations/${con.id}`} className="block truncate text-sm font-medium hover:underline">
                              {con.astrologerName || "Astrologer"}
                            </Link>
                            <p className="truncate text-xs tabular-nums text-muted-foreground">
                              {modeLabel(con.mode)} · {formatOptionalDateTime(con.scheduledAt ?? con.requestedAt)} · {formatINR(con.pricePaise)}
                            </p>
                          </div>
                          <div className="flex shrink-0 items-center gap-1.5">
                            <AdminStatusBadge status={con.status} labels={consultationStatusLabels} variants={consultationStatusVariants} />
                            <AdminRowActionLink href={`/admin/consultations/${con.id}`} label={`View consultation with ${con.astrologerName || "astrologer"}`} icon={Eye} />
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </AdminSectionCard>
              </div>

              <AdminDetailStickyRail className="space-y-5">
                <AdminSectionCard title="Summary">
                  <div className="divide-y divide-border">
                    <DetailRow label="Consultations" value={<span className="tabular-nums">{c.consultationSummary.total}</span>} />
                    <DetailRow
                      label="Completed"
                      value={
                        <span className="inline-flex items-center gap-1.5 tabular-nums">
                          <CheckCircle2 className="size-3.5 text-success" aria-hidden="true" />
                          {c.consultationSummary.completed}
                        </span>
                      }
                    />
                    <DetailRow label="Last sign-in" value={<span className="tabular-nums">{formatOptionalDateTime(c.lastLoginAt, "Never")}</span>} />
                  </div>
                </AdminSectionCard>
                <CustomerRelatedPanels customerId={customerId} />
              </AdminDetailStickyRail>
            </div>
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
