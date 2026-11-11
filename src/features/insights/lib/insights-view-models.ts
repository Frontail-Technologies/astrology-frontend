/**
 * Pure mappers from dashboard/report API payloads to view rows. No React and no `@/` aliases (runs under `node --test`).
 */
import type { InsightTone } from "../../admin/insights/tones.ts";
import { lifecycleRows } from "../constants/insights-status.ts";
import type {
  ContentReport,
  DashboardSummary,
  FinanceReport,
  FinanceReportResponse,
  OperationsReport,
  RecentAuditLog,
} from "../types/insights-admin.ts";

/** Same shape as the shared chart `DistributionRow`. */
export type InsightRow = { key: string; label: string; value: number; tone: InsightTone };
type RowDef = { readonly key: string; readonly label: string; readonly tone: InsightTone };

const toCount = (value: unknown) => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

/** Ordered distribution rows (zero-count keys kept) from a backend count object. */
export function distributionRows(defs: readonly RowDef[], counts: object | null | undefined): InsightRow[] {
  const source = (counts ?? {}) as Record<string, unknown>;
  return defs.map((def) => ({ key: def.key, label: def.label, tone: def.tone, value: toCount(source[def.key]) }));
}

/** Rounded share, or null when the whole is zero. */
export function percentOf(part: number, whole: number): number | null {
  return whole > 0 ? Math.round((part / whole) * 100) : null;
}

// ── Dashboard ───────────────────────────────────────────────────────────────

export type AttentionId =
  | "pending-verification"
  | "failed-payments"
  | "reported-reviews"
  | "flagged-chats"
  | "open-tickets"
  | "pending-consultations"
  | "pending-orders"
  | "pending-reviews"
  | "low-stock"
  | "pending-payouts"
  | "open-pooja-requests";

export type AttentionItem = { id: AttentionId; count: number; label: string; href: string; tone: InsightTone };

const plural = (n: number, one: string, many = `${one}s`) => (n === 1 ? one : many);

/**
 * "Needs attention" rows from the dashboard summary, most urgent first, each linking to the matching filtered admin
 * list. Zero counts are dropped. The label excludes the number (the view renders the count separately).
 */
export function buildNeedsAttention(s: DashboardSummary): AttentionItem[] {
  const failed = s.failedPaymentsThisMonth?.count ?? 0;
  const items: AttentionItem[] = [
    { id: "failed-payments", count: failed, tone: "red", href: "/admin/payments?status=failed", label: `failed ${plural(failed, "payment")} this month` },
    { id: "reported-reviews", count: s.reportedReviews, tone: "red", href: "/admin/reviews?status=reported", label: `reported ${plural(s.reportedReviews, "review")}` },
    { id: "flagged-chats", count: s.flaggedChats, tone: "red", href: "/admin/chats?flagged=true", label: `flagged ${plural(s.flaggedChats, "chat")}` },
    {
      id: "pending-verification",
      count: s.pendingAstrologerVerification,
      tone: "amber",
      href: "/admin/astrologers?verificationStatus=pending",
      label: `${plural(s.pendingAstrologerVerification, "astrologer")} awaiting verification`,
    },
    {
      id: "open-tickets",
      count: s.openSupportTickets,
      tone: "amber",
      href: "/admin/support?status=open",
      label: `open support ${plural(s.openSupportTickets, "ticket")}${s.highPriorityOpenTickets ? ` (${s.highPriorityOpenTickets} high priority)` : ""}`,
    },
    {
      id: "pending-consultations",
      count: s.pendingConsultations,
      tone: "violet",
      href: "/admin/consultations?status=requested",
      label: `${plural(s.pendingConsultations, "consultation")} awaiting a response`,
    },
    { id: "pending-orders", count: s.pendingOrders, tone: "orange", href: "/admin/orders?status=pending", label: `pending ${plural(s.pendingOrders, "order")}` },
    {
      id: "pending-reviews",
      count: s.pendingReviews,
      tone: "amber",
      href: "/admin/reviews?status=pending",
      label: `${plural(s.pendingReviews, "review")} awaiting moderation`,
    },
    {
      id: "open-pooja-requests",
      count: s.openPoojaRequests,
      tone: "violet",
      href: "/admin/pooja-requests?status=requested",
      label: `open pooja ${plural(s.openPoojaRequests, "request")}`,
    },
    {
      id: "pending-payouts",
      count: s.pendingProcessingPayouts,
      tone: "blue",
      href: "/admin/payouts?status=pending",
      label: `${plural(s.pendingProcessingPayouts, "payout")} pending or processing`,
    },
    {
      id: "low-stock",
      count: s.lowStockProducts,
      tone: "orange",
      href: "/admin/store/products",
      label: `low-stock ${plural(s.lowStockProducts, "product")} (≤ ${s.lowStockThreshold})`,
    },
  ];
  return items.filter((item) => item.count > 0);
}

/** Total revenue this month across the separate streams (chat gross, store orders, wallet top-ups). */
export function monthRevenueStreams(s: DashboardSummary) {
  return {
    chatPaise: s.paidChatRevenueThisMonthPaise,
    storePaise: s.orderRevenueThisMonthPaise,
    walletTopupsPaise: s.walletTopupsThisMonthPaise,
    commissionPaise: s.platformCommissionThisMonthPaise,
  };
}

export type RecentActivityItem = { id: string; actor: string; action: string; entity: string; at: string; href: string };

const ACRONYMS = new Set(["kyc", "url", "id"]);

/** `payout.status_changed` -> `Payout status changed`. */
export function humanizeAuditAction(action: string): string {
  const words = action
    .split(/[._]/)
    .filter(Boolean)
    .map((word) => (ACRONYMS.has(word) ? word.toUpperCase() : word));
  if (words.length === 0) return action;
  const sentence = words.join(" ");
  return sentence[0].toUpperCase() + sentence.slice(1);
}

/** Dashboard row for an audit log entry; links to the audit log filtered on the entity when it has an id. */
export function toRecentActivity(log: RecentAuditLog): RecentActivityItem {
  const entityType = log.entityType.replace(/_/g, " ");
  const entity = log.entityLabel?.trim() ? `${entityType}: ${log.entityLabel.trim()}` : entityType;
  const params = new URLSearchParams();
  if (log.entityId) {
    params.set("entityType", log.entityType);
    params.set("entityId", log.entityId);
  }
  const query = params.toString();
  return {
    id: log.id,
    actor: log.actor?.email ?? (log.actorRole === "system" || !log.actorUserId ? "System" : "Unknown user"),
    action: humanizeAuditAction(log.action),
    entity,
    at: log.createdAt,
    href: query ? `/admin/audit-logs?${query}` : "/admin/audit-logs",
  };
}

// ── Reports ─────────────────────────────────────────────────────────────────

/** Report series use a `date` (YYYY-MM-DD, UTC day); the shared chart wants `bucketStart`. */
export function toDayBuckets<T extends { date: string }>(series: readonly T[] | null | undefined): (T & { bucketStart: string })[] {
  return (series ?? []).map((point) => ({ ...point, bucketStart: `${point.date}T00:00:00.000Z` }));
}

/** Accepts the pre-4.4 bare failed-payment count as well as `{ count, amountPaise }`. */
export function normalizeFinance(raw: FinanceReportResponse): FinanceReport {
  const failed = raw.failedPayments;
  return {
    ...raw,
    failedPayments: typeof failed === "number" ? { count: failed, amountPaise: null } : { count: toCount(failed?.count), amountPaise: toCount(failed?.amountPaise) },
  };
}

/** Payment success rate (succeeded / (succeeded + failed)) or null without attempts. */
export function paymentSuccessRate(finance: FinanceReport): number | null {
  return percentOf(finance.successfulPayments.count, finance.successfulPayments.count + finance.failedPayments.count);
}

function countRecord<K extends string>(keys: readonly K[], raw: unknown): Record<K, number> {
  const source = (raw ?? {}) as Record<string, unknown>;
  return Object.fromEntries(keys.map((key) => [key, toCount(source[key])])) as Record<K, number>;
}

/** Operations counts come from `jsonb_build_object`; coerce every key to a number and fill gaps with zero. */
export function normalizeOperations(raw: Partial<Record<keyof OperationsReport, unknown>>): OperationsReport {
  return {
    poojaRequestsByStatus: countRecord(lifecycleRows.map((row) => row.key), raw.poojaRequestsByStatus),
    supportTicketsByStatus: countRecord(["open", "inProgress", "resolved", "closed"] as const, raw.supportTicketsByStatus),
    supportTicketsByPriority: countRecord(["low", "normal", "high"] as const, raw.supportTicketsByPriority),
    reviewsByModerationStatus: countRecord(["pending", "approved", "rejected", "reported"] as const, raw.reviewsByModerationStatus),
    workload: countRecord(["openPoojaRequests", "openSupportTickets", "reviewsAwaitingModeration"] as const, raw.workload),
  };
}

export type ContentStatusBar = { type: string; live: number; inProgress: number; other: number };

/** Stacked "content by status" bars (current state, not date-filtered). */
export function contentStatusBars(report: ContentReport): ContentStatusBar[] {
  const { articles, reviews, horoscopes } = report.statusCounts;
  return [
    { type: "Articles", live: articles.published, inProgress: articles.scheduled, other: articles.draft },
    { type: "Reviews", live: reviews.approved, inProgress: reviews.pending, other: reviews.reported + reviews.rejected },
    { type: "Horoscopes", live: horoscopes.published, inProgress: 0, other: horoscopes.draft },
  ];
}

export type ContentTableRow = { id: string; type: string; ready: number; total: number; detail: string };

const dateOnly = (value: string | null) => (value ? value.slice(0, 10) : null);

export function contentTableRows(report: ContentReport): ContentTableRow[] {
  const { readiness, statusCounts } = report;
  const horoscopeDate = dateOnly(readiness.horoscopes.date);
  return [
    {
      id: "articles",
      type: "Articles",
      ready: readiness.articles.published,
      total: readiness.articles.total,
      detail: `${readiness.articles.scheduled} scheduled · ${readiness.articles.draft} draft`,
    },
    {
      id: "horoscopes",
      type: "Daily horoscopes",
      ready: readiness.horoscopes.published,
      total: readiness.horoscopes.total,
      detail: horoscopeDate ? `Latest set: ${horoscopeDate}` : "No daily entries",
    },
    {
      id: "reviews",
      type: "Reviews",
      ready: statusCounts.reviews.approved,
      total: statusCounts.reviews.total,
      detail: `${statusCounts.reviews.pending} pending · ${statusCounts.reviews.reported} reported · ${statusCounts.reviews.rejected} rejected`,
    },
    { id: "poojas", type: "Poojas", ready: readiness.poojas.ready, total: readiness.poojas.total, detail: "Description, image, price, duration and content set" },
    {
      id: "astrologers",
      type: "Astrologers",
      ready: readiness.astrologers.ready,
      total: readiness.astrologers.total,
      detail: "Bio, photo, experience and languages set",
    },
    {
      id: "calculators",
      type: "Calculators",
      ready: readiness.calculators.partial,
      total: readiness.calculators.total,
      detail: `${readiness.calculators.partial} with detail content · ${readiness.calculators.catalogOnly} catalog only`,
    },
  ];
}

/** Dashboard: the busiest astrologers in the range by consultations (ties broken by completed), as bar rows. */
export function topAstrologerRows(performance: readonly { astrologerId: string; displayName: string; consultations: number; completed: number }[] | null | undefined, limit = 6): InsightRow[] {
  return [...(performance ?? [])]
    .filter((row) => row.consultations > 0)
    .sort((a, b) => b.consultations - a.consultations || b.completed - a.completed || a.displayName.localeCompare(b.displayName))
    .slice(0, limit)
    .map((row) => ({ key: row.astrologerId, label: row.displayName, value: row.consultations, tone: "blue" as InsightTone }));
}

/** Dashboard: succeeded vs failed payments in the range (status colours: they are outcomes, not series). */
export function paymentOutcomeRows(finance: Pick<FinanceReport, "successfulPayments" | "failedPayments"> | null | undefined): InsightRow[] {
  return [
    { key: "succeeded", label: "Succeeded", value: toCount(finance?.successfulPayments.count), tone: "green" },
    { key: "failed", label: "Failed", value: toCount(finance?.failedPayments.count), tone: "red" },
  ];
}

/**
 * Sums daily points (`{ date: "YYYY-MM-DD", ...counts }`) into the chart's granularity so long ranges read as weeks
 * (starting Monday) or months instead of spiky days. Adds `bucketStart` for the series chart.
 */
export function rebucketDaily<T extends { date: string }>(series: readonly T[] | null | undefined, granularity: "day" | "week" | "month"): (T & { bucketStart: string })[] {
  if (granularity === "day") return toDayBuckets(series);
  const buckets = new Map<string, Record<string, unknown>>();
  for (const point of series ?? []) {
    const day = new Date(`${point.date}T00:00:00.000Z`);
    if (granularity === "week") day.setUTCDate(day.getUTCDate() - ((day.getUTCDay() + 6) % 7));
    else day.setUTCDate(1);
    const start = day.toISOString().slice(0, 10);
    const bucket = buckets.get(start) ?? { date: start };
    for (const [key, value] of Object.entries(point)) {
      if (key !== "date" && typeof value === "number") bucket[key] = (Number(bucket[key]) || 0) + value;
    }
    buckets.set(start, bucket);
  }
  return [...buckets.values()]
    .sort((a, b) => String(a.date).localeCompare(String(b.date)))
    .map((bucket) => ({ ...(bucket as T), bucketStart: `${String(bucket.date)}T00:00:00.000Z` }));
}

