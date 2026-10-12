"use client";

import { useEffect, useState } from "react";
import type { StorefrontMockOrder } from "./storefront-order";

export const STOREFRONT_ORDER_STORAGE_KEY = "astrology-store-orders-v1";

function readOrders(): StorefrontMockOrder[] {
  try {
    const raw = window.localStorage.getItem(STOREFRONT_ORDER_STORAGE_KEY);
    const parsed: unknown = raw ? JSON.parse(raw) : [];
    return Array.isArray(parsed) ? (parsed as StorefrontMockOrder[]) : [];
  } catch {
    return [];
  }
}

function saveOrders(orders: StorefrontMockOrder[]) {
  window.localStorage.setItem(STOREFRONT_ORDER_STORAGE_KEY, JSON.stringify(orders));
}

export function createStorefrontMockOrder(order: StorefrontMockOrder) {
  const orders = readOrders();
  saveOrders([order, ...orders]);
  return order;
}

export function useStorefrontMockOrder(id: string) {
  const [hydrated, setHydrated] = useState(false);
  const [order, setOrder] = useState<StorefrontMockOrder | null>(null);

  useEffect(() => {
    setOrder(readOrders().find((item) => item.id === id) ?? null);
    setHydrated(true);
  }, [id]);

  return { hydrated, order };
}
