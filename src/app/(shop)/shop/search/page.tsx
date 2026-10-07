import type { Metadata } from "next";
import { Suspense } from "react";

import { ShopSearchView } from "@/features/storefront/components/shop-search-view";

export const metadata: Metadata = {
  title: "Search | Astrology Store",
  description: "Search rudraksha, gemstones and sacred essentials in the Astrology Store.",
};

export default function ShopSearchPage() {
  return (
    <Suspense fallback={null}>
      <ShopSearchView />
    </Suspense>
  );
}
