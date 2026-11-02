"use client";

import Link from "next/link";
import { useState, type ReactNode } from "react";
import {
  AlertCircle,
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  ChevronRight,
  History,
  IndianRupee,
  Info,
  ShoppingBag,
} from "lucide-react";

import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import type { AdminError } from "@/features/admin/data/admin-errors";
import type { AdminGranularity } from "@/features/admin/data/admin-range";
import { RECENT_AUDIT_LIMIT } from "@/features/insights/constants/insights-status";
import {
  useActivitySeries,
  useDashboardSummary,
  useInsightsRange,
  useRecentAuditLogs,
  useRevenueSeries,
} from "@/features/insights/hooks/use-insights-admin";
import { buildNeedsAttention, toRecentActivity, type AttentionItem } from "@/features/insights/lib/insights-view-models";
import type { ActivityBucket, DashboardSummary, RevenueBucket } from "@/features/insights/types/insights-admin";
import { cn } from "@/lib/utils";
import { formatAdminDateTime, formatINR } from "../../lib/format";
import { ReportRangeControl } from "../reports/report-controls";
import { AdminCountSeriesChart } from "../shared/admin-count-series-chart";
import { AdminEmptyState } from "../shared/admin-empty-state";
import { AdminInsightCard } from "../shared/admin-insight-card";
import { AdminKpiCard } from "../shared/admin-kpi-card";
import { AdminErrorState } from "../shared/admin-list-states";
import { AdminStatusPill } from "../shared/admin-status-badge";
import type { AdminTone } from "../shared/admin-tone";

/** Shown on hover/focus only: the API counts "today" and "this month" in UTC. */
const WINDOW_NOTE = "Today and this month are counted in UTC (IST − 5:30).";
const number = new Intl.NumberFormat("en-IN");

const attentionTone: Record<AttentionItem["tone"], AdminTone> = {
  red: "danger",
  amber: "warning",
  orange: "warning",
  violet: "info",
  blue: "info",
  green: "success",
  teal: "info",
  purple: "info",
  neutral: "neutral",
};

function WindowNote() {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          className="grid size-6 place-items-center rounded-full text-muted-foreground outline-none hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="How today and this month are counted"
        >
          <Info className="size-3.5" aria-hidden="true" />
        </button>
      </TooltipTrigger>
      <TooltipContent side="bottom">{WINDOW_NOTE}</TooltipContent>
    </Tooltip>
  );
}

// ── Headline KPIs ───────────────────────────────────────────────────────────

function KpiRow({ s }: { s: DashboardSummary }) {
  const monthRevenue = s.paidChatRevenueThisMonthPaise + s.orderRevenueThisMonthPaise;
  const openIssues = s.openSupportTickets + s.flaggedChats + s.reportedReviews;
  const issueParts = [
    `${s.openSupportTickets} ${s.openSupportTickets === 1 ? "ticket" : "tickets"}`,
    `${s.flaggedChats} flagged ${s.flaggedChats === 1 ? "chat" : "chats"}`,
    `${s.reportedReviews} reported ${s.reportedReviews === 1 ? "review" : "reviews"}`,
  ];
  return (
    <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4">
      <AdminKpiCard
        label="Revenue this month"
        value={formatINR(monthRevenue)}
        icon={IndianRupee}
        comparison={s.paidChatRevenueTodayPaise > 0 ? `${formatINR(s.paidChatRevenueTodayPaise)} today` : undefined}
        secondary={`Chat ${formatINR(s.paidChatRevenueThisMonthPaise)} · Store ${formatINR(s.orderRevenueThisMonthPaise)}`}
        href="/admin/reports"
        hint={`Paid chat plus store orders. Wallet top-ups are listed separately so money is not counted twice. ${WINDOW_NOTE}`}
      />
      <AdminKpiCard
        label="Consultations today"
        value={number.format(s.consultationsToday)}
        icon={CalendarDays}
        secondary={`${s.upcomingConsultations} upcoming · ${s.pendingConsultations} awaiting response`}
        href="/admin/consultations"
        hint={WINDOW_NOTE}
      />
      <AdminKpiCard
        label="Orders today"
        value={number.format(s.ordersToday)}
        icon={ShoppingBag}
        secondary={`${s.pendingOrders} pending · ${s.processingOrders} processing`}
        href="/admin/orders"
        hint={WINDOW_NOTE}
      />
      <AdminKpiCard
        label="Open issues"
        value={number.format(openIssues)}
        icon={AlertCircle}
        comparison={s.highPriorityOpenTickets > 0 ? `${s.highPriorityOpenTickets} high priority` : undefined}
        trend={s.highPriorityOpenTickets > 0 ? "down" : undefined}
        secondary={issueParts.join(" · ")}
        href="/admin/support?status=open"
        hint="Open support tickets, flagged chats and reported reviews."
      />
    </div>
  );
}

// ── Trend chart ─────────────────────────────────────────────────────────────

type TrendView = "revenue" | "activity";

function sum<T>(rows: readonly T[], pick: (row: T) => number) {
  return rows.reduce((total, row) => total + (Number(pick(row)) || 0), 0);
}

function ChartBody<T>({ query, children }: { query: { data: T | null; error: AdminError | null; reload: () => void }; children: (data: T) => ReactNode }) {
  if (query.error) return <AdminErrorState error={query.error} onRetry={query.reload} title="Could not load this chart" />;
  if (!query.data) return <Skeleton className="h-[280px] w-full rounded-lg" />;
  return <>{children(query.data)}</>;
}

function TrendToggle({ value, onChange }: { value: TrendView; onChange: (value: TrendView) => void }) {
  const options: { value: TrendView; label: string }[] = [
    { value: "revenue", label: "Revenue" },
    { value: "activity", label: "Activity" },
  ];
  return (
    <div role="radiogroup" aria-label="Chart" className="inline-flex h-9 items-center rounded-lg bg-muted p-1">
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          role="radio"
          aria-checked={value === option.value}
          onClick={() => onChange(option.value)}
          className={cn(
            "h-7 rounded-md px-3 text-[13px] font-medium outline-none transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            value === option.value ? "bg-surface text-foreground shadow-xs" : "text-muted-foreground hover:text-foreground",
          )}
        >
          {option.label}
        </button>
      ))}
    </div>
  );
}

function TrendHeadline({ label, value }: { label: string; value: string }) {
  return (
    <div className="mb-4">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <p className="mt-0.5 text-2xl font-semibold tracking-tight tabular-nums text-foreground">{value}</p>
    </div>
  );
}

function RevenueTrend({ data, granularity }: { data: readonly RevenueBucket[]; granularity: AdminGranularity }) {
  const total = sum(data, (row) => row.paidChatGrossRevenuePaise + row.storeOrderRevenuePaise);
  return (
    <>
      <TrendHeadline label="Chat and store revenue in this range" value={formatINR(total)} />
      <AdminCountSeriesChart
        data={data}
        granularity={granularity}
        className="h-[260px]"
        emptyLabel="No revenue in this range yet"
        series={[
          { key: "paidChatGrossRevenuePaise", label: "Paid chat", format: "paise", color: "var(--chart-consultations)" },
          { key: "storeOrderRevenuePaise", label: "Store orders", format: "paise", color: "var(--chart-orders)" },
          { key: "walletTopupsPaise", label: "Wallet top-ups", format: "paise", color: "var(--chart-neutral)" },
        ]}
      />
    </>
  );
}

function ActivityTrend({ data, granularity }: { data: readonly ActivityBucket[]; granularity: AdminGranularity }) {
  const consultations = sum(data, (row) => row.consultationsCreated);
  const orders = sum(data, (row) => row.ordersPlaced);
  return (
    <>
      <TrendHeadline label="Consultations and orders in this range" value={`${number.format(consultations)} · ${number.format(orders)}`} />
      <AdminCountSeriesChart
        data={data}
        kind="bar"
        granularity={granularity}
        className="h-[260px]"
        emptyLabel="No activity in this range yet"
        series={[
          { key: "consultationsCreated", label: "Consultations", format: "count", color: "var(--chart-consultations)" },
          { key: "ordersPlaced", label: "Orders", format: "count", color: "var(--chart-orders)" },
          { key: "paymentsSucceeded", label: "Payments succeeded", format: "count", color: "var(--chart-success)" },
          { key: "paymentsFailed", label: "Payments failed", format: "count", color: "var(--chart-failed)" },
        ]}
      />
    </>
  );
}

function TrendCard() {
  const { range, resolved, setRange } = useInsightsRange();
  const [view, setView] = useState<TrendView>("revenue");
  const seriesQuery = { from: resolved.from, to: resolved.to, granularity: resolved.granularity };
  const revenue = useRevenueSeries(seriesQuery);
  const activity = useActivitySeries(seriesQuery);

  return (
    <AdminInsightCard
      title="Trends"
      className="xl:col-span-2"
      action={
        <div className="flex flex-wrap items-center gap-2">
          <TrendToggle value={view} onChange={setView} />
          <ReportRangeControl value={range} onChange={setRange} />
        </div>
      }
    >
      {view === "revenue" ? (
        <ChartBody query={revenue}>{(data) => <RevenueTrend data={data} granularity={resolved.granularity} />}</ChartBody>
      ) : (
        <ChartBody query={activity}>{(data) => <ActivityTrend data={data} granularity={resolved.granularity} />}</ChartBody>
      )}
    </AdminInsightCard>
  );
}

// ── Needs attention ─────────────────────────────────────────────────────────

function NeedsAttention({ s }: { s: DashboardSummary }) {
  const items = buildNeedsAttention(s);
  return (
    <AdminInsightCard
      title="Needs attention"
      className="order-first self-start xl:order-none"
      flush
      action={items.length ? <span className="text-xs font-medium tabular-nums text-muted-foreground">{items.length} {items.length === 1 ? "item" : "items"}</span> : null}
    >
      {items.length ? (
        <ul className="divide-y divide-border">
          {items.map((item) => {
            const tone = attentionTone[item.tone];
            return (
              <li key={item.id}>
                <Link
                  href={item.href}
                  className="group flex items-center gap-3 px-5 py-3 text-sm outline-none transition-colors hover:bg-muted/50 focus-visible:bg-muted/50 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring"
                >
                  <span className="min-w-9 text-right text-base font-semibold tabular-nums text-foreground">{number.format(item.count)}</span>
                  <span className="min-w-0 flex-1 leading-5 text-foreground/85">{item.label}</span>
                  {tone === "danger" ? <AdminStatusPill tone="danger">Urgent</AdminStatusPill> : null}
                  <ChevronRight className="size-4 shrink-0 text-muted-foreground/60 transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
                </Link>
              </li>
            );
          })}
        </ul>
      ) : (
        <div className="flex items-start gap-3 px-5 py-5">
          <span className="grid size-8 shrink-0 place-items-center rounded-full bg-[color-mix(in_srgb,var(--success)_10%,white)] text-success">
            <CheckCircle2 className="size-4" aria-hidden="true" />
          </span>
          <div>
            <p className="text-sm font-medium text-foreground">All clear</p>
            <p className="text-[13px] text-muted-foreground">No payments, reviews, tickets or requests are waiting on you.</p>
          </div>
        </div>
      )}
    </AdminInsightCard>
  );
}

// ── Recent activity ─────────────────────────────────────────────────────────

const relative = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
function timeAgo(iso: string) {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return "—";
  const minutes = Math.round((then - Date.now()) / 60_000);
  if (Math.abs(minutes) < 1) return "just now";
  if (Math.abs(minutes) < 60) return relative.format(minutes, "minute");
  const hours = Math.round(minutes / 60);
  if (Math.abs(hours) < 24) return relative.format(hours, "hour");
  const days = Math.round(hours / 24);
  if (Math.abs(days) < 7) return relative.format(days, "day");
  return formatAdminDateTime(iso);
}

function RecentActivity() {
  const logs = useRecentAuditLogs(RECENT_AUDIT_LIMIT);
  const items = logs.data?.items.map(toRecentActivity) ?? [];
  return (
    <AdminInsightCard
      title="Recent activity"
      description="Latest actions recorded in the audit log"
      flush
      action={
        <Link href="/admin/audit-logs" className="inline-flex items-center gap-1 rounded-sm text-[13px] font-medium text-muted-foreground outline-none hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">
          View audit log
          <ArrowRight className="size-3.5" aria-hidden="true" />
        </Link>
      }
    >
      {logs.error ? (
        <div className="p-5">
          <AdminErrorState error={logs.error} onRetry={logs.reload} title="Could not load recent activity" />
        </div>
      ) : !logs.data ? (
        <div className="space-y-2 p-5" role="status" aria-live="polite">
          <span className="sr-only">Loading recent activity</span>
          {Array.from({ length: 4 }, (_, i) => (
            <Skeleton key={i} className="h-10 w-full rounded-lg" />
          ))}
        </div>
      ) : items.length === 0 ? (
        <AdminEmptyState variant="inline" icon={History} title="No admin activity yet" description="Status changes, refunds and publishing will appear here as they happen." />
      ) : (
        <>
          <div className="hidden md:block">
            <Table>
              <TableHeader className="bg-muted/70">
                <TableRow className="border-border hover:bg-transparent">
                  <TableHead className="h-10 px-5 text-xs font-medium text-muted-foreground">Action</TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">Record</TableHead>
                  <TableHead className="h-10 px-4 text-xs font-medium text-muted-foreground">By</TableHead>
                  <TableHead className="h-10 px-5 text-right text-xs font-medium text-muted-foreground">When</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {items.map((item) => (
                  <TableRow key={item.id} className="border-border hover:bg-muted/45">
                    <TableCell className="h-[52px] px-5">
                      <Link href={item.href} className="font-medium text-foreground hover:underline">
                        {item.action}
                      </Link>
                    </TableCell>
                    <TableCell className="max-w-[320px] truncate px-4 text-muted-foreground" title={item.entity}>
                      {item.entity}
                    </TableCell>
                    <TableCell className="max-w-[240px] truncate px-4 text-muted-foreground" title={item.actor}>
                      {item.actor}
                    </TableCell>
                    <TableCell className="px-5 text-right tabular-nums text-muted-foreground" title={formatAdminDateTime(item.at)}>
                      {timeAgo(item.at)}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          <ul className="divide-y divide-border md:hidden">
            {items.map((item) => (
              <li key={item.id}>
                <Link href={item.href} className="block px-4 py-3 outline-none hover:bg-muted/50 focus-visible:bg-muted/50">
                  <div className="flex items-baseline justify-between gap-3">
                    <span className="min-w-0 truncate text-sm font-medium text-foreground">{item.action}</span>
                    <span className="shrink-0 text-xs tabular-nums text-muted-foreground">{timeAgo(item.at)}</span>
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {item.entity} · {item.actor}
                  </p>
                </Link>
              </li>
            ))}
          </ul>
        </>
      )}
    </AdminInsightCard>
  );
}

// ── Secondary metrics ───────────────────────────────────────────────────────

type Stat = { label: string; value: string; detail?: string; href?: string };

function secondaryStats(s: DashboardSummary): Stat[] {
  return [
    { label: "Customers", value: number.format(s.totalCustomers), detail: "All time", href: "/admin/customers" },
    { label: "Live astrologers", value: number.format(s.activeAstrologers), detail: `${s.pendingAstrologerVerification} awaiting verification`, href: "/admin/astrologers" },
    { label: "Active paid chats", value: number.format(s.activePaidChatSessions), detail: "Billing now", href: "/admin/chat-sessions" },
    {
      label: "Products published",
      value: `${number.format(s.productsPublished)} of ${number.format(s.productsTotal)}`,
      detail: s.lowStockProducts ? `${s.lowStockProducts} low on stock` : "Stock levels fine",
      href: "/admin/store/products",
    },
    { label: "Open pooja requests", value: number.format(s.openPoojaRequests), detail: "Requested to in progress", href: "/admin/pooja-requests" },
    {
      label: "High-priority tickets",
      value: number.format(s.highPriorityOpenTickets),
      detail: `${s.openSupportTickets} open in total`,
      href: "/admin/support?status=open",
    },
    { label: "Reviews to moderate", value: number.format(s.pendingReviews), detail: `${s.reportedReviews} reported`, href: "/admin/reviews?status=pending" },
    { label: "Wallet top-ups", value: formatINR(s.walletTopupsThisMonthPaise), detail: "This month", href: "/admin/wallets" },
    { label: "Platform commission", value: formatINR(s.platformCommissionThisMonthPaise), detail: "This month, from paid chat", href: "/admin/earnings" },
    {
      label: "Payouts pending",
      value: formatINR(s.pendingProcessingPayoutAmountPaise),
      detail: `${s.pendingProcessingPayouts} ${s.pendingProcessingPayouts === 1 ? "payout" : "payouts"}`,
      href: "/admin/payouts?status=pending",
    },
    { label: "Earnings available", value: formatINR(s.availableAstrologerEarningsPaise), detail: "Ready to pay out", href: "/admin/earnings" },
    {
      label: "Failed payments",
      value: number.format(s.failedPaymentsThisMonth.count),
      detail: `${formatINR(s.failedPaymentsThisMonth.amountPaise)} this month`,
      href: "/admin/payments?status=failed",
    },
  ];
}

function SecondaryMetrics({ s }: { s: DashboardSummary }) {
  return (
    <AdminInsightCard title="Across the platform" flush>
      <dl className="grid grid-cols-2 gap-px overflow-hidden rounded-b-xl bg-border lg:grid-cols-3 xl:grid-cols-4">
        {secondaryStats(s).map((stat) => {
          const inner = (
            <>
              <dt className="text-[13px] text-muted-foreground">{stat.label}</dt>
              <dd className="mt-1 text-lg font-semibold tracking-tight tabular-nums text-foreground">{stat.value}</dd>
              {stat.detail ? <dd className="mt-0.5 truncate text-xs text-muted-foreground" title={stat.detail}>{stat.detail}</dd> : null}
            </>
          );
          return (
            <div key={stat.label} className="min-w-0 bg-surface">
              {stat.href ? (
                <Link href={stat.href} className="block h-full px-4 py-3.5 outline-none sm:px-5 sm:py-4 transition-colors hover:bg-muted/40 focus-visible:bg-muted/40 focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring">
                  {inner}
                </Link>
              ) : (
                <div className="px-4 py-3.5 sm:px-5 sm:py-4">{inner}</div>
              )}
            </div>
          );
        })}
      </dl>
    </AdminInsightCard>
  );
}

// ── Page ────────────────────────────────────────────────────────────────────

function SummarySkeleton() {
  return (
    <div className="space-y-4" role="status" aria-live="polite">
      <span className="sr-only">Loading dashboard</span>
      <div className="grid grid-cols-2 gap-3 sm:gap-4 xl:grid-cols-4" aria-hidden="true">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-[124px] rounded-xl sm:h-[136px]" />
        ))}
      </div>
    </div>
  );
}

export function AdminDashboardView() {
  const summary = useDashboardSummary();
  const s = summary.data;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-1.5">
          <h1 className="text-sm font-semibold text-foreground">Dashboard</h1>
          <p className="text-sm font-medium text-muted-foreground" data-admin-visible-title="">
            Today at a glance
          </p>
          <WindowNote />
        </div>
      </div>

      {summary.error ? (
        <AdminErrorState error={summary.error} onRetry={summary.reload} title="Could not load the dashboard summary" />
      ) : !s ? (
        <SummarySkeleton />
      ) : (
        <KpiRow s={s} />
      )}

      <div className="grid items-start gap-4 xl:grid-cols-3">
        <TrendCard />
        {s ? <NeedsAttention s={s} /> : summary.error ? null : <Skeleton className="order-first h-40 rounded-xl xl:order-none" />}
      </div>

      <RecentActivity />

      {s ? <SecondaryMetrics s={s} /> : null}
    </div>
  );
}
