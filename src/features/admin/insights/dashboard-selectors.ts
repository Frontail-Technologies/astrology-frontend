import { astrologers } from "@/features/astrologers/data/astrologers";
import { isLowStock } from "@/features/store/selectors/store-domain";
import { countBy, orderedCounts, sumBy } from "./aggregate";
import { consultationStatusTone, orderStatusTone, type InsightTone } from "./tones";
import type { InsightsSnapshot } from "./use-insights-data";

const capitalize = (value: string) => value[0].toUpperCase() + value.slice(1);
const plural = (n: number, one: string) => `${n} ${n === 1 ? one : `${one}s`}`;

export function isUpcomingConsultation(
  s: InsightsSnapshot,
  c: InsightsSnapshot["consultations"][number],
) {
  return (
    Boolean(c.scheduledAt) &&
    new Date(c.scheduledAt as string) > s.now &&
    (c.bookingStatus === "pending" || c.bookingStatus === "confirmed")
  );
}

export function getDashboardMetrics(s: InsightsSnapshot) {
  const activeTickets = s.tickets.filter((t) => t.status !== "resolved" && t.status !== "closed");
  const successfulPayments = s.payments.filter((p) => p.status === "success");
  return {
    customers: {
      total: s.customers.length,
      active: s.customers.filter((c) => c.accountStatus === "active").length,
    },
    consultations: {
      total: s.consultations.length,
      upcoming: s.consultations.filter((c) => isUpcomingConsultation(s, c)).length,
    },
    orders: {
      total: s.orders.length,
      processing: s.orders.filter((o) => o.fulfillmentStatus === "processing").length,
    },
    payments: {
      successVolumeInPaise: sumBy(successfulPayments, (p) => p.amountInPaise),
      successCount: successfulPayments.length,
      failed: s.payments.filter((p) => p.status === "failed").length,
      pending: s.payments.filter((p) => p.status === "pending").length,
    },
    products: {
      total: s.products.length,
      available: s.products.filter((p) => p.catalogStatus === "available").length,
    },
    support: {
      active: activeTickets.length,
      highPriority: activeTickets.filter((t) => t.priority === "high" || t.priority === "urgent").length,
    },
  };
}

export type AttentionItem = {
  id: string;
  label: string;
  count: number;
  href: string;
  tone: InsightTone;
};

export function getNeedsAttention(s: InsightsSnapshot): AttentionItem[] {
  const candidates: Array<Omit<AttentionItem, "label"> & { text: (n: number) => string }> = [
    {
      id: "failed-payments",
      count: s.payments.filter((p) => p.status === "failed").length,
      href: "/admin/payments",
      tone: "red",
      text: (n) => plural(n, "failed payment"),
    },
    {
      id: "reported-reviews",
      count: s.reviews.filter((r) => r.status === "reported").length,
      href: "/admin/reviews",
      tone: "red",
      text: (n) => plural(n, "reported review"),
    },
    {
      id: "open-tickets",
      count: s.tickets.filter((t) => t.status === "open").length,
      href: "/admin/support",
      tone: "amber",
      text: (n) => plural(n, "open support ticket"),
    },
    {
      id: "flagged-chats",
      count: s.conversations.filter((c) => c.status === "flagged").length,
      href: "/admin/chats",
      tone: "amber",
      text: (n) => plural(n, "flagged chat"),
    },
    {
      id: "pending-reviews",
      count: s.reviews.filter((r) => r.status === "pending").length,
      href: "/admin/reviews",
      tone: "amber",
      text: (n) => `${plural(n, "review")} awaiting moderation`,
    },
    {
      id: "pending-consultations",
      count: s.consultations.filter((c) => c.bookingStatus === "pending").length,
      href: "/admin/consultations",
      tone: "violet",
      text: (n) => `${plural(n, "consultation")} pending confirmation`,
    },
    {
      id: "pending-orders",
      count: s.orders.filter((o) => o.fulfillmentStatus === "pending").length,
      href: "/admin/orders",
      tone: "orange",
      text: (n) => `${plural(n, "order")} pending fulfilment`,
    },
    {
      id: "low-stock",
      count: s.products.filter(isLowStock).length,
      href: "/admin/store/products",
      tone: "orange",
      text: (n) => plural(n, "low-stock product"),
    },
  ];
  return candidates
    .filter((item) => item.count > 0)
    .map(({ text, ...item }) => ({ ...item, label: text(item.count) }));
}

export type ActivityKind = "order" | "consultation" | "payment" | "support" | "review";
export type ActivityEvent = {
  id: string;
  kind: ActivityKind;
  title: string;
  detail: string;
  at: string;
  href: string;
};

export function getRecentActivity(
  s: InsightsSnapshot,
  formatMoney: (paise: number) => string,
  limit = 8,
): ActivityEvent[] {
  const customerName = (id: string) => s.customers.find((c) => c.id === id)?.name ?? "a customer";
  const events: ActivityEvent[] = [
    ...s.orders.map((o) => ({
      id: `order-${o.id}`,
      kind: "order" as const,
      title: `Order ${o.id} placed by ${o.customerName}`,
      detail: `${formatMoney(o.totalInPaise)} · ${capitalize(o.fulfillmentStatus)}`,
      at: o.createdAt,
      href: `/admin/orders/${o.id}`,
    })),
    ...s.consultations.flatMap((c) => {
      const at = c.createdAt ?? c.scheduledAt;
      if (!at) return [];
      const astrologer = astrologers.find((a) => a.id === c.astrologerId)?.name ?? "an astrologer";
      return [
        {
          id: `consultation-${c.id}`,
          kind: "consultation" as const,
          title: `${c.mode} consultation booked by ${customerName(c.customerId)}`,
          detail: `with ${astrologer}${c.bookingStatus ? ` · ${capitalize(c.bookingStatus)}` : ""}`,
          at,
          href: `/admin/consultations/${c.id}`,
        },
      ];
    }),
    ...s.payments.map((p) => ({
      id: `payment-${p.id}`,
      kind: "payment" as const,
      title: `Payment from ${p.customerName}: ${p.status.replace("-", " ")}`,
      detail: `${formatMoney(p.amountInPaise)} · ${capitalize(p.type.replace("-", " "))}`,
      at: p.createdAt,
      href: `/admin/payments/${p.id}`,
    })),
    ...s.tickets.map((t) => ({
      id: `ticket-${t.id}`,
      kind: "support" as const,
      title: `Ticket ${t.id} from ${t.customerName}`,
      detail: `${t.subject} · ${capitalize(t.status.replace("-", " "))}`,
      at: t.createdAt,
      href: `/admin/support/${t.id}`,
    })),
    ...s.reviews.map((r) => ({
      id: `review-${r.id}`,
      kind: "review" as const,
      title: `${r.rating}-star review of ${r.targetName} by ${r.customerName}`,
      detail: capitalize(r.status),
      at: r.createdAt,
      href: `/admin/reviews/${r.id}`,
    })),
  ];
  return events.sort((a, b) => b.at.localeCompare(a.at)).slice(0, limit);
}

export function getOrderStatusRows(orders: InsightsSnapshot["orders"]) {
  const counts = countBy(orders, (o) => o.fulfillmentStatus);
  return orderedCounts(counts, [
    "pending",
    "processing",
    "shipped",
    "delivered",
    "cancelled",
    "returned",
  ] as const).map(({ key, value }) => ({
    key,
    label: capitalize(key),
    value,
    tone: orderStatusTone[key],
  }));
}

export function getConsultationStatusRows(consultations: InsightsSnapshot["consultations"]) {
  const counts = countBy(consultations, (c) => c.bookingStatus);
  return orderedCounts(counts, ["pending", "confirmed", "completed", "cancelled"] as const).map(
    ({ key, value }) => ({
      key,
      label: capitalize(key),
      value,
      tone: consultationStatusTone[key],
    }),
  );
}
