"use client";

import type { ReactNode } from "react";

import { Skeleton } from "@/components/ui/skeleton";
import type { AdminError } from "@/features/admin/data/admin-errors";
import { orderStatusRows } from "@/features/insights/constants/insights-status";
import { useActivitySeries, useInsightsRange, useRevenueSeries, useStoreReport } from "@/features/insights/hooks/use-insights-admin";
import { distributionRows } from "@/features/insights/lib/insights-view-models";
import { formatINR } from "../../lib/format";
import { ReportRangeControl } from "../reports/report-controls";
import { AdminBarChart } from "../shared/admin-bar-chart";
import { AdminCountSeriesChart } from "../shared/admin-count-series-chart";
import { AdminDonutChart } from "../shared/admin-donut-chart";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminErrorState } from "../shared/admin-list-states";
import { AdminSectionHeading } from "../shared/admin-section-heading";

function ChartBody<T>({ query, height = "h-[240px]", children }: { query: { data: T | null; error: AdminError | null; reload: () => void }; height?: string; children: (data: T) => ReactNode }) {
  if (query.error) return <AdminErrorState error={query.error} onRetry={query.reload} title="Could not load this chart" />;
  if (!query.data) return <Skeleton className={`${height} w-full rounded-lg`} />;
  return <>{children(query.data)}</>;
}

/** Store sales over the chosen range (same `?range=` URL state as the dashboard): revenue, orders, status mix, best sellers. */
export function StoreSalesCharts() {
  const { range, resolved, setRange } = useInsightsRange();
  const rangeQuery = { from: resolved.from, to: resolved.to };
  const seriesQuery = { ...rangeQuery, granularity: resolved.granularity };
  const revenue = useRevenueSeries(seriesQuery);
  const activity = useActivitySeries(seriesQuery);
  const report = useStoreReport(rangeQuery);
  const totalRevenue = revenue.data?.reduce((sum, bucket) => sum + bucket.storeOrderRevenuePaise, 0);
  const totalOrders = activity.data?.reduce((sum, bucket) => sum + bucket.ordersPlaced, 0);

  return (
    <section className="space-y-4" aria-label="Sales">
      <AdminSectionHeading title="Sales" description="Paid store orders in the selected period." action={<ReportRangeControl value={range} onChange={setRange} />} />
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminInsightCard title="Store revenue" action={totalRevenue !== undefined ? <span className="text-sm font-semibold tabular-nums">{formatINR(totalRevenue)}</span> : null}>
          <ChartBody query={revenue}>
            {(data) => (
              <AdminCountSeriesChart
                data={data}
                granularity={resolved.granularity}
                className="h-[240px]"
                emptyLabel="No store revenue in this period"
                series={[{ key: "storeOrderRevenuePaise", label: "Store orders", format: "paise", color: "var(--chart-orders)" }]}
              />
            )}
          </ChartBody>
        </AdminInsightCard>
        <AdminInsightCard title="Orders placed" action={totalOrders !== undefined ? <span className="text-sm font-semibold tabular-nums">{totalOrders.toLocaleString("en-IN")}</span> : null}>
          <ChartBody query={activity}>
            {(data) => (
              <AdminCountSeriesChart
                data={data}
                kind="bar"
                granularity={resolved.granularity}
                className="h-[240px]"
                emptyLabel="No orders in this period"
                series={[{ key: "ordersPlaced", label: "Orders", format: "count", color: "var(--chart-orders)" }]}
              />
            )}
          </ChartBody>
        </AdminInsightCard>
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <AdminInsightCard title="Order status">
          <ChartBody query={report} height="h-[260px]">
            {(data) => <AdminDonutChart rows={distributionRows(orderStatusRows, data.ordersByStatus)} centerLabel="Orders" />}
          </ChartBody>
        </AdminInsightCard>
        <AdminInsightCard title="Best sellers" description="Units sold in this period.">
          <ChartBody query={report} height="h-[260px]">
            {(data) => (
              <AdminBarChart
                horizontal
                className="h-[260px]"
                emptyLabel="No products sold in this period"
                rows={data.topProducts.slice(0, 6).map((product, index) => ({
                  key: product.productId ?? `${product.productSlug}-${index}`,
                  label: product.productName,
                  value: product.quantity,
                  tone: "orange" as const,
                }))}
              />
            )}
          </ChartBody>
        </AdminInsightCard>
      </div>
    </section>
  );
}
