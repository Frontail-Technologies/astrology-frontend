import type { FaqCategory } from "../types/faq-admin.ts";

/** Help sections in the customer app (backend enum `faq_category`). */
export const faqCategoryLabels: Record<FaqCategory, string> = {
  consultations: "Consultations",
  wallet: "Wallet",
  orders: "Orders",
  poojas: "Poojas",
  account: "Account",
};

export const faqVisibilityLabels = { true: "Shown in the app", false: "Hidden" } as const;

/** Server limits (`api/src/modules/discovery/discovery.routes.ts`). */
export const FAQ_LIMITS = { question: [5, 240], answer: [5, 5_000], sortOrder: 10_000 } as const;
