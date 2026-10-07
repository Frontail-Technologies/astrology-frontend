"use client";

import { ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { useStoreCart } from "../cart/store-cart-provider";

export function StoreCartButton() {
  const { itemCount, hydrated, setOpen } = useStoreCart();
  const count = hydrated ? itemCount : 0;

  return (
    <Button
      variant="ghost"
      className="relative h-10 min-h-10 gap-2 px-2.5"
      onClick={() => setOpen(true)}
      aria-label={count ? `Open cart, ${count} ${count === 1 ? "item" : "items"}` : "Open cart"}
    >
      <ShoppingBag aria-hidden="true" />
      <span className="hidden text-sm font-medium xl:inline">Cart</span>
      {count > 0 ? (
        <span className="absolute -right-0.5 top-0 grid min-w-5 place-items-center rounded-full bg-conversion-500 px-1 text-[11px] font-semibold leading-5 text-white dark:text-midnight-950">
          {count}
        </span>
      ) : null}
    </Button>
  );
}
