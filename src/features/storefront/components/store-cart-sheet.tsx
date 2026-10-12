"use client";

import Link from "next/link";
import { ShoppingBag, X } from "lucide-react";
import { toast } from "sonner";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetDescription, SheetFooter, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { formatStorePrice, getProductPrimaryImage } from "@/features/store/selectors/store-domain";
import { useStoreCart, type CartLine } from "../cart/store-cart-provider";
import { StoreImage } from "./store-image";
import { StoreQuantityControl } from "./store-quantity-control";

function CartLineRow({ line, onNavigate }: { line: CartLine; onNavigate: () => void }) {
  const { updateQuantity, removeItem } = useStoreCart();
  const product = line.product;
  const image = product ? getProductPrimaryImage(product) : undefined;
  const unavailable = line.status === "unavailable";
  const name = product?.name ?? "Unavailable product";

  return (
    <li className="flex gap-3 py-4">
      <div className="size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-gradient-to-b from-surface-muted to-gold-300/15">
        <StoreImage src={image?.src} alt={image?.alt ?? name} className="size-full p-2" />
      </div>
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          {product ? (
            <Link href={`/shop/product/${product.slug}`} onClick={onNavigate} className="line-clamp-2 text-sm font-semibold leading-5 text-foreground hover:underline">
              {name}
            </Link>
          ) : (
            <p className="text-sm font-semibold text-foreground">{name}</p>
          )}
          <button
            type="button"
            onClick={() => {
              removeItem(line.productId);
              toast.success("Item removed");
            }}
            aria-label={`Remove ${name} from cart`}
            className="-mr-1 grid size-7 shrink-0 place-items-center rounded-md text-muted-foreground transition-colors hover:bg-surface-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
          >
            <X className="size-4" aria-hidden="true" />
          </button>
        </div>

        {unavailable ? (
          <p className="mt-1 text-xs font-medium text-red-700 dark:text-red-300">{line.unavailableReason}. Remove it to continue.</p>
        ) : (
          <p className="mt-0.5 text-xs text-muted-foreground">{formatStorePrice(line.unitPriceInPaise)} each</p>
        )}

        <div className="mt-2 flex items-center justify-between gap-3">
          <StoreQuantityControl
            compact
            value={line.quantity}
            max={line.maxQuantity}
            disabled={unavailable}
            label={`${name} quantity`}
            onChange={(next) => updateQuantity(line.productId, next)}
          />
          {!unavailable ? <span className="text-sm font-semibold tabular-nums text-foreground">{formatStorePrice(line.lineTotalInPaise)}</span> : null}
        </div>
      </div>
    </li>
  );
}

export function StoreCartSheet() {
  const { lines, itemCount, subtotalInPaise, isOpen, setOpen, clearCart } = useStoreCart();
  const close = () => setOpen(false);
  const hasUnavailableLines = lines.some((line) => line.status !== "ok");

  return (
    <Sheet open={isOpen} onOpenChange={setOpen}>
      <SheetContent side="right" className="flex w-full flex-col gap-0 p-0 sm:max-w-md">
        <SheetHeader className="border-b border-border p-4">
          <SheetTitle className="text-lg">Your cart</SheetTitle>
          <SheetDescription>
            {itemCount} {itemCount === 1 ? "item" : "items"}
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-3 p-8 text-center">
            <span className="grid size-14 place-items-center rounded-full bg-surface-muted text-muted-foreground">
              <ShoppingBag className="size-6" aria-hidden="true" />
            </span>
            <p className="text-base font-semibold text-foreground">Your cart is empty</p>
            <p className="text-sm text-muted-foreground">Add a product to see it here.</p>
            <Button asChild variant="conversion" className="mt-2" onClick={close}>
              <Link href="/shop/search">Continue shopping</Link>
            </Button>
          </div>
        ) : (
          <>
            <ul className="flex-1 divide-y divide-border overflow-y-auto px-4">
              {lines.map((line) => (
                <CartLineRow key={line.productId} line={line} onNavigate={close} />
              ))}
            </ul>
            <SheetFooter className="gap-3 border-t border-border p-4">
              <div className="flex items-baseline justify-between">
                <span className="text-sm font-medium text-foreground">Subtotal</span>
                <span className="text-xl font-semibold tabular-nums text-foreground">{formatStorePrice(subtotalInPaise)}</span>
              </div>
              {hasUnavailableLines ? (
                <p className="text-xs leading-5 text-destructive">Remove or adjust unavailable items before proceeding to checkout.</p>
              ) : null}
              {hasUnavailableLines ? (
                <Button variant="conversion" size="lg" disabled>
                  Proceed to checkout
                </Button>
              ) : (
                <Button asChild variant="conversion" size="lg" onClick={close}>
                  <Link href="/shop/checkout">Proceed to checkout</Link>
                </Button>
              )}
              <Button asChild variant="outline" size="sm" onClick={close}>
                <Link href="/shop/search">Continue shopping</Link>
              </Button>
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-muted-foreground">
                    Clear cart
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear your cart?</AlertDialogTitle>
                    <AlertDialogDescription>All items will be removed from your cart.</AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Keep items</AlertDialogCancel>
                    <AlertDialogAction
                      onClick={() => {
                        clearCart();
                        toast.success("Cart cleared");
                      }}
                    >
                      Clear cart
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
