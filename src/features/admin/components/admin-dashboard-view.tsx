"use client";

import Link from "next/link";
import {
  AlertTriangle,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  CreditCard,
  LifeBuoy,
  MessageSquare,
  Package,
  ShoppingBag,
  Star,
  UsersRound,
  type LucideIcon,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { formatAdminDateTime, formatINR } from "../lib/format";
import { activitySeriesConfig } from "../insights/chart-palette";
import { getContentReadiness } from "../insights/content-selectors";
import {
  getConsultationStatusRows,
  getDashboardMetrics,
  getNeedsAttention,
  getOrderStatusRows,
  getRecentActivity,
  type ActivityKind,
} from "../insights/dashboard-selectors";
import { defaultRangeState, resolveRange } from "../insights/date-range";
import { getActivitySeries } from "../insights/timeseries-selectors";
import { toneClasses, type InsightTone } from "../insights/tones";
import { useInsightsData } from "../insights/use-insights-data";
import { AdminBarChart } from "./shared/admin-bar-chart";
import { AdminDonutChart } from "./shared/admin-donut-chart";
import { AdminInsightCard } from "./shared/admin-insight-card";
import { AdminMetricCard } from "./shared/admin-metric-card";
import { AdminProgressRow } from "./shared/admin-progress-row";
import { AdminSegmentedStatus } from "./shared/admin-segmented-status";
import { AdminTimeSeriesChart } from "./shared/admin-time-series-chart";

const attentionIcons: Record<string, LucideIcon> = {
  "failed-payments": CreditCard,
  "reported-reviews": Star,
  "open-tickets": LifeBuoy,
  "flagged-chats": MessageSquare,
  "pending-reviews": Star,
  "pending-consultations": CalendarDays,
  "pending-orders": ShoppingBag,
  "low-stock": Package,
};

const activityVisuals: Record<ActivityKind, { icon: LucideIcon; tone: InsightTone }> = {
  order: { icon: ShoppingBag, tone: "orange" },
  consultation: { icon: CalendarDays, tone: "violet" },
  payment: { icon: CreditCard, tone: "green" },
  support: { icon: LifeBuoy, tone: "amber" },
  review: { icon: Star, tone: "purple" },
};

function DashboardSkeleton() {
  return (
    <div className="space-y-4" aria-busy="true" aria-label="Loading dashboard">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }, (_, i) => (
          <Skeleton key={i} className="h-[84px] rounded-xl" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-3">
        <Skeleton className="h-[340px] rounded-xl lg:col-span-2" />
        <Skeleton className="h-[340px] rounded-xl" />
      </div>
    </div>
  );
}

export function AdminDashboardView() {
  const { snapshot } = useInsightsData();

  if (!snapshot) {
    return (
      <section className="space-y-4">
        <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <DashboardSkeleton />
      </section>
    );
  }

  const metrics = getDashboardMetrics(snapshot);
  const attention = getNeedsAttention(snapshot);
  const activity = getRecentActivity(snapshot, formatINR);
  const readiness = getContentReadiness(snapshot);
  const activitySeries = getActivitySeries(snapshot, resolveRange(defaultRangeState, snapshot.now));
  const today = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric" }).format(
    snapshot.now,
  );
  const orderRows = getOrderStatusRows(snapshot.orders);

  return (
    <section className="space-y-4">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">Dashboard</h1>
        <p className="text-xs text-muted-foreground">{today}</p>
      </header>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <AdminMetricCard
          label="Customers"
          value={metrics.customers.total}
          secondary={`${metrics.customers.active} active`}
          icon={UsersRound}
          tone="blue"
          href="/admin/customers"
        />
        <AdminMetricCard
          label="Consultations"
          value={metrics.consultations.total}
          secondary={`${metrics.consultations.upcoming} upcoming`}
          icon={CalendarDays}
          tone="violet"
          href="/admin/consultations"
        />
        <AdminMetricCard
          label="Orders"
          value={metrics.orders.total}
          secondary={`${metrics.orders.processing} processing`}
          icon={ShoppingBag}
          tone="orange"
          href="/admin/orders"
        />
        <AdminMetricCard
          label="Successful payments"
          value={formatINR(metrics.payments.successVolumeInPaise)}
          secondary={`${metrics.payments.successCount} transactions${
            metrics.payments.failed ? ` · ${metrics.payments.failed} failed` : ""
          }`}
          icon={CreditCard}
          tone="green"
          href="/admin/payments"
        />
        <AdminMetricCard
          label="Products"
          value={metrics.products.total}
          secondary={`${metrics.products.available} available`}
          icon={Package}
          tone="teal"
          href="/admin/store/products"
        />
        <AdminMetricCard
          label="Active support tickets"
          value={metrics.support.active}
          secondary={`${metrics.support.highPriority} high priority`}
          icon={LifeBuoy}
          tone="amber"
          href="/admin/support"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <AdminInsightCard
          title="Platform activity"
          className="lg:col-span-2"
          action={<span className="text-xs text-muted-foreground">Last 30 days</span>}
        >
          <AdminTimeSeriesChart data={activitySeries} config={activitySeriesConfig} />
        </AdminInsightCard>

        <AdminInsightCard
          title="Needs attention"
          flush
          action={attention.length ? <Badge variant="pending">{attention.length}</Badge> : null}
        >
          {attention.length ? (
            <ul className="divide-y divide-border">
              {attention.map((item) => {
                const Icon = attentionIcons[item.id] ?? AlertTriangle;
                return (
                  <li key={item.id}>
                    <Link
                      href={item.href}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                    >
                      <span className={`grid size-7 shrink-0 place-items-center rounded-md ${toneClasses[item.tone].tile}`}>
                        <Icon className="size-3.5" aria-hidden="true" />
                      </span>
                      <span className="min-w-0 flex-1 truncate text-foreground">
                        <span className="font-semibold tabular-nums">{item.count}</span>{" "}
                        {item.label.replace(/^\d+ /, "")}
                      </span>
                      <span className="flex shrink-0 items-center gap-0.5 text-xs font-medium text-muted-foreground">
                        View <ChevronRight className="size-3.5" aria-hidden="true" />
                      </span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="flex items-center gap-2 px-4 py-6 text-sm text-muted-foreground">
              <CheckCircle2 className="size-4 text-emerald-600" aria-hidden="true" />
              Nothing needs attention right now.
            </p>
          )}
        </AdminInsightCard>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <AdminInsightCard title="Order status">
          <AdminDonutChart rows={orderRows} centerLabel="Orders" emptyLabel="No orders yet" />
        </AdminInsightCard>

        <AdminInsightCard title="Consultation status">
          <AdminBarChart rows={getConsultationStatusRows(snapshot.consultations)} emptyLabel="No consultations yet" />
        </AdminInsightCard>

        <AdminInsightCard title="Catalog and content" className="md:col-span-2 xl:col-span-1">
          <div className="space-y-4">
            <AdminProgressRow
              label="Astrologer profiles complete"
              value={readiness.astrologers.ready}
              total={readiness.astrologers.total}
              tone="blue"
            />
            <AdminProgressRow
              label="Pooja content complete"
              value={readiness.poojas.ready}
              total={readiness.poojas.total}
              tone="orange"
            />
            <AdminProgressRow
              label="Daily horoscope coverage"
              value={readiness.horoscopes.published}
              total={readiness.horoscopes.total}
              detail={readiness.horoscopes.date ? `Latest set: ${readiness.horoscopes.date}` : undefined}
              tone="violet"
            />
            <AdminSegmentedStatus
              label="Calculator implementation"
              segments={[
                { label: "partial", value: readiness.calculators.partial, tone: "teal" },
                { label: "catalog only", value: readiness.calculators.catalogOnly, tone: "neutral" },
              ]}
            />
            <p className="text-xs text-muted-foreground">
              Articles: <span className="font-semibold text-foreground">{readiness.articles.published}</span> published ·{" "}
              {readiness.articles.scheduled} scheduled · {readiness.articles.draft} draft
            </p>
          </div>
        </AdminInsightCard>
      </div>

      <AdminInsightCard title="Recent activity" flush>
        {activity.length ? (
          <ul className="divide-y divide-border">
            {activity.map((event) => {
              const visual = activityVisuals[event.kind];
              const Icon = visual.icon;
              return (
                <li key={event.id}>
                  <Link
                    href={event.href}
                    className="flex items-center gap-3 px-4 py-2.5 outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                  >
                    <span className={`grid size-7 shrink-0 place-items-center rounded-md ${toneClasses[visual.tone].tile}`}>
                      <Icon className="size-3.5" aria-hidden="true" />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm text-foreground">{event.title}</span>
                      <span className="block truncate text-xs text-muted-foreground">
                        {event.detail} · {formatAdminDateTime(event.at)}
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="px-4 py-6 text-sm text-muted-foreground">No recent activity.</p>
        )}
      </AdminInsightCard>
    </section>
  );
}
