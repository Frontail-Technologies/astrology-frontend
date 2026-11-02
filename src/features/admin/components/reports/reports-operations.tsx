"use client";

import { LifeBuoy, MessageSquareQuote, Sparkles } from "lucide-react";

import { lifecycleRows, reviewStatusRows, ticketPriorityRows, ticketStatusRows } from "@/features/insights/constants/insights-status";
import { useOperationsReport } from "@/features/insights/hooks/use-insights-admin";
import { distributionRows } from "@/features/insights/lib/insights-view-models";
import type { RangeQuery } from "@/features/insights/types/insights-admin";
import { AdminBarChart } from "../shared/admin-bar-chart";
import { AdminDonutChart } from "../shared/admin-donut-chart";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminSectionHeading } from "../shared/admin-section-heading";
import { AdminMetricCard } from "../shared/admin-metric-card";
import { ReportQueryState } from "./report-query-state";

export function ReportsOperations({ range }: { range: RangeQuery }) {
  const report = useOperationsReport(range);

  return (
    <ReportQueryState queries={[report] as const} label="the operations report">
      {([r]) => (
        <div className="space-y-5">
          <section className="space-y-3" aria-label="Current workload">
            <AdminSectionHeading title="Current workload" description="Live counts, not limited to the selected range" />
            <div className="grid gap-3 sm:grid-cols-3">
              <AdminMetricCard label="Open pooja requests" value={r.workload.openPoojaRequests} secondary="Requested to in progress" icon={Sparkles} tone="violet" href="/admin/pooja-requests" />
              <AdminMetricCard label="Open support tickets" value={r.workload.openSupportTickets} secondary="Open or in progress" icon={LifeBuoy} tone="amber" href="/admin/support?status=open" />
              <AdminMetricCard
                label="Reviews awaiting moderation"
                value={r.workload.reviewsAwaitingModeration}
                secondary="Pending or reported"
                icon={MessageSquareQuote}
                tone="red"
                href="/admin/reviews?status=pending"
              />
            </div>
          </section>

          <AdminSectionHeading title="Created in this range" />
          <div className="grid gap-4 lg:grid-cols-2">
            <AdminInsightCard title="Pooja requests by status">
              <AdminBarChart rows={distributionRows(lifecycleRows, r.poojaRequestsByStatus)} emptyLabel="No pooja requests in this period" />
            </AdminInsightCard>
            <AdminInsightCard title="Reviews by moderation status">
              <AdminBarChart rows={distributionRows(reviewStatusRows, r.reviewsByModerationStatus)} emptyLabel="No reviews in this period" />
            </AdminInsightCard>
            <AdminInsightCard title="Support tickets by status">
              <AdminDonutChart rows={distributionRows(ticketStatusRows, r.supportTicketsByStatus)} centerLabel="Tickets" emptyLabel="No tickets in this period" />
            </AdminInsightCard>
            <AdminInsightCard title="Support tickets by priority">
              <AdminBarChart rows={distributionRows(ticketPriorityRows, r.supportTicketsByPriority)} emptyLabel="No tickets in this period" />
            </AdminInsightCard>
          </div>
        </div>
      )}
    </ReportQueryState>
  );
}
