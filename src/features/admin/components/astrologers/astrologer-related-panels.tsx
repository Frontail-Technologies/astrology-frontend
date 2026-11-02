"use client";

import { consultationStatusLabels, consultationStatusVariants } from "@/features/consultations/constants/consultation-status";
import { useConsultationsForAstrologer } from "@/features/consultations/hooks/use-consultation-admin";
import { earningStatusLabels, earningStatusVariants } from "@/features/earnings/constants/earning-status";
import { useEarningSummaryForAstrologer, useEarningsForAstrologer } from "@/features/earnings/hooks/use-earning-admin";
import { payoutStatusLabels, payoutStatusVariants } from "@/features/payouts/constants/payout-status";
import { usePayoutsForAstrologer } from "@/features/payouts/hooks/use-payout-admin";
import { formatDateTime, formatINR } from "../../lib/format";
import { AdminRelatedList, AdminRelatedRow } from "../shared/admin-related-list";
import { AdminSectionCard } from "../shared/admin-section-card";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminStatusBadge } from "../shared/admin-status-badge";

/** Lifetime earnings for one astrologer from the server-side summary (not summed in the browser). */
function EarningSummaryCard({ astrologerId }: { astrologerId: string }) {
  const summary = useEarningSummaryForAstrologer(astrologerId);
  return (
    <AdminSectionCard title="Earnings summary" description="Lifetime totals for this astrologer.">
      {!summary.ready ? (
        <p className="text-sm text-muted-foreground" role="status">Loading…</p>
      ) : summary.error ? (
        <p className="text-sm text-destructive">{summary.error.message}</p>
      ) : summary.data ? (
        <div className="divide-y divide-border">
          <DetailRow label="Total billed" value={<span className="tabular-nums">{formatINR(summary.data.grossRevenuePaise)}</span>} />
          <DetailRow label="Platform fee" value={<span className="tabular-nums">{formatINR(summary.data.platformRevenuePaise)}</span>} />
          <DetailRow label="Still to pay out" value={<span className="tabular-nums">{formatINR(summary.data.astrologerPayablePaise)}</span>} />
          <DetailRow label="Paid out" value={<span className="tabular-nums">{formatINR(summary.data.paidPaise)}</span>} />
        </div>
      ) : null}
    </AdminSectionCard>
  );
}

/** Astrologer side panels: recent consultations, earnings and payouts, each filtered on the server. */
export function AstrologerRelatedPanels({ astrologerId }: { astrologerId: string }) {
  const consultations = useConsultationsForAstrologer(astrologerId);
  const earnings = useEarningsForAstrologer(astrologerId);
  const payouts = usePayoutsForAstrologer(astrologerId);
  return (
    <>
      <EarningSummaryCard astrologerId={astrologerId} />
      <AdminRelatedList
        title="Consultations"
        list={consultations}
        viewAllHref={`/admin/consultations?astrologerId=${astrologerId}`}
        emptyLabel="No consultations yet."
        renderItem={(consultation) => (
          <AdminRelatedRow
            href={`/admin/consultations/${consultation.id}`}
            primary={consultation.customer.email ?? consultation.customer.phone ?? "Customer"}
            secondary={`${consultation.consultationMode.name} · ${formatDateTime(consultation.scheduledStartAt ?? consultation.requestedAt)}`}
            trailing={<AdminStatusBadge status={consultation.status} labels={consultationStatusLabels} variants={consultationStatusVariants} />}
          />
        )}
      />
      <AdminRelatedList
        title="Earnings"
        list={earnings}
        viewAllHref={`/admin/earnings?astrologerId=${astrologerId}`}
        emptyLabel="No earnings yet."
        renderItem={(earning) => (
          <AdminRelatedRow
            href={`/admin/earnings/${earning.id}`}
            primary={formatINR(earning.astrologerEarningPaise)}
            secondary={formatDateTime(earning.createdAt)}
            trailing={<AdminStatusBadge status={earning.status} labels={earningStatusLabels} variants={earningStatusVariants} />}
          />
        )}
      />
      <AdminRelatedList
        title="Payouts"
        list={payouts}
        viewAllHref={`/admin/payouts?astrologerId=${astrologerId}`}
        emptyLabel="No payouts yet."
        renderItem={(payout) => (
          <AdminRelatedRow
            href={`/admin/payouts/${payout.id}`}
            primary={formatINR(payout.amountPaise)}
            secondary={formatDateTime(payout.requestedAt)}
            trailing={<AdminStatusBadge status={payout.status} labels={payoutStatusLabels} variants={payoutStatusVariants} />}
          />
        )}
      />
    </>
  );
}
