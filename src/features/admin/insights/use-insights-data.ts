"use client";

import { useEffect, useState } from "react";
import type { Article } from "@/features/articles/types/article";
import type { Conversation } from "@/features/chats/types/conversation";
import type { Consultation } from "@/features/consultations/types/consultation";
import type { Customer } from "@/features/customers/types/customer";
import type { HoroscopeEntry } from "@/features/horoscopes/types/horoscope";
import type { StoreOrder } from "@/features/orders/types/order";
import type { PaymentTransaction } from "@/features/payments/types/payment";
import type { Review } from "@/features/reviews/types/review";
import type { StoreProduct } from "@/features/store/types/store";
import type { SupportTicket } from "@/features/support/types/support-ticket";
import { useArticleRepository } from "@/features/articles/hooks/use-article-repository";
import { useConversationRepository } from "@/features/chats/hooks/use-conversation-repository";
import { useConsultationRepository } from "@/features/consultations/hooks/use-consultation-repository";
import { couponRepository } from "@/features/coupons/repositories/coupon-repository";
import type { Coupon } from "@/features/coupons/types/coupon";
import { useCustomerRepository } from "@/features/customers/hooks/use-customer-repository";
import { useHoroscopeRepository } from "@/features/horoscopes/hooks/use-horoscope-repository";
import { useOrderRepository } from "@/features/orders/hooks/use-order-repository";
import { usePaymentRepository } from "@/features/payments/hooks/use-payment-repository";
import { useReviewRepository } from "@/features/reviews/hooks/use-review-repository";
import { useProductRepository } from "@/features/store/hooks/use-product-repository";
import { useSupportTicketRepository } from "@/features/support/hooks/use-support-ticket-repository";

export type InsightsSnapshot = {
  now: Date;
  customers: Customer[];
  consultations: Consultation[];
  conversations: Conversation[];
  orders: StoreOrder[];
  payments: PaymentTransaction[];
  products: StoreProduct[];
  tickets: SupportTicket[];
  reviews: Review[];
  articles: Article[];
  horoscopes: HoroscopeEntry[];
  coupons: Coupon[];
};

/**
 * Gathers every repository the Dashboard and Reports aggregate over. `now` is
 * set after mount so server and client markup never disagree on the date.
 */
export function useInsightsData() {
  const customers = useCustomerRepository();
  const consultations = useConsultationRepository();
  const conversations = useConversationRepository();
  const orders = useOrderRepository();
  const payments = usePaymentRepository();
  const products = useProductRepository();
  const tickets = useSupportTicketRepository();
  const reviews = useReviewRepository();
  const articles = useArticleRepository();
  const horoscopes = useHoroscopeRepository();
  const [coupons, setCoupons] = useState<Coupon[] | null>(null);
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    void couponRepository.list().then(setCoupons);
  }, []);

  const ready =
    now !== null &&
    coupons !== null &&
    [customers, consultations, conversations, orders, payments, products, tickets, reviews, articles, horoscopes].every(
      (repository) => repository.ready,
    );

  const snapshot: InsightsSnapshot | null =
    ready && now
      ? {
          now,
          customers: customers.records,
          consultations: consultations.records,
          conversations: conversations.records,
          orders: orders.records,
          payments: payments.records,
          products: products.records,
          tickets: tickets.records,
          reviews: reviews.records,
          articles: articles.records,
          horoscopes: horoscopes.records,
          coupons: coupons ?? [],
        }
      : null;

  return { ready, snapshot };
}
