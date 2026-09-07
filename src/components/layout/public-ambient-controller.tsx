"use client";

import { usePathname } from "next/navigation";

import {
  PageAmbientBackdrop,
  type PageAmbientVariant,
} from "@/components/shared/page-ambient-backdrop";

/**
 * Route-aware mount point for the persistent page-level ambient backdrop.
 * Rendered once in the public layout; picks the ambient visual language from
 * the current public route. Tiny client component — pages stay server-rendered.
 */
function variantForPath(pathname: string): PageAmbientVariant {
  if (pathname === "/") return "homepage";
  if (pathname.startsWith("/pooja")) return "pooja";
  if (pathname.startsWith("/calculators")) return "calculator";
  if (
    pathname.startsWith("/astrologers") ||
    pathname.startsWith("/astrologer/")
  ) {
    return "astrologer";
  }
  return "astrology";
}

export function PublicAmbientController() {
  const pathname = usePathname();
  return <PageAmbientBackdrop variant={variantForPath(pathname)} />;
}
