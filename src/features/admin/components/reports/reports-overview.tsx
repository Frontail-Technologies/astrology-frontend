"use client";

import { CalendarDays, CreditCard, LifeBuoy, Newspaper, ShoppingBag, UsersRound } from "lucide-react";

import { customerSegmentRows, emptyConsultationFilters, modeRows, orderStatusRows } from "@/features/insights/constants/insights-status";
import {
  useActivitySeries,
  useConsultationReport,
  useContentReport,
  useCustomerReport,
  useFinanceReport,
  useOperationsReport,
  useRevenueSeries,
  useStoreReport,
} from "@/features/insights/hooks/use-insights-admin";
import { distributionRows, paymentSuccessRate } from "@/features/insights/lib/insights-view-models";
import type { InsightsGranularity, RangeQuery } from "@/features/insights/types/insights-admin";
import { formatINR } from "../../lib/format";
import { AdminCountSeriesChart } from "../shared/admin-count-series-chart";
import { AdminDonutChart } from "../shared/admin-donut-chart";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminMetricCard } from "../shared/admin-metric-card";
import { ReportQueryState } from "./report-query-state";

export function ReportsOverview({ range, granularity }: { range: RangeQuery; granularity: InsightsGranularity }) {
  const seriesQuery = { ...range, granularity };
  const consultations = useConsultationReport(range, emptyConsultationFilters);
  const store = useStoreReport(range);
  const finance = useFinanceReport(range);
  const customers = useCustomerReport(range);
  const operations = useOperationsReport(range);
  const content = useContentReport(range);
  const revenue = useRevenueSeries(seriesQuery);
  const activity = useActivitySeries(seriesQuery);

  return (
    <ReportQueryState queries={[consultations, store, finance, customers, operations, content, revenue, activity] as const} label="the overview">
      {([c, st, f, cu, op, co, rev, act]) => {
        const successRate = paymentSuccessRate(f);
        const ticketsRaised = Object.values(op.supportTicketsByStatus).reduce((sum, value) => sum + value, 0);
        return (
          <div className="space-y-5">
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              <AdminMetricCard label="New customers" value={cu.newInRange} secondary={`${cu.total} customers in total`} icon={UsersRound} tone="blue" href="/admin/customers" />
              <AdminMetricCard
                label="Consultations booked"
                value={c.totalConsultations}
                secondary={`${c.byStatus.completed} completed · ${c.byStatus.cancelled} cancelled`}
                icon={CalendarDays}
                tone="violet"
                href="/admin/consultations"
              />
              <AdminMetricCard
                label="Orders placed"
                value={st.ordersCount}
                secondary={`${formatINR(st.finalRevenuePaise)} revenue`}
                icon={ShoppingBag}
                tone="orange"
                href="/admin/orders"
              />
              <AdminMetricCard
                label="Successful payments"
                value={formatINR(f.successfulPayments.amountPaise)}
                secondary={`${f.successfulPayments.count} payments${successRate === null ? "" : ` · ${successRate}% success`}`}
                icon={CreditCard}
                tone="green"
                href="/admin/payments?status=succeeded"
              />
              <AdminMetricCard
                label="Support tickets raised"
                value={ticketsRaised}
                secondary={`${op.workload.openSupportTickets} open now`}
                icon={LifeBuoy}
                tone="amber"
                href="/admin/support"
              />
              <AdminMetricCard
                label="Articles published"
                value={co.publishedInRange}
                secondary={`${co.readiness.articles.published} published overall`}
                icon={Newspaper}
                tone="purple"
                href="/admin/articles"
              />
            </div>

            <div className="grid gap-4 xl:grid-cols-2">
              <AdminInsightCard title="Revenue">
                <AdminCountSeriesChart
                  data={rev}
                  granularity={granularity}
                  series={[
                    { key: "paidChatGrossRevenuePaise", label: "Paid chat", format: "paise", color: "var(--chart-consultations)" },
                    { key: "storeOrderRevenuePaise", label: "Store orders", format: "paise", color: "var(--chart-orders)" },
                    { key: "walletTopupsPaise", label: "Wallet top-ups", format: "paise", color: "var(--chart-payments)" },
                  ]}
                />
              </AdminInsightCard>
              <AdminInsightCard title="Activity">
                <AdminCountSeriesChart
                  data={act}
                  kind="bar"
                  granularity={granularity}
                  series={[
                    { key: "consultationsCreated", label: "Consultations", format: "count", color: "var(--chart-consultations)" },
                    { key: "ordersPlaced", label: "Orders", format: "count", color: "var(--chart-orders)" },
                    { key: "paymentsSucceeded", label: "Payments succeeded", format: "count", color: "var(--chart-success)" },
                  ]}
                />
              </AdminInsightCard>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
              <AdminInsightCard title="Order status">
                <AdminDonutChart rows={distributionRows(orderStatusRows, st.ordersByStatus)} centerLabel="Orders" />
              </AdminInsightCard>
              <AdminInsightCard title="Consultation modes">
                <AdminDonutChart rows={distributionRows(modeRows, c.byMode)} centerLabel="Consultations" />
              </AdminInsightCard>
              <AdminInsightCard title="Customer activity" className="md:col-span-2 xl:col-span-1">
                <AdminDonutChart rows={distributionRows(customerSegmentRows, cu.segments)} centerLabel="Customers" />
              </AdminInsightCard>
            </div>
          </div>
        );
      }}
    </ReportQueryState>
  );
}
