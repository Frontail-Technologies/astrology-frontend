import { astrologers } from "@/features/astrologers/data/astrologers";
import type { ConsultationMode } from "@/features/astrologers/types/astrologer";
import type { ConsultationBookingStatus } from "@/features/consultations/types/consultation";
import type { OrderFulfillmentStatus } from "@/features/orders/types/order";
import type { PaymentStatus } from "@/features/payments/types/payment";
import { isLowStock } from "@/features/store/selectors/store-domain";
import { countBy, orderedCounts, sumBy } from "./aggregate";
import { getContentReadiness } from "./content-selectors";
import { isUpcomingConsultation } from "./dashboard-selectors";
import { filterByDateRange, type DateRange } from "./date-range";
import {
  consultationModeTone,
  consultationStatusTone,
  orderStatusTone,
  paymentStatusTone,
} from "./tones";
import {
  consultationDate,
  dailyCountSeries,
  dailyValueSeries,
  getActivitySeries,
} from "./timeseries-selectors";
import type { InsightsSnapshot } from "./use-insights-data";

const capitalize = (value: string) => value[0].toUpperCase() + value.slice(1);
const label = (value: string) => capitalize(value.replace("-", " "));
const percent = (part: number, whole: number) => (whole ? Math.round((part / whole) * 100) : null);

const orderStatuses = ["pending", "processing", "shipped", "delivered", "cancelled", "returned"] as const;
const paymentStatuses = ["success", "pending", "failed", "refunded", "partially-refunded"] as const;
const consultationStatuses = ["pending", "confirmed", "completed", "cancelled"] as const;
const modes = ["Chat", "Voice", "Video"] as const;

const refundedAmount = (p: InsightsSnapshot["payments"][number]) =>
  p.refundedAmountInPaise ?? (p.status === "refunded" ? p.amountInPaise : 0);

// ── Consultations ───────────────────────────────────────────────────────────

export type ConsultationFilters = {
  mode: "all" | ConsultationMode;
  status: "all" | ConsultationBookingStatus;
  astrologerId: "all" | string;
};

export function getConsultationReport(s: InsightsSnapshot, range: DateRange, f: ConsultationFilters) {
  const rows = filterByDateRange(s.consultations, consultationDate, range).filter(
    (c) =>
      (f.mode === "all" || c.mode === f.mode) &&
      (f.status === "all" || c.bookingStatus === f.status) &&
      (f.astrologerId === "all" || c.astrologerId === f.astrologerId),
  );
  const statusCounts = countBy(rows, (c) => c.bookingStatus);
  const cancelled = statusCounts.cancelled ?? 0;

  const byAstrologer = astrologers
    .map((a) => {
      const mine = rows.filter((c) => c.astrologerId === a.id);
      const ids = new Set(mine.map((c) => c.id));
      const paid = s.payments.filter(
        (p) => p.type === "consultation" && p.status === "success" && ids.has(p.referenceId),
      );
      return {
        id: a.id,
        name: a.name,
        total: mine.length,
        completed: mine.filter((c) => c.bookingStatus === "completed").length,
        cancelled: mine.filter((c) => c.bookingStatus === "cancelled").length,
        paidInPaise: sumBy(paid, (p) => p.amountInPaise),
      };
    })
    .filter((row) => row.total > 0)
    .sort((a, b) => b.total - a.total);

  return {
    total: rows.length,
    completed: statusCounts.completed ?? 0,
    cancelled,
    upcoming: rows.filter((c) => isUpcomingConsultation(s, c)).length,
    cancellationRate: percent(cancelled, rows.length),
    series: dailyCountSeries(rows, consultationDate, range, "consultations"),
    statusRows: orderedCounts(statusCounts, consultationStatuses).map(({ key, value }) => ({
      key,
      label: capitalize(key),
      value,
      tone: consultationStatusTone[key],
    })),
    modeRows: orderedCounts(countBy(rows, (c) => c.mode), modes).map(({ key, value }) => ({
      key,
      label: key,
      value,
      tone: consultationModeTone[key],
    })),
    byAstrologer,
  };
}

// ── Commerce ────────────────────────────────────────────────────────────────

export type CommerceFilters = {
  orderStatus: "all" | OrderFulfillmentStatus;
  paymentStatus: "all" | PaymentStatus;
};

export function getCommerceReport(s: InsightsSnapshot, range: DateRange, f: CommerceFilters) {
  const orders = filterByDateRange(s.orders, (o) => o.createdAt, range).filter(
    (o) => f.orderStatus === "all" || o.fulfillmentStatus === f.orderStatus,
  );
  const payments = filterByDateRange(s.payments, (p) => p.createdAt, range).filter(
    (p) => f.paymentStatus === "all" || p.status === f.paymentStatus,
  );
  const billable = orders.filter((o) => o.fulfillmentStatus !== "cancelled" && o.fulfillmentStatus !== "returned");
  const gross = sumBy(billable, (o) => o.totalInPaise);
  const successful = payments.filter((p) => p.status === "success");

  const productMap = new Map<string, { name: string; units: number; valueInPaise: number }>();
  for (const order of billable) {
    for (const item of order.items) {
      const row = productMap.get(item.productId) ?? { name: item.productNameSnapshot, units: 0, valueInPaise: 0 };
      row.units += item.quantity;
      row.valueInPaise += item.unitPriceInPaise * item.quantity;
      productMap.set(item.productId, row);
    }
  }

  return {
    orderCount: orders.length,
    grossInPaise: gross,
    averageOrderInPaise: billable.length ? Math.round(gross / billable.length) : null,
    valueSeries: dailyValueSeries(billable, (o) => o.createdAt, (o) => o.totalInPaise, range, "orderValue"),
    successVolumeInPaise: sumBy(successful, (p) => p.amountInPaise),
    successCount: successful.length,
    refundedInPaise: sumBy(payments, refundedAmount),
    lowStock: s.products.filter(isLowStock).length,
    couponUses: sumBy(s.coupons, (c) => c.usageCount),
    orderRows: orderedCounts(countBy(orders, (o) => o.fulfillmentStatus), orderStatuses).map(({ key, value }) => ({
      key,
      label: capitalize(key),
      value,
      tone: orderStatusTone[key],
    })),
    paymentRows: orderedCounts(countBy(payments, (p) => p.status), paymentStatuses).map(({ key, value }) => ({
      key,
      label: label(key),
      value,
      tone: paymentStatusTone[key],
    })),
    topProducts: [...productMap.entries()]
      .map(([id, row]) => ({ id, ...row }))
      .sort((a, b) => b.valueInPaise - a.valueInPaise),
    coupons: [...s.coupons]
      .sort((a, b) => b.usageCount - a.usageCount)
      .map((c) => ({
        id: c.id,
        code: c.code,
        title: c.title,
        uses: c.usageCount,
        discountType: c.discountType,
        discountValue: c.discountValue,
        status: c.status,
      })),
  };
}

// ── Customers ───────────────────────────────────────────────────────────────

export function getCustomerReport(s: InsightsSnapshot, range: DateRange) {
  const consultations = filterByDateRange(s.consultations, consultationDate, range);
  const orders = filterByDateRange(s.orders, (o) => o.createdAt, range);
  const consultationCustomers = new Set(consultations.map((c) => c.customerId));
  const orderCustomers = new Set(orders.map((o) => o.customerId));

  let consultationOnly = 0;
  let storeOnly = 0;
  let both = 0;
  let none = 0;
  for (const customer of s.customers) {
    const hasConsultation = consultationCustomers.has(customer.id);
    const hasOrder = orderCustomers.has(customer.id);
    if (hasConsultation && hasOrder) both += 1;
    else if (hasConsultation) consultationOnly += 1;
    else if (hasOrder) storeOnly += 1;
    else none += 1;
  }

  const rows = s.customers
    .map((customer) => {
      const mineOrders = orders.filter((o) => o.customerId === customer.id);
      return {
        id: customer.id,
        name: customer.name ?? customer.id,
        consultations: consultations.filter((c) => c.customerId === customer.id).length,
        orders: mineOrders.length,
        orderValueInPaise: sumBy(mineOrders, (o) => o.totalInPaise),
      };
    })
    .filter((row) => row.consultations > 0 || row.orders > 0)
    .sort((a, b) => b.orderValueInPaise - a.orderValueInPaise || b.consultations - a.consultations);

  return {
    total: s.customers.length,
    newInRange: filterByDateRange(s.customers, (c) => c.createdAt, range).length,
    newSeries: dailyCountSeries(s.customers, (c) => c.createdAt, range, "newCustomers"),
    withConsultations: consultationCustomers.size,
    withOrders: orderCustomers.size,
    both,
    segmentRows: [
      { key: "consultation-only", label: "Consultation only", value: consultationOnly, tone: "violet" as const },
      { key: "store-only", label: "Store only", value: storeOnly, tone: "orange" as const },
      { key: "both", label: "Both", value: both, tone: "green" as const },
      { key: "none", label: "No activity", value: none, tone: "neutral" as const },
    ],
    rows,
  };
}

// ── Content ─────────────────────────────────────────────────────────────────

export function getContentReport(s: InsightsSnapshot, range: DateRange) {
  const readiness = getContentReadiness(s);
  const reviewsInRange = filterByDateRange(s.reviews, (r) => r.createdAt, range);
  const reviewCounts = countBy(s.reviews, (r) => r.status);
  const publishedInRange = filterByDateRange(
    s.articles.filter((a) => a.status === "published"),
    (a) => a.publishedAt,
    range,
  ).length;

  const tableRows = [
    { id: "articles", type: "Articles", total: readiness.articles.total, ready: readiness.articles.published, detail: `${readiness.articles.scheduled} scheduled · ${readiness.articles.draft} draft` },
    {
      id: "horoscopes",
      type: "Daily horoscopes",
      total: readiness.horoscopes.total,
      ready: readiness.horoscopes.published,
      detail: readiness.horoscopes.date ? `Latest set: ${readiness.horoscopes.date}` : "No daily entries",
    },
    { id: "reviews", type: "Reviews", total: s.reviews.length, ready: reviewCounts.approved ?? 0, detail: `${reviewCounts.pending ?? 0} pending · ${reviewCounts.reported ?? 0} reported · ${reviewCounts.rejected ?? 0} rejected` },
    { id: "poojas", type: "Poojas", total: readiness.poojas.total, ready: readiness.poojas.ready, detail: "Content fully complete" },
    { id: "astrologers", type: "Astrologers", total: readiness.astrologers.total, ready: readiness.astrologers.ready, detail: "Profile fully complete" },
    { id: "calculators", type: "Calculators", total: readiness.calculators.total, ready: readiness.calculators.partial, detail: `${readiness.calculators.partial} partial · ${readiness.calculators.catalogOnly} catalog only` },
  ];

  const horoscopeCounts = countBy(s.horoscopes, (h) => h.status);
  const statusBars = [
    {
      type: "Articles",
      live: readiness.articles.published,
      inProgress: readiness.articles.scheduled,
      other: readiness.articles.total - readiness.articles.published - readiness.articles.scheduled,
    },
    {
      type: "Reviews",
      live: reviewCounts.approved ?? 0,
      inProgress: reviewCounts.pending ?? 0,
      other: (reviewCounts.reported ?? 0) + (reviewCounts.rejected ?? 0),
    },
    {
      type: "Horoscopes",
      live: horoscopeCounts.published ?? 0,
      inProgress: 0,
      other: horoscopeCounts.draft ?? 0,
    },
  ];

  return {
    readiness,
    statusBars,
    publishedInRange,
    reviewsInRange: reviewsInRange.length,
    pendingReviews: reviewCounts.pending ?? 0,
    reportedReviews: reviewCounts.reported ?? 0,
    tableRows,
  };
}

// ── Overview ────────────────────────────────────────────────────────────────

export function getOverviewReport(s: InsightsSnapshot, range: DateRange) {
  const consultations = getConsultationReport(s, range, { mode: "all", status: "all", astrologerId: "all" });
  const commerce = getCommerceReport(s, range, { orderStatus: "all", paymentStatus: "all" });
  const customers = getCustomerReport(s, range);
  const content = getContentReport(s, range);
  const tickets = filterByDateRange(s.tickets, (t) => t.createdAt, range);

  return {
    consultations,
    commerce,
    customers,
    content,
    activitySeries: getActivitySeries(s, range),
    tickets: { total: tickets.length, open: tickets.filter((t) => t.status === "open").length },
  };
}
