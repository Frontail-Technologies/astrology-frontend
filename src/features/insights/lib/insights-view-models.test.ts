import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { lifecycleRows, orderStatusRows } from "../constants/insights-status.ts";
import {
  consultationReportQuery,
  parseReportsUrlState,
  serializeReportsUrlState,
} from "../state/insights-state.ts";
import type { ContentReport, DashboardSummary, FinanceReportResponse, RecentAuditLog } from "../types/insights-admin.ts";
import {
  buildNeedsAttention,
  contentStatusBars,
  contentTableRows,
  distributionRows,
  humanizeAuditAction,
  normalizeFinance,
  normalizeOperations,
  paymentSuccessRate,
  percentOf,
  toDayBuckets,
  toRecentActivity,
  paymentOutcomeRows,
  rebucketDaily,
  topAstrologerRows,
} from "./insights-view-models.ts";

const zeroSummary: DashboardSummary = {
  totalCustomers: 0,
  activeAstrologers: 0,
  pendingAstrologerVerification: 0,
  consultationsToday: 0,
  upcomingConsultations: 0,
  pendingConsultations: 0,
  activePaidChatSessions: 0,
  ordersToday: 0,
  pendingOrders: 0,
  processingOrders: 0,
  openPoojaRequests: 0,
  openSupportTickets: 0,
  highPriorityOpenTickets: 0,
  pendingReviews: 0,
  reportedReviews: 0,
  flaggedChats: 0,
  productsTotal: 0,
  productsPublished: 0,
  lowStockProducts: 0,
  lowStockThreshold: 5,
  pendingProcessingPayouts: 0,
  pendingProcessingPayoutAmountPaise: 0,
  paidChatRevenueTodayPaise: 0,
  paidChatRevenueThisMonthPaise: 0,
  platformCommissionThisMonthPaise: 0,
  availableAstrologerEarningsPaise: 0,
  walletTopupsThisMonthPaise: 0,
  orderRevenueThisMonthPaise: 0,
  failedPaymentsThisMonth: { count: 0, amountPaise: 0 },
};

describe("buildNeedsAttention", () => {
  it("returns nothing when every count is zero", () => {
    assert.deepEqual(buildNeedsAttention(zeroSummary), []);
  });

  it("links each non-zero count to its filtered admin list, most urgent first", () => {
    const items = buildNeedsAttention({
      ...zeroSummary,
      pendingAstrologerVerification: 2,
      pendingConsultations: 1,
      pendingOrders: 3,
      failedPaymentsThisMonth: { count: 4, amountPaise: 12_000 },
      pendingReviews: 5,
      reportedReviews: 1,
      flaggedChats: 2,
      openSupportTickets: 6,
      highPriorityOpenTickets: 2,
      lowStockProducts: 7,
      pendingProcessingPayouts: 1,
      openPoojaRequests: 2,
    });
    const byId = Object.fromEntries(items.map((item) => [item.id, item]));
    assert.equal(items[0].id, "failed-payments");
    assert.equal(byId["pending-verification"].href, "/admin/astrologers?verificationStatus=pending");
    assert.equal(byId["pending-consultations"].href, "/admin/consultations?status=requested");
    assert.equal(byId["pending-orders"].href, "/admin/orders?status=pending");
    assert.equal(byId["failed-payments"].href, "/admin/payments?status=failed");
    assert.equal(byId["pending-reviews"].href, "/admin/reviews?status=pending");
    assert.equal(byId["reported-reviews"].href, "/admin/reviews?status=reported");
    assert.equal(byId["flagged-chats"].href, "/admin/chats?flagged=true");
    assert.equal(byId["open-tickets"].href, "/admin/support?status=open");
    assert.equal(byId["low-stock"].href, "/admin/store/products");
    assert.equal(byId["pending-payouts"].href, "/admin/payouts?status=pending");
    assert.equal(byId["open-pooja-requests"].href, "/admin/pooja-requests?status=requested");
    assert.equal(items.length, 11);
    assert.match(byId["open-tickets"].label, /2 high priority/);
    assert.match(byId["low-stock"].label, /≤ 5/);
  });

  it("uses singular wording for a count of one", () => {
    const [item] = buildNeedsAttention({ ...zeroSummary, pendingOrders: 1 });
    assert.equal(item.label, "pending order");
    assert.equal(item.count, 1);
  });
});

describe("recent activity", () => {
  const log: RecentAuditLog = {
    id: "a1",
    actorUserId: "u1",
    actorRole: "admin",
    action: "pooja_request.status_changed",
    entityType: "pooja_request",
    entityId: "11111111-1111-4111-8111-111111111111",
    entityLabel: "Rudrabhishek for Asha",
    createdAt: "2026-10-30T10:00:00.000Z",
    actor: { id: "u1", email: "ops@example.com", name: null, role: "admin" },
  };

  it("humanizes dotted/underscored actions", () => {
    assert.equal(humanizeAuditAction("payout.status_changed"), "Payout status changed");
    assert.equal(humanizeAuditAction("media.uploaded"), "Media uploaded");
  });

  it("maps actor email, action, entity label and a filtered audit link", () => {
    const item = toRecentActivity(log);
    assert.equal(item.actor, "ops@example.com");
    assert.equal(item.action, "Pooja request status changed");
    assert.equal(item.entity, "pooja request: Rudrabhishek for Asha");
    assert.equal(item.href, `/admin/audit-logs?entityType=pooja_request&entityId=${log.entityId}`);
  });

  it("falls back to System and the plain audit link", () => {
    const item = toRecentActivity({ ...log, actor: null, actorUserId: null, entityId: null, entityLabel: null });
    assert.equal(item.actor, "System");
    assert.equal(item.entity, "pooja request");
    assert.equal(item.href, "/admin/audit-logs");
  });
});

describe("report mappers", () => {
  it("builds ordered distribution rows and fills missing keys with zero", () => {
    const rows = distributionRows(orderStatusRows, { pending: 2, delivered: "4" as unknown as number });
    assert.deepEqual(rows.map((row) => [row.key, row.value]), [
      ["pending", 2],
      ["confirmed", 0],
      ["processing", 0],
      ["shipped", 0],
      ["delivered", 4],
      ["cancelled", 0],
    ]);
  });

  it("computes shares only for a non-zero whole", () => {
    assert.equal(percentOf(1, 3), 33);
    assert.equal(percentOf(1, 0), null);
  });

  it("turns report day series into UTC chart buckets", () => {
    assert.deepEqual(toDayBuckets([{ date: "2026-10-01", newCustomers: 3 }]), [
      { date: "2026-10-01", newCustomers: 3, bucketStart: "2026-10-01T00:00:00.000Z" },
    ]);
    assert.deepEqual(toDayBuckets(null), []);
  });

  const finance: Omit<FinanceReportResponse, "failedPayments"> = {
    successfulPayments: { count: 9, amountPaise: 90_000 },
    walletTopupsPaise: 1,
    customerWalletBalancesPaise: 2,
    earningsByStatusPaise: { pending: 1, available: 2, held: 3, paid: 4 },
    payoutsByStatus: { pending: 1, processing: 0, paid: 2, failed: 0 },
    paidPayoutsPaise: 5,
    platformCommissionRevenuePaise: 6,
  };

  it("normalizes both failed-payment shapes and derives the success rate", () => {
    const legacy = normalizeFinance({ ...finance, failedPayments: 1 });
    assert.deepEqual(legacy.failedPayments, { count: 1, amountPaise: null });
    assert.equal(paymentSuccessRate(legacy), 90);
    const current = normalizeFinance({ ...finance, failedPayments: { count: 3, amountPaise: 4_500 } });
    assert.deepEqual(current.failedPayments, { count: 3, amountPaise: 4_500 });
    assert.equal(paymentSuccessRate({ ...current, successfulPayments: { count: 0, amountPaise: 0 }, failedPayments: { count: 0, amountPaise: 0 } }), null);
  });

  it("coerces operations jsonb counts and fills gaps", () => {
    const ops = normalizeOperations({
      poojaRequestsByStatus: { requested: "2", inProgress: 1 },
      supportTicketsByStatus: {},
      reviewsByModerationStatus: { reported: 4 },
      workload: { openPoojaRequests: "3" },
    });
    assert.equal(ops.poojaRequestsByStatus.requested, 2);
    assert.equal(ops.poojaRequestsByStatus.inProgress, 1);
    assert.equal(ops.poojaRequestsByStatus.rejected, 0);
    assert.deepEqual(ops.supportTicketsByPriority, { low: 0, normal: 0, high: 0 });
    assert.equal(ops.reviewsByModerationStatus.reported, 4);
    assert.deepEqual(ops.workload, { openPoojaRequests: 3, openSupportTickets: 0, reviewsAwaitingModeration: 0 });
    assert.deepEqual(
      distributionRows(lifecycleRows, ops.poojaRequestsByStatus).map((row) => row.value),
      [2, 0, 0, 1, 0, 0, 0],
    );
  });

  const content: ContentReport = {
    readiness: {
      astrologers: { ready: 3, total: 5 },
      poojas: { ready: 1, total: 2 },
      calculators: { partial: 4, catalogOnly: 6, total: 10 },
      articles: { published: 7, scheduled: 2, draft: 1, total: 10 },
      horoscopes: { date: "2026-10-31T00:00:00.000Z", published: 10, total: 12 },
    },
    publishedInRange: 3,
    reviewsInRange: 4,
    pendingReviews: 2,
    reportedReviews: 1,
    statusCounts: {
      articles: { published: 7, scheduled: 2, draft: 1 },
      reviews: { approved: 8, pending: 2, reported: 1, rejected: 3, total: 14 },
      horoscopes: { published: 40, draft: 5 },
    },
  };

  it("builds content status bars and table rows from current counts", () => {
    assert.deepEqual(contentStatusBars(content), [
      { type: "Articles", live: 7, inProgress: 2, other: 1 },
      { type: "Reviews", live: 8, inProgress: 2, other: 4 },
      { type: "Horoscopes", live: 40, inProgress: 0, other: 5 },
    ]);
    const rows = contentTableRows(content);
    assert.equal(rows.find((row) => row.id === "horoscopes")?.detail, "Latest set: 2026-10-31");
    assert.equal(rows.find((row) => row.id === "reviews")?.total, 14);
    assert.equal(
      contentTableRows({ ...content, readiness: { ...content.readiness, horoscopes: { date: null, published: 0, total: 0 } } }).find((row) => row.id === "horoscopes")?.detail,
      "No daily entries",
    );
  });
});

describe("reports URL state", () => {
  const id = "11111111-1111-4111-8111-111111111111";

  it("parses tab, range and validated consultation filters", () => {
    const state = parseReportsUrlState(new URLSearchParams(`tab=consultations&range=7d&mode=voice&status=in_progress&astrologerId=${id}`));
    assert.equal(state.tab, "consultations");
    assert.equal(state.range.preset, "7d");
    assert.deepEqual(state.consultation, { mode: "voice", status: "in_progress", astrologerId: id });
  });

  it("drops unknown values", () => {
    const state = parseReportsUrlState(new URLSearchParams("tab=nope&mode=fax&status=done&astrologerId=abc"));
    assert.equal(state.tab, "overview");
    assert.equal(state.range.preset, "30d");
    assert.deepEqual(state.consultation, { mode: null, status: null, astrologerId: null });
  });

  it("serializes only non-defaults and keeps consultation filters on their tab", () => {
    const consultation = { mode: "chat" as const, status: null, astrologerId: id };
    const range = { preset: "30d" as const, customFrom: "", customTo: "" };
    assert.equal(serializeReportsUrlState({ tab: "overview", range, consultation }), "");
    assert.equal(serializeReportsUrlState({ tab: "consultations", range, consultation }), `tab=consultations&mode=chat&astrologerId=${id}`);
    assert.equal(serializeReportsUrlState({ tab: "operations", range: { ...range, preset: "90d" }, consultation }), "range=90d&tab=operations");
  });

  it("builds the consultation report query without unset filters", () => {
    assert.deepEqual(consultationReportQuery({ from: "a", to: "b" }, { mode: null, status: "completed", astrologerId: null }), { from: "a", to: "b", status: "completed" });
  });
});

describe("dashboard chart rows", () => {
  it("ranks the busiest astrologers and drops idle ones", () => {
    const rows = topAstrologerRows([
      { astrologerId: "a", displayName: "Asha", consultations: 3, completed: 1 },
      { astrologerId: "b", displayName: "Bhanu", consultations: 0, completed: 0 },
      { astrologerId: "c", displayName: "Chitra", consultations: 3, completed: 2 },
      { astrologerId: "d", displayName: "Dev", consultations: 5, completed: 5 },
    ], 2);
    assert.deepEqual(rows.map((row) => [row.label, row.value]), [["Dev", 5], ["Chitra", 3]]);
    assert.deepEqual(topAstrologerRows(null), []);
  });

  it("maps payment outcomes", () => {
    const rows = paymentOutcomeRows({ successfulPayments: { count: 9, amountPaise: 900 }, failedPayments: { count: 2, amountPaise: null } });
    assert.deepEqual(rows.map((row) => [row.key, row.value, row.tone]), [["succeeded", 9, "green"], ["failed", 2, "red"]]);
  });
});

describe("rebucketDaily", () => {
  const days = [
    { date: "2026-11-02", created: 1, completed: 0 },
    { date: "2026-11-05", created: 2, completed: 1 },
    { date: "2026-11-09", created: 4, completed: 3 },
  ];
  it("keeps days as they are", () => {
    assert.equal(rebucketDaily(days, "day").length, 3);
  });
  it("sums into Monday-start weeks and months", () => {
    assert.deepEqual(rebucketDaily(days, "week").map((row) => [row.date, row.created, row.completed]), [["2026-11-02", 3, 1], ["2026-11-09", 4, 3]]);
    assert.deepEqual(rebucketDaily(days, "month").map((row) => [row.bucketStart, row.created]), [["2026-11-01T00:00:00.000Z", 7]]);
  });
});

