"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type ReactNode } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { CreditCard, MapPin, PackageCheck, UserRound } from "lucide-react";
import { useForm, useWatch } from "react-hook-form";
import { toast } from "sonner";
import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Skeleton } from "@/components/ui/skeleton";
import { getProductPrimaryImage, formatStorePrice } from "@/features/store/selectors/store-domain";
import { useStoreCart } from "../cart/store-cart-provider";
import { checkoutSchema, indiaStates, type CheckoutValues } from "../orders/checkout-schema";
import { createStorefrontMockOrder } from "../orders/storefront-order-repository";
import { useStorefrontCatalog } from "../hooks/use-storefront-catalog";
import { getMaxQuantity, isProductPublic, isProductPurchasable } from "../selectors/storefront-products";
import { StoreBreadcrumb } from "./store-breadcrumb";
import { StoreImage } from "./store-image";

function FieldError({ message }: { message?: string }) {
  return message ? <p className="mt-1.5 text-xs font-medium text-destructive">{message}</p> : null;
}

function CheckoutSection({ icon, title, children }: { icon?: ReactNode; title: string; children: ReactNode }) {
  return <section className="overflow-hidden rounded-xl border border-border bg-surface shadow-[0_1px_2px_rgb(23_32_51_/_0.04)]"><div className="flex items-center gap-2.5 border-b border-border px-5 py-3.5"><span className="grid size-7 place-items-center rounded-md bg-conversion-500/8 text-conversion-600">{icon}</span><h2 className="font-display text-xl font-semibold text-foreground">{title}</h2></div><div className="p-5">{children}</div></section>;
}

function CheckoutSkeleton() {
  return <Container className="max-w-[1440px] py-7 sm:py-9"><Skeleton className="h-4 w-28" /><Skeleton className="mt-4 h-10 w-44" /><div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_25rem]"><Skeleton className="h-[600px] rounded-xl" /><Skeleton className="h-96 rounded-xl" /></div></Container>;
}

export function StoreCheckoutView() {
  const router = useRouter();
  const { lines, hydrated, removeItems } = useStoreCart();
  const catalog = useStorefrontCatalog();
  const [submitting, setSubmitting] = useState(false);
  const form = useForm<CheckoutValues>({ resolver: zodResolver(checkoutSchema), mode: "onChange", defaultValues: { country: "India", deliveryMethod: "standard", paymentMethod: "pending_integration" } });
  const selectedState = useWatch({ control: form.control, name: "state" });
  const invalidLines = lines.filter((line) => line.status !== "ok");
  const subtotalInPaise = lines.reduce((total, line) => total + line.lineTotalInPaise, 0);
  const cartReady = hydrated && catalog.ready;
  const canSubmit = cartReady && lines.length > 0 && invalidLines.length === 0 && form.formState.isValid && !submitting;
  const currentValidation = useMemo(() => {
    const productsById = new Map(catalog.allProducts.map((product) => [product.id, product]));
    return lines.map((line) => {
      const product = productsById.get(line.productId);
      const max = product ? getMaxQuantity(product) : undefined;
      const valid = Boolean(product && isProductPublic(product, catalog.allCategories) && isProductPurchasable(product) && line.quantity > 0 && (max === undefined || line.quantity <= max));
      return { line, product, valid };
    });
  }, [catalog.allCategories, catalog.allProducts, lines]);

  if (!cartReady) return <CheckoutSkeleton />;
  if (lines.length === 0) return <main><Container className="max-w-[1440px] py-7 sm:py-9"><StoreBreadcrumb items={[{ label: "Shop", href: "/shop" }, { label: "Checkout" }]} /><div className="mx-auto flex max-w-xl flex-col items-center py-18 text-center"><span className="grid size-14 place-items-center rounded-full bg-surface-muted text-conversion-600"><PackageCheck className="size-7" /></span><h1 className="mt-5 font-display text-3xl font-semibold">Your cart is empty</h1><p className="mt-3 text-sm leading-6 text-muted-foreground">Choose something from the store to begin your order request.</p><Button asChild variant="conversion" className="mt-6"><Link href="/shop/search">Continue shopping</Link></Button></div></Container></main>;

  const onSubmit = (values: CheckoutValues) => {
    if (currentValidation.some((item) => !item.valid)) { toast.error("Your cart changed. Review unavailable items before placing the order."); return; }
    setSubmitting(true);
    try {
      const items = currentValidation.map(({ line, product }) => { const unitPriceInPaise = product!.pricing.priceInPaise!; return { productId: product!.id, productNameSnapshot: product!.name, imageSrc: getProductPrimaryImage(product!)?.src, unitPriceInPaise, quantity: line.quantity, lineTotalInPaise: unitPriceInPaise * line.quantity }; });
      const totalInPaise = items.reduce((total, item) => total + item.lineTotalInPaise, 0);
      const order = createStorefrontMockOrder({ id: crypto.randomUUID(), orderNumber: `AST-${new Date().getFullYear()}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`, createdAt: new Date().toISOString(), status: "pending", paymentStatus: "pending", paymentMethod: values.paymentMethod, contact: { fullName: values.fullName.trim(), email: values.email.trim(), phone: values.phone.trim() }, shippingAddress: { addressLine1: values.addressLine1.trim(), addressLine2: values.addressLine2?.trim() || undefined, city: values.city.trim(), state: values.state, postalCode: values.postalCode, country: values.country }, deliveryMethod: values.deliveryMethod, items, subtotalInPaise: totalInPaise, discountInPaise: 0, shippingPaise: null, totalInPaise });
      removeItems(items.map((item) => item.productId));
      toast.success("Order request received");
      router.push(`/shop/order-confirmation/${order.id}`);
    } catch { toast.error("We could not save your order request. Please try again."); setSubmitting(false); }
  };

  return <main><Container className="max-w-[1440px] py-6 sm:py-8"><StoreBreadcrumb items={[{ label: "Shop", href: "/shop" }, { label: "Checkout" }]} /><header className="mt-4"><h1 className="font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">Checkout</h1><p className="mt-1.5 text-sm text-muted-foreground">Review your details and place your order request.</p></header><form onSubmit={form.handleSubmit(onSubmit)} className="mt-6 grid gap-6 xl:grid-cols-[minmax(0,1fr)_26rem]"><div className="space-y-4"><CheckoutSection icon={<UserRound className="size-4" />} title="Contact information"><div className="grid gap-3.5 sm:grid-cols-2"><div className="sm:col-span-2"><Label htmlFor="fullName">Full name</Label><Input id="fullName" className="mt-1.5 bg-surface" autoComplete="name" {...form.register("fullName")} aria-invalid={Boolean(form.formState.errors.fullName)} /><FieldError message={form.formState.errors.fullName?.message} /></div><div><Label htmlFor="email">Email</Label><Input id="email" type="email" className="mt-1.5 bg-surface" autoComplete="email" {...form.register("email")} aria-invalid={Boolean(form.formState.errors.email)} /><FieldError message={form.formState.errors.email?.message} /></div><div><Label htmlFor="phone">Phone number</Label><Input id="phone" type="tel" className="mt-1.5 bg-surface" autoComplete="tel" {...form.register("phone")} aria-invalid={Boolean(form.formState.errors.phone)} /><FieldError message={form.formState.errors.phone?.message} /></div></div></CheckoutSection><CheckoutSection icon={<MapPin className="size-4" />} title="Delivery address"><div className="grid gap-3.5 sm:grid-cols-2"><div className="sm:col-span-2"><Label htmlFor="addressLine1">Address line 1</Label><Input id="addressLine1" className="mt-1.5 bg-surface" autoComplete="address-line1" {...form.register("addressLine1")} aria-invalid={Boolean(form.formState.errors.addressLine1)} /><FieldError message={form.formState.errors.addressLine1?.message} /></div><div className="sm:col-span-2"><Label htmlFor="addressLine2">Address line 2 <span className="text-muted-foreground">(optional)</span></Label><Input id="addressLine2" className="mt-1.5 bg-surface" autoComplete="address-line2" {...form.register("addressLine2")} /></div><div><Label htmlFor="city">City</Label><Input id="city" className="mt-1.5 bg-surface" autoComplete="address-level2" {...form.register("city")} aria-invalid={Boolean(form.formState.errors.city)} /><FieldError message={form.formState.errors.city?.message} /></div><div><Label htmlFor="state">State</Label><Select value={selectedState} onValueChange={(value) => form.setValue("state", value, { shouldDirty: true, shouldValidate: true })}><SelectTrigger id="state" className="mt-1.5" aria-invalid={Boolean(form.formState.errors.state)}><SelectValue placeholder="Select state" /></SelectTrigger><SelectContent>{indiaStates.map((state) => <SelectItem key={state} value={state}>{state}</SelectItem>)}</SelectContent></Select><FieldError message={form.formState.errors.state?.message} /></div><div><Label htmlFor="postalCode">PIN code</Label><Input id="postalCode" inputMode="numeric" className="mt-1.5 bg-surface" autoComplete="postal-code" {...form.register("postalCode")} aria-invalid={Boolean(form.formState.errors.postalCode)} /><FieldError message={form.formState.errors.postalCode?.message} /></div><div><Label htmlFor="country">Country</Label><Input id="country" className="mt-1.5 bg-surface-muted/55 text-muted-foreground" readOnly {...form.register("country")} /></div></div></CheckoutSection><CheckoutSection title="Delivery method"><label className="flex cursor-pointer items-start gap-3 rounded-lg border border-conversion-500/25 bg-conversion-500/4 px-4 py-3.5"><input type="radio" value="standard" className="mt-0.5 accent-conversion-500" {...form.register("deliveryMethod")} /><span><span className="block text-sm font-semibold">Standard delivery</span><span className="mt-0.5 block text-sm leading-5 text-muted-foreground">Delivery timing and charges will be confirmed during fulfilment.</span></span></label></CheckoutSection><CheckoutSection icon={<CreditCard className="size-4" />} title="Payment"><div className="flex gap-3 rounded-lg border border-border bg-surface-muted/35 px-4 py-3.5"><CreditCard className="mt-0.5 size-4 shrink-0 text-muted-foreground" /><p className="text-sm leading-5 text-muted-foreground"><span className="font-medium text-foreground">Payment is not collected here.</span><br />Your order request is saved on this device.</p></div></CheckoutSection></div><aside className="xl:sticky xl:top-24 xl:self-start"><Card className="overflow-hidden border-foreground/12 shadow-[0_10px_25px_rgb(23_32_51_/_0.06)]"><div className="border-b border-border bg-surface-muted/45 px-5 py-4"><h2 className="font-display text-2xl font-semibold">Order summary</h2></div><CardContent className="p-5"><ul className="divide-y divide-border">{lines.map((line) => { const product = line.product; return <li key={line.productId} className="flex gap-3 py-3.5 first:pt-0"><div className="size-15 shrink-0 overflow-hidden rounded-lg border border-border bg-surface-muted"><StoreImage src={product ? getProductPrimaryImage(product)?.src : undefined} alt={product?.name ?? "Unavailable product"} className="size-full p-1.5" /></div><div className="min-w-0 flex-1"><p className="line-clamp-2 text-sm font-semibold leading-5">{product?.name ?? "Unavailable product"}</p><p className="mt-0.5 text-xs text-muted-foreground">Qty {line.quantity}</p>{line.status !== "ok" ? <p className="mt-1 text-xs font-medium text-destructive">{line.unavailableReason}. Remove or adjust in cart.</p> : null}</div>{line.status === "ok" ? <p className="shrink-0 text-sm font-semibold tabular-nums">{formatStorePrice(line.lineTotalInPaise)}</p> : null}</li>; })}</ul>{invalidLines.length ? <div className="mt-4 rounded-lg border border-destructive/25 bg-destructive/5 p-3 text-sm text-destructive">Unavailable items must be removed or adjusted before this order can be placed.</div> : null}<div className="mt-4 space-y-2.5 border-t-2 border-foreground/10 pt-4 text-sm"><div className="flex justify-between"><span className="text-muted-foreground">Subtotal</span><span className="tabular-nums">{formatStorePrice(subtotalInPaise)}</span></div><div className="flex justify-between"><span className="text-muted-foreground">Shipping</span><span className="font-medium">To be confirmed</span></div><div className="flex justify-between pt-2 text-base font-semibold"><span>Product total</span><span className="tabular-nums">{formatStorePrice(subtotalInPaise)}</span></div></div><Button type="submit" variant="conversion" size="lg" className="mt-5 w-full disabled:bg-muted disabled:text-muted-foreground disabled:opacity-100" disabled={!canSubmit}>{submitting ? "Placing order request..." : "Place order request"}</Button><p className="mt-3 text-center text-xs leading-5 text-muted-foreground">Payment and delivery details will be confirmed separately.</p></CardContent></Card></aside></form></Container></main>;
}
