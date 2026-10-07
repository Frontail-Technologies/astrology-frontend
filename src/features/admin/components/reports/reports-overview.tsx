"use client";

import { CalendarDays, CreditCard, LifeBuoy, Newspaper, ShoppingBag, UsersRound } from "lucide-react";

import { formatINR } from "../../lib/format";
import { activitySeriesConfig } from "../../insights/chart-palette";
import type { DateRange } from "../../insights/date-range";
import { getOverviewReport } from "../../insights/report-selectors";
import type { InsightsSnapshot } from "../../insights/use-insights-data";
import { AdminDonutChart } from "../shared/admin-donut-chart";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminMetricCard } from "../shared/admin-metric-card";
import { AdminTimeSeriesChart } from "../shared/admin-time-series-chart";

export function ReportsOverview({ snapshot, range }: { snapshot: InsightsSnapshot; range: DateRange }) {
  const r = getOverviewReport(snapshot, range);

  return (
    <div className="space-y-4">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard
          label="New customers"
          value={r.customers.newInRange}
          secondary={`${r.customers.total} customers in total`}
          icon={UsersRound}
          tone="blue"
          href="/admin/customers"
        />
        <AdminMetricCard
          label="Consultations booked"
          value={r.consultations.total}
          secondary={`${r.consultations.completed} completed · ${r.consultations.cancelled} cancelled`}
          icon={CalendarDays}
          tone="violet"
          href="/admin/consultations"
        />
        <AdminMetricCard
          label="Orders placed"
          value={r.commerce.orderCount}
          secondary={`${formatINR(r.commerce.grossInPaise)} order value`}
          icon={ShoppingBag}
          tone="orange"
          href="/admin/orders"
        />
        <AdminMetricCard
          label="Successful payments"
          value={formatINR(r.commerce.successVolumeInPaise)}
          secondary={`${r.commerce.successCount} transactions`}
          icon={CreditCard}
          tone="green"
          href="/admin/payments"
        />
        <AdminMetricCard
          label="Support tickets raised"
          value={r.tickets.total}
          secondary={`${r.tickets.open} still open`}
          icon={LifeBuoy}
          tone="amber"
          href="/admin/support"
        />
        <AdminMetricCard
          label="Articles published"
          value={r.content.publishedInRange}
          secondary={`${r.content.readiness.articles.published} published overall`}
          icon={Newspaper}
          tone="purple"
          href="/admin/articles"
        />
      </div>

      <AdminInsightCard title="Activity over time">
        <AdminTimeSeriesChart data={r.activitySeries} config={activitySeriesConfig} className="h-[280px]" />
      </AdminInsightCard>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminInsightCard title="Order status">
          <AdminDonutChart rows={r.commerce.orderRows} centerLabel="Orders" />
        </AdminInsightCard>
        <AdminInsightCard title="Consultation modes">
          <AdminDonutChart rows={r.consultations.modeRows} centerLabel="Consultations" />
        </AdminInsightCard>
        <AdminInsightCard title="Customer activity" className="md:col-span-2 xl:col-span-1">
          <AdminDonutChart rows={r.customers.segmentRows} centerLabel="Customers" />
        </AdminInsightCard>
      </div>
    </div>
  );
}
