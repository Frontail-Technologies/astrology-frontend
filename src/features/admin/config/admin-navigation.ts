/**
 * Admin navigation: one source for the sidebar, the top bar title/subtitle and the quick-nav search.
 * `description` is the top-bar subtitle on the item's own (directory-level) page.
 */
export const adminNavigation = [
  {
    label: "Overview",
    items: [
      { href: "/admin", label: "Dashboard", icon: "dashboard" as const, description: "Today's activity and what needs a decision" },
      { href: "/admin/reports", label: "Reports", icon: "reports" as const, description: "Performance over a date range" },
    ],
  },
  {
    label: "People",
    items: [
      { href: "/admin/customers", label: "Customers", icon: "customers" as const, description: "Customer accounts and their activity" },
      { href: "/admin/astrologers", label: "Astrologers", icon: "astrologers" as const, description: "Profiles, verification and availability" },
    ],
  },
  {
    label: "Consultations",
    items: [
      { href: "/admin/consultations", label: "Consultations", icon: "consultations" as const, description: "Bookings from request to completion" },
      { href: "/admin/chats", label: "Chats", icon: "chats" as const, description: "Conversations and flagged chats" },
      { href: "/admin/chat-sessions", label: "Chat Sessions", icon: "chatSessions" as const, description: "Paid chat billing sessions" },
      { href: "/admin/reviews", label: "Reviews", icon: "reviews" as const, description: "Moderate customer reviews" },
    ],
  },
  {
    label: "Services",
    items: [
      { href: "/admin/poojas", label: "Poojas", icon: "poojas" as const, description: "Pooja catalogue and pricing" },
      { href: "/admin/pooja-requests", label: "Pooja Requests", icon: "poojaRequests" as const, description: "Customer pooja bookings" },
      { href: "/admin/calculators", label: "Calculators", icon: "calculators" as const, description: "Free astrology tools and their content" },
    ],
  },
  {
    label: "Store",
    items: [
      { href: "/admin/store", label: "Overview", icon: "store" as const, description: "Catalogue health at a glance" },
      { href: "/admin/store/products", label: "Products", icon: "products" as const, description: "Products, stock and publishing" },
      { href: "/admin/store/categories", label: "Categories", icon: "categories" as const, description: "How the store is organised" },
      { href: "/admin/orders", label: "Orders", icon: "orders" as const, description: "Fulfilment from payment to delivery" },
      { href: "/admin/coupons", label: "Coupons", icon: "coupons" as const, description: "Discount codes and redemptions" },
      { href: "/admin/product-reviews", label: "Product Reviews", icon: "productReviews" as const, description: "Reviews customers leave on delivered products" },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/horoscopes", label: "Horoscopes", icon: "horoscopes" as const, description: "Daily, weekly and monthly horoscopes" },
      { href: "/admin/articles", label: "Articles", icon: "articles" as const, description: "Editorial articles and publishing" },
      { href: "/admin/banners", label: "Banners", icon: "banners" as const, description: "Promotional banners across the site" },
      { href: "/admin/sign-compatibility", label: "Sign Compatibility", icon: "compatibility" as const, description: "Editorial compatibility for each pair of signs" },
      { href: "/admin/faqs", label: "FAQs", icon: "faqs" as const, description: "Help answers shown in the customer app" },
      { href: "/admin/master-data", label: "Master Data", icon: "masterData" as const, description: "Shared lists used across the platform" },
    ],
  },
  {
    label: "Finance",
    items: [
      { href: "/admin/payments", label: "Payments", icon: "payments" as const, description: "Payment attempts and refunds" },
      { href: "/admin/wallets", label: "Wallets", icon: "wallets" as const, description: "Customer wallet balances" },
      { href: "/admin/earnings", label: "Earnings", icon: "earnings" as const, description: "Astrologer earnings from paid chats" },
      { href: "/admin/payouts", label: "Payouts", icon: "payouts" as const, description: "Payouts to astrologers" },
    ],
  },
  {
    label: "Support & System",
    items: [
      { href: "/admin/support", label: "Support Tickets", icon: "support" as const, description: "Customer requests and replies" },
      { href: "/admin/notifications", label: "Notifications", icon: "notifications" as const, description: "Notification templates" },
      { href: "/admin/settings", label: "Settings", icon: "settings" as const, description: "Platform configuration" },
      { href: "/admin/audit-logs", label: "Audit Log", icon: "auditLogs" as const, description: "Every recorded admin action" },
    ],
  },
] as const;

export type AdminNavGroup = (typeof adminNavigation)[number];
export type AdminNavItem = AdminNavGroup["items"][number];
export type AdminNavIcon = AdminNavItem["icon"];

export type AdminNavMatch = {
  group: AdminNavGroup["label"];
  href: string;
  label: string;
  description: string;
};

/** Longest-prefix match so nested routes activate exactly one nav item. */
export function getActiveAdminNavItem(pathname: string): AdminNavMatch | null {
  let best: AdminNavMatch | null = null;
  for (const group of adminNavigation) {
    for (const item of group.items) {
      const matches =
        pathname === item.href ||
        (item.href !== "/admin" && pathname.startsWith(`${item.href}/`));
      if (matches && (!best || item.href.length > best.href.length)) {
        best = { group: group.label, href: item.href, label: item.label, description: item.description };
      }
    }
  }
  return best;
}

export function getAdminPageTitle(match: AdminNavMatch | null) {
  if (!match) return "Admin";
  return match.label === "Overview" ? match.group : match.label;
}

/**
 * Label for the page below a nav item (`/admin/customers/<id>` -> "Details", `/new` -> "New", `/edit` -> "Edit").
 * Returns null on the item's own page.
 */
export function getAdminSubpageLabel(pathname: string, match: AdminNavMatch | null): string | null {
  if (!match || pathname === match.href) return null;
  const rest = pathname.slice(match.href.length).split("/").filter(Boolean);
  const last = rest.at(-1);
  if (last === "new") return "New";
  if (last === "edit") return "Edit";
  // A readable slug directly under the item (for example `/admin/master-data/languages`) names a sub-list.
  if (rest.length === 1 && last && /^[a-z][a-z-]*$/.test(last)) {
    return last.replace(/-/g, " ").replace(/^./, (c) => c.toUpperCase());
  }
  return "Details";
}
