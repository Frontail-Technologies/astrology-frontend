import type { Metadata } from "next";
import { StoreOrderConfirmationView } from "@/features/storefront/components/store-order-confirmation-view";

export const metadata: Metadata = { title: "Order received | Astrology Store" };

export default async function OrderConfirmationPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  return <StoreOrderConfirmationView id={id} />;
}
