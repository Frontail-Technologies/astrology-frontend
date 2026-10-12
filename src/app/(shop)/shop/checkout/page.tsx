import type { Metadata } from "next";
import { StoreCheckoutView } from "@/features/storefront/components/store-checkout-view";

export const metadata: Metadata = { title: "Checkout | Astrology Store" };

export default function CheckoutPage() { return <StoreCheckoutView />; }
