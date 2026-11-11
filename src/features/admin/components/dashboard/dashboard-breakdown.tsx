"use client";

import Link from "next/link";
import type { ReactNode } from "react";
import { ArrowRight } from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import type { AdminError } from "@/features/admin/data/admin-errors";
import { customerSegmentRows, lifecycleRows, modeRows, orderStatusRows } from "@/features/insights/constants/insights-status";
import {
  useConsultationReport,
  useCustomerReport,
  useFinanceReport,
  useInsightsRange,
  useOperationsReport,
  useStoreReport,
} from "@/features/insights/hooks/use-insights-admin";
import { distributionRows, paymentOutcomeRows, rebucketDaily, topAstrologerRows } from "@/features/insights/lib/insights-view-models";
import { emptyConsultationFilters } from "@/features/insights/constants/insights-status";
import { AdminBarChart } from "../shared/admin-bar-chart";
import { AdminCountSeriesChart } from "../shared/admin-count-series-chart";
import { AdminDonutChart } from "../shared/admin-donut-chart";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminErrorState } from "../shared/admin-list-states";

const number = new Intl.NumberFormat("en-IN");

function Body<T>({ query, height = "h-[240px]", children }: { query: { data: T | null; error: AdminError | null; reload: () => void }; height?: string; children: (data: T) => ReactNode }) {
  if (query.error) return <AdminErrorState error={query.error} onRetry={query.reload} title="Could not load this chart" />;
  if (!query.data) return <Skeleton className={`${height} w-full rounded-lg`} />;
  return <>{children(query.data)}</>;
}

function Total({ value }: { value: number | undefined }) {
  return value === undefined ? null : <span className="text-sm font-semibold tabular-nums text-foreground">{number.format(value)}</span>;
}

function ReportLink({ href }: { href: string }) {
  return (
    <Link href={href} className="inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
      Report
      <ArrowRight className="size-3.5" aria-hidden="true" />
    </Link>
  );
}

/**
 * Breakdown charts for the dashboard's selected range (the same `?range=` the Trends card uses): consultations,
 * astrologers, customers, store, poojas and payments. Each card loads independently and links to its full report.
 */
export function DashboardBreakdown() {
  const { resolved } = useInsightsRange();
  const range = { from: resolved.from, to: resolved.to };
  const consultations = useConsultationReport(range, emptyConsultationFilters);
  const customers = useCustomerReport(range);
  const store = useStoreReport(range);
  const operations = useOperationsReport(range);
  const finance = useFinanceReport(range);

  return (
    <section className="space-y-4" aria-label="Breakdown for the selected range">
      <div className="grid gap-4 xl:grid-cols-3">
        <AdminInsightCard title="Consultations over time" description={`Created, completed and cancelled per ${resolved.granularity}`} className="xl:col-span-2" action={<ReportLink href="/admin/reports?tab=consultations" />}>
          <Body query={consultations}>
            {(r) => (
              <AdminCountSeriesChart
                data={rebucketDaily(r.series, resolved.granularity)}
                granularity={resolved.granularity}
                className="h-[240px]"
                emptyLabel="No consultations in this range"
                series={[
                  { key: "created", label: "Created", format: "count", color: "var(--chart-consultations)" },
                  { key: "completed", label: "Completed", format: "count", color: "var(--chart-success)" },
                  { key: "cancelled", label: "Cancelled", format: "count", color: "var(--chart-neutral)" },
                ]}
              />
            )}
          </Body>
        </AdminInsightCard>
        <AdminInsightCard title="Consultation mode" action={<Total value={consultations.data?.totalConsultations} />}>
          <Body query={consultations}>{(r) => <AdminDonutChart rows={distributionRows(modeRows, r.byMode)} centerLabel="Consultations" emptyLabel="No consultations in this range" />}</Body>
        </AdminInsightCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-3">
        <AdminInsightCard title="Busiest astrologers" description="Consultations in this range">
          <Body query={consultations}>{(r) => <AdminBarChart horizontal labelWidth={156} className="h-[240px]" rows={topAstrologerRows(r.astrologerPerformance)} emptyLabel="No consultations in this range" />}</Body>
        </AdminInsightCard>
        <AdminInsightCard title="New customers" action={<Total value={customers.data?.newInRange} />}>
          <Body query={customers}>
            {(r) => (
              <AdminCountSeriesChart
                data={rebucketDaily(r.newSeries, resolved.granularity)}
                kind="bar"
                granularity={resolved.granularity}
                className="h-[240px]"
                emptyLabel="No sign-ups in this range"
                series={[{ key: "newCustomers", label: "New customers", format: "count", color: "var(--chart-customers)" }]}
              />
            )}
          </Body>
        </AdminInsightCard>
        <AdminInsightCard title="Customer mix" description="All customers by what they use" className="lg:col-span-2 xl:col-span-1">
          <Body query={customers}>{(r) => <AdminDonutChart rows={distributionRows(customerSegmentRows, r.segments)} centerLabel="Customers" />}</Body>
        </AdminInsightCard>
      </div>

      <div className="grid gap-4 lg:grid-cols-2 xl:grid-cols-4">
        <AdminInsightCard title="Consultation status" action={<ReportLink href="/admin/reports?tab=consultations" />}>
          <Body query={consultations}>{(r) => <AdminBarChart horizontal labelWidth={88} className="h-[260px]" rows={distributionRows(lifecycleRows, r.byStatus)} emptyLabel="No consultations in this range" />}</Body>
        </AdminInsightCard>
        <AdminInsightCard title="Order status" action={<Total value={store.data?.ordersCount} />}>
          <Body query={store}>{(r) => <AdminDonutChart rows={distributionRows(orderStatusRows, r.ordersByStatus)} centerLabel="Orders" emptyLabel="No orders in this range" />}</Body>
        </AdminInsightCard>
        <AdminInsightCard title="Pooja requests">
          <Body query={operations}>{(r) => <AdminDonutChart rows={distributionRows(lifecycleRows, r.poojaRequestsByStatus)} centerLabel="Requests" emptyLabel="No pooja requests in this range" />}</Body>
        </AdminInsightCard>
        <AdminInsightCard title="Payments" description="Succeeded vs failed">
          <Body query={finance}>{(r) => <AdminDonutChart rows={paymentOutcomeRows(r)} centerLabel="Payments" emptyLabel="No payments in this range" />}</Body>
        </AdminInsightCard>
      </div>
    </section>
  );
}
