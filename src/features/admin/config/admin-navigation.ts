export const adminNavigation = [
  {
    label: "Overview",
    items: [{ href: "/admin", label: "Dashboard", icon: "dashboard" as const }],
  },
  {
    label: "Insights",
    items: [{ href: "/admin/reports", label: "Reports", icon: "reports" as const }],
  },
  {
    label: "People",
    items: [
      { href: "/admin/customers", label: "Customers", icon: "customers" as const },
      { href: "/admin/astrologers", label: "Astrologers", icon: "astrologers" as const },
    ],
  },
  {
    label: "Services",
    items: [
      { href: "/admin/consultations", label: "Consultations", icon: "consultations" as const },
      { href: "/admin/poojas", label: "Poojas", icon: "poojas" as const },
      { href: "/admin/calculators", label: "Calculators", icon: "calculators" as const },
    ],
  },
  {
    label: "Store",
    items: [
      { href: "/admin/store", label: "Overview", icon: "store" as const },
      { href: "/admin/store/products", label: "Products", icon: "products" as const },
      { href: "/admin/store/categories", label: "Categories", icon: "categories" as const },
      { href: "/admin/orders", label: "Orders", icon: "orders" as const },
    ],
  },
  {
    label: "Content",
    items: [
      { href: "/admin/horoscopes", label: "Horoscopes", icon: "horoscopes" as const },
      { href: "/admin/articles", label: "Articles", icon: "articles" as const },
      { href: "/admin/reviews", label: "Reviews", icon: "reviews" as const },
    ],
  },
  { label: "Communication", items: [{ href: "/admin/chats", label: "Chats", icon: "chats" as const }] },
  { label: "Support", items: [{ href: "/admin/support", label: "Support Tickets", icon: "support" as const }] },
  {
    label: "Marketing",
    items: [
      { href: "/admin/banners", label: "Banners", icon: "banners" as const },
      { href: "/admin/coupons", label: "Coupons", icon: "coupons" as const },
    ],
  },
  {
    label: "Finance",
    items: [{ href: "/admin/payments", label: "Payments", icon: "payments" as const }],
  },
  {
    label: "Master Data",
    items: [{ href: "/admin/master-data", label: "Master Data", icon: "masterData" as const }],
  },
  {
    label: "System",
    items: [
      { href: "/admin/notifications", label: "Notifications", icon: "notifications" as const },
      { href: "/admin/settings", label: "Settings", icon: "settings" as const },
    ],
  },
] as const;

export type AdminNavMatch = {
  group: (typeof adminNavigation)[number]["label"];
  href: string;
  label: string;
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
        best = { group: group.label, href: item.href, label: item.label };
      }
    }
  }
  return best;
}

export function getAdminPageTitle(match: AdminNavMatch | null) {
  if (!match) return "Admin";
  return match.label === "Overview" ? match.group : match.label;
}
