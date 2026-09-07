import type { Metadata } from "next";

import { PoojaListingPage } from "@/features/pooja/components/pooja-listing-page";

export const metadata: Metadata = {
  title: "Online Pooja & Rituals | Astrology",
  description:
    "Explore guided Vedic Poojas and rituals with clear preparation details and a simple discovery experience.",
};

export default function PoojaPage() {
  return <PoojaListingPage />;
}
