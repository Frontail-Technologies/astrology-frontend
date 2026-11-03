/** Admin shapes for `/admin/faqs` (help answers shown in the customer app). */
export type FaqCategory = "consultations" | "wallet" | "orders" | "poojas" | "account";

export type ManagedFaq = {
  id: string;
  category: FaqCategory;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
  createdAt: string;
  updatedAt: string;
};

/** Create and `PATCH /:id` body. */
export type FaqInput = {
  category: FaqCategory;
  question: string;
  answer: string;
  sortOrder: number;
  active: boolean;
};
