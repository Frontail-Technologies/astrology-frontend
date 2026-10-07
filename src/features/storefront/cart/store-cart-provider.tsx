"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";

import type { StoreProduct } from "@/features/store/types/store";
import { useStorefrontCatalog } from "../hooks/use-storefront-catalog";
import {
  getMaxQuantity,
  getProductAvailability,
  isProductPublic,
  isProductPurchasable,
} from "../selectors/storefront-products";

const CART_STORAGE_KEY = "astrology-store-cart-v1";

export type CartItem = { productId: string; quantity: number };

export type CartLine = {
  productId: string;
  quantity: number;
  product?: StoreProduct;
  /** "ok" lines count toward the subtotal; others are shown but cannot be purchased. */
  status: "ok" | "unavailable";
  unavailableReason?: string;
  unitPriceInPaise?: number;
  lineTotalInPaise: number;
  maxQuantity?: number;
};

export type AddResult =
  | { status: "added" | "updated"; quantity: number; clamped: boolean }
  | { status: "unavailable" | "at-limit" };

type CartContextValue = {
  lines: CartLine[];
  hydrated: boolean;
  itemCount: number;
  subtotalInPaise: number;
  isOpen: boolean;
  setOpen: (open: boolean) => void;
  getQuantity: (productId: string) => number;
  addItem: (productId: string, quantity: number) => AddResult;
  updateQuantity: (productId: string, quantity: number) => void;
  removeItem: (productId: string) => void;
  clearCart: () => void;
};

const CartContext = createContext<CartContextValue | null>(null);

const isCartItem = (value: unknown): value is CartItem =>
  typeof value === "object" &&
  value !== null &&
  typeof (value as CartItem).productId === "string" &&
  Number.isInteger((value as CartItem).quantity) &&
  (value as CartItem).quantity > 0;

export function StoreCartProvider({ children }: { children: ReactNode }) {
  const catalog = useStorefrontCatalog();
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const [isOpen, setOpen] = useState(false);

  // Server and first client render both start empty; storage is read after mount.
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(CART_STORAGE_KEY);
      const parsed: unknown = raw ? JSON.parse(raw) : [];
      if (Array.isArray(parsed)) setItems(parsed.filter(isCartItem));
    } catch {
      /* corrupt or blocked storage: start with an empty cart */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(items));
    } catch {
      /* storage unavailable: cart still works for this session */
    }
  }, [items, hydrated]);

  const productsById = useMemo(
    () => new Map(catalog.allProducts.map((product) => [product.id, product])),
    [catalog.allProducts],
  );

  // Clamp stored quantities to current stock once the catalog is loaded.
  useEffect(() => {
    if (!hydrated || !catalog.ready) return;
    setItems((current) => {
      let changed = false;
      const next = current.map((item) => {
        const product = productsById.get(item.productId);
        const max = product ? getMaxQuantity(product) : undefined;
        if (max !== undefined && max > 0 && item.quantity > max) {
          changed = true;
          return { ...item, quantity: max };
        }
        return item;
      });
      return changed ? next : current;
    });
  }, [hydrated, catalog.ready, productsById]);

  const lines = useMemo<CartLine[]>(
    () =>
      items.map((item) => {
        const product = productsById.get(item.productId);
        if (!product || !isProductPublic(product, catalog.allCategories)) {
          return { productId: item.productId, quantity: item.quantity, status: "unavailable", unavailableReason: "No longer available", lineTotalInPaise: 0 };
        }
        const unitPriceInPaise = product.pricing.priceInPaise;
        if (!isProductPurchasable(product) || unitPriceInPaise === undefined) {
          return {
            productId: item.productId,
            quantity: item.quantity,
            product,
            status: "unavailable",
            unavailableReason: getProductAvailability(product).purchasable ? "Price unavailable" : getProductAvailability(product).label,
            unitPriceInPaise,
            lineTotalInPaise: 0,
          };
        }
        return {
          productId: item.productId,
          quantity: item.quantity,
          product,
          status: "ok",
          unitPriceInPaise,
          lineTotalInPaise: unitPriceInPaise * item.quantity,
          maxQuantity: getMaxQuantity(product),
        };
      }),
    [items, productsById, catalog.allCategories],
  );

  const getQuantity = useCallback(
    (productId: string) => items.find((item) => item.productId === productId)?.quantity ?? 0,
    [items],
  );

  const addItem = useCallback(
    (productId: string, quantity: number): AddResult => {
      const product = productsById.get(productId);
      if (!product || !isProductPurchasable(product)) return { status: "unavailable" };
      const current = items.find((item) => item.productId === productId)?.quantity ?? 0;
      const max = getMaxQuantity(product);
      const target = current + Math.max(1, Math.floor(quantity));
      const clamped = max !== undefined && target > max;
      const next = clamped ? (max as number) : target;
      if (next <= current) return { status: "at-limit" };
      setItems((existing) =>
        current > 0
          ? existing.map((item) => (item.productId === productId ? { ...item, quantity: next } : item))
          : [...existing, { productId, quantity: next }],
      );
      return { status: current > 0 ? "updated" : "added", quantity: next, clamped };
    },
    [items, productsById],
  );

  const updateQuantity = useCallback(
    (productId: string, quantity: number) => {
      const product = productsById.get(productId);
      const max = product ? getMaxQuantity(product) : undefined;
      if (quantity <= 0) {
        setItems((existing) => existing.filter((item) => item.productId !== productId));
        return;
      }
      const next = max !== undefined ? Math.min(quantity, max) : quantity;
      setItems((existing) => existing.map((item) => (item.productId === productId ? { ...item, quantity: next } : item)));
    },
    [productsById],
  );

  const removeItem = useCallback(
    (productId: string) => setItems((existing) => existing.filter((item) => item.productId !== productId)),
    [],
  );
  const clearCart = useCallback(() => setItems([]), []);

  const value = useMemo<CartContextValue>(
    () => ({
      lines,
      hydrated,
      itemCount: items.reduce((sum, item) => sum + item.quantity, 0),
      subtotalInPaise: lines.reduce((sum, line) => sum + line.lineTotalInPaise, 0),
      isOpen,
      setOpen,
      getQuantity,
      addItem,
      updateQuantity,
      removeItem,
      clearCart,
    }),
    [lines, hydrated, items, isOpen, getQuantity, addItem, updateQuantity, removeItem, clearCart],
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useStoreCart() {
  const context = useContext(CartContext);
  if (!context) throw new Error("useStoreCart must be used within StoreCartProvider");
  return context;
}
