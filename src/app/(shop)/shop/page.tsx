import type { Metadata } from "next";

import { StoreHome } from "@/features/storefront/components/store-home";

export const metadata: Metadata = {
  title: "Astrology Store | Rudraksha, Gemstones & Sacred Essentials",
  description:
    "Discover carefully selected rudraksha, gemstones and sacred essentials, described clearly so you can choose with confidence.",
};

export default function ShopPage() {
  return <StoreHome />;
}
