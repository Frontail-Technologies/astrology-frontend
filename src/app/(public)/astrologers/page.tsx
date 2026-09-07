import type { Metadata } from "next";

import { AstrologersListingPage } from "@/features/astrologers/components/astrologers-listing-page";

export const metadata: Metadata = {
  title: "Astrologers | Astrology",
  description:
    "Browse astrologers by expertise, language and consultation availability.",
};

export default function AstrologersPage() {
  return <AstrologersListingPage />;
}
