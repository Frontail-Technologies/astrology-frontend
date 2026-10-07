"use client";

import { useState } from "react";
import { ShoppingBag } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import type { StoreProduct } from "@/features/store/types/store";
import { useStoreCart } from "../cart/store-cart-provider";
import {
  getMaxQuantity,
  getProductAvailability,
  hasPurchasablePrice,
  isProductPurchasable,
} from "../selectors/storefront-products";
import { StoreQuantityControl } from "./store-quantity-control";

export function ProductPurchasePanel({ product }: { product: StoreProduct }) {
  const { addItem, getQuantity, setOpen, hydrated } = useStoreCart();
  const [quantity, setQuantity] = useState(1);

  const availability = getProductAvailability(product);
  const purchasable = isProductPurchasable(product);
  const max = getMaxQuantity(product);
  const inCart = hydrated ? getQuantity(product.id) : 0;
  const remaining = max === undefined ? undefined : Math.max(0, max - inCart);
  const atLimit = remaining !== undefined && remaining <= 0;
  const effectiveMax = remaining === undefined ? undefined : Math.max(1, remaining);
  const safeQuantity = effectiveMax === undefined ? quantity : Math.min(quantity, effectiveMax);

  // No price: there is nothing to buy, so no purchase controls at all.
  if (!hasPurchasablePrice(product)) {
    return <p className="rounded-lg bg-surface-muted px-3 py-2.5 text-sm text-muted-foreground">Ask an astrologer or contact us about this product.</p>;
  }

  // Coming soon or unavailable: no cart action.
  if (product.catalogStatus === "coming-soon" || product.catalogStatus === "unavailable") {
    return <p className="rounded-lg bg-surface-muted px-3 py-2.5 text-sm text-muted-foreground">{availability.label}. This product cannot be added to the cart yet.</p>;
  }

  const handleAdd = (): boolean => {
    const result = addItem(product.id, safeQuantity);
    if (result.status === "unavailable") {
      toast.error("This product can't be added right now");
      return false;
    }
    if (result.status === "at-limit") {
      toast.error("You already have the maximum available in your cart");
      return false;
    }
    if (!("clamped" in result)) return false;
    toast.success(result.status === "added" ? "Added to cart" : "Cart updated");
    if (result.clamped) toast.info(`Only ${result.quantity} available`);
    setQuantity(1);
    return true;
  };

  const disabled = !purchasable || atLimit;

  return (
    <div className="space-y-4">
      <div>
        <p className="mb-2 text-sm font-semibold text-foreground">Quantity</p>
        <StoreQuantityControl value={safeQuantity} onChange={setQuantity} max={effectiveMax} disabled={disabled} />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <Button variant="conversion" size="lg" disabled={disabled} onClick={handleAdd}>
          <ShoppingBag aria-hidden="true" />
          Add to cart
        </Button>
        <Button
          variant="outline"
          size="lg"
          disabled={disabled}
          className="border-conversion-500 bg-surface text-conversion-600 hover:bg-conversion-500/10 dark:text-conversion-500"
          onClick={() => {
            if (handleAdd()) setOpen(true);
          }}
        >
          Buy now
        </Button>
      </div>

      {!purchasable ? (
        <p className="text-sm text-muted-foreground">{availability.label}.</p>
      ) : atLimit ? (
        <p className="text-sm text-muted-foreground">You have the maximum available quantity in your cart.</p>
      ) : inCart > 0 ? (
        <p className="text-sm text-muted-foreground">{inCart} already in your cart.</p>
      ) : null}
    </div>
  );
}
