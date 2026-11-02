/**
 * Admin dashboard and report contracts (`/admin/dashboard/*`, `/admin/reports/*`, `/admin/audit-logs`).
 * Money is integer paise. Series buckets are UTC (`bucketStart` ISO, or a `date` YYYY-MM-DD for report series).
 */
import type { AdminGranularity } from "../../admin/data/admin-range.ts";

export type InsightsGranularity = AdminGranularity;

/** `GET /admin/dashboard/summary` (UTC day/month windows). */
export type DashboardSummary = {
  totalCustomers: number;
  activeAstrologers: number;
  pendingAstrologerVerification: number;
  consultationsToday: number;
  upcomingConsultations: number;
  pendingConsultations: number;
  activePaidChatSessions: number;
  ordersToday: number;
  pendingOrders: number;
  processingOrders: number;
  openPoojaRequests: number;
  openSupportTickets: number;
  highPriorityOpenTickets: number;
  pendingReviews: number;
  reportedReviews: number;
  flaggedChats: number;
  productsTotal: number;
  productsPublished: number;
  lowStockProducts: number;
  lowStockThreshold: number;
  pendingProcessingPayouts: number;
  pendingProcessingPayoutAmountPaise: number;
  paidChatRevenueTodayPaise: number;
  paidChatRevenueThisMonthPaise: number;
  platformCommissionThisMonthPaise: number;
  availableAstrologerEarningsPaise: number;
  walletTopupsThisMonthPaise: number;
  orderRevenueThisMonthPaise: number;
  failedPaymentsThisMonth: { count: number; amountPaise: number };
};

/** `GET /admin/dashboard/revenue-series` item. */
export type RevenueBucket = {
  bucketStart: string;
  paidChatGrossRevenuePaise: number;
  platformCommissionPaise: number;
  storeOrderRevenuePaise: number;
  walletTopupsPaise: number;
};

/** `GET /admin/dashboard/activity-series` item. */
export type ActivityBucket = {
  bucketStart: string;
  consultationsCreated: number;
  ordersPlaced: number;
  paymentsSucceeded: number;
  paymentsFailed: number;
};

export type SeriesQuery = { from: string; to: string; granularity: InsightsGranularity };
export type RangeQuery = { from: string; to: string };

export const consultationReportModes = ["chat", "voice", "video"] as const;
export type ConsultationReportMode = (typeof consultationReportModes)[number];
export const consultationReportStatuses = ["requested", "accepted", "scheduled", "in_progress", "completed", "cancelled", "rejected"] as const;
export type ConsultationReportStatus = (typeof consultationReportStatuses)[number];

export type ConsultationReportFilters = {
  mode: ConsultationReportMode | null;
  status: ConsultationReportStatus | null;
  astrologerId: string | null;
};

/** `GET /admin/reports/consultations`. */
export type ConsultationReport = {
  totalConsultations: number;
  byStatus: { requested: number; accepted: number; scheduled: number; inProgress: number; completed: number; cancelled: number; rejected: number };
  byMode: { chat: number; voice: number; video: number };
  paidChatSessions: number;
  averageBilledDurationSeconds: number;
  grossChargedPaise: number;
  platformFeePaise: number;
  astrologerEarningsPaise: number;
  series: { date: string; created: number; completed: number; cancelled: number }[];
  astrologerPerformance: {
    astrologerId: string;
    displayName: string;
    consultations: number;
    completed: number;
    cancelled: number;
    grossChargedPaise: number;
  }[];
};

/** `GET /admin/reports/store`. */
export type StoreReport = {
  ordersCount: number;
  subtotalPaise: number;
  discountsPaise: number;
  shippingPaise: number;
  finalRevenuePaise: number;
  averageOrderValuePaise: number;
  ordersByStatus: { pending: number; confirmed: number; processing: number; shipped: number; delivered: number; cancelled: number };
  topProducts: { productId: string | null; productName: string; productSlug: string; quantity: number; revenuePaise: number }[];
  refundedPaise: number;
  lowStockThreshold: number;
  lowStock: { productId: string; name: string; slug: string; inventoryQuantity: number }[];
  couponUsage: { couponId: string; code: string; redemptions: number; discountPaise: number }[];
};

export type CountAmount = { count: number; amountPaise: number };

/** `GET /admin/reports/finance` as received (`failedPayments` was a bare count before Phase 4.4). */
export type FinanceReportResponse = Omit<FinanceReport, "failedPayments"> & { failedPayments: CountAmount | number };

/** Normalized finance report. `failedPayments.amountPaise` is null when the API only sent a count. */
export type FinanceReport = {
  successfulPayments: CountAmount;
  failedPayments: { count: number; amountPaise: number | null };
  walletTopupsPaise: number;
  customerWalletBalancesPaise: number;
  earningsByStatusPaise: { pending: number; available: number; held: number; paid: number };
  payoutsByStatus: { pending: number; processing: number; paid: number; failed: number };
  paidPayoutsPaise: number;
  platformCommissionRevenuePaise: number;
};

/** `GET /admin/reports/operations`. */
export type OperationsReport = {
  poojaRequestsByStatus: { requested: number; accepted: number; scheduled: number; inProgress: number; completed: number; cancelled: number; rejected: number };
  supportTicketsByStatus: { open: number; inProgress: number; resolved: number; closed: number };
  supportTicketsByPriority: { low: number; normal: number; high: number };
  reviewsByModerationStatus: { pending: number; approved: number; rejected: number; reported: number };
  workload: { openPoojaRequests: number; openSupportTickets: number; reviewsAwaitingModeration: number };
};

/** `GET /admin/reports/customers`. */
export type CustomerReport = {
  total: number;
  newInRange: number;
  withConsultations: number;
  withOrders: number;
  both: number;
  segments: { consultationOnly: number; storeOnly: number; both: number; noActivity: number };
  newSeries: { date: string; newCustomers: number }[];
  rows: { id: string; name: string; consultations: number; orders: number; orderValuePaise: number }[];
};

/** `GET /admin/reports/content`. */
export type ContentReport = {
  readiness: {
    astrologers: { ready: number; total: number };
    poojas: { ready: number; total: number };
    calculators: { partial: number; catalogOnly: number; total: number };
    articles: { published: number; scheduled: number; draft: number; total: number };
    horoscopes: { date: string | null; published: number; total: number };
  };
  publishedInRange: number;
  reviewsInRange: number;
  pendingReviews: number;
  reportedReviews: number;
  statusCounts: {
    articles: { published: number; scheduled: number; draft: number };
    reviews: { approved: number; pending: number; reported: number; rejected: number; total: number };
    horoscopes: { published: number; draft: number };
  };
};

/** `GET /admin/audit-logs` item (fields the dashboard reads). */
export type RecentAuditLog = {
  id: string;
  actorUserId: string | null;
  actorRole: string | null;
  action: string;
  entityType: string;
  entityId: string | null;
  entityLabel: string | null;
  createdAt: string;
  actor: { id: string; email: string; name: string | null; role: string } | null;
};
