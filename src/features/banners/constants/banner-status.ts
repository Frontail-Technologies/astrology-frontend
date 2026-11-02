import type { BannerDateState, BannerLinkType, BannerStatus } from "../types/banner-admin.ts";

export const bannerStatuses = ["draft", "published", "archived"] as const satisfies readonly BannerStatus[];
export const bannerStatusLabels: Record<BannerStatus, string> = { draft: "Draft", published: "Published", archived: "Archived" };
export const bannerStatusVariants: Record<BannerStatus, "outline" | "online" | "muted"> = { draft: "outline", published: "online", archived: "muted" };
export const bannerStatusDescriptions: Record<BannerStatus, string> = {
  draft: "Hidden from the public site.",
  published: "Shown on the public site while inside its schedule window.",
  archived: "Hidden from the public site and kept for reference.",
};

/** Server `dateState` filter: `active` = published and inside its window; `current` = inside its window (any status). */
export const bannerDateStateLabels: Record<BannerDateState, string> = {
  active: "Live now (published, in window)",
  current: "In schedule window",
  upcoming: "Starts later",
  expired: "Ended",
};

export const bannerLinkTypeLabels: Record<BannerLinkType, string> = { none: "No link", internal: "Site page", external: "External URL" };

/** Mirrors the backend placement rule (`^[a-z][a-z0-9_]*$`, 2–80 characters). */
export const BANNER_PLACEMENT_PATTERN = /^[a-z][a-z0-9_]*$/;
export const BANNER_LIMITS = { title: 200, subtitle: 2_000, altText: 300, placement: [2, 80], link: 2_048, sortOrder: 100_000 } as const;
export const isBannerPlacementFilter = (value: string) => value.length >= BANNER_LIMITS.placement[0] && value.length <= BANNER_LIMITS.placement[1] && BANNER_PLACEMENT_PATTERN.test(value);

/**
 * Canonical banner placements (keys the public site reads). The API accepts any key matching
 * `BANNER_PLACEMENT_PATTERN`, so editors keep an "Other" escape for one-off placements.
 */
export const bannerPlacementLabels: Readonly<Record<string, string>> = {
  // Site-wide
  site_announcement: "Site-wide announcement bar",
  // Homepage
  homepage_hero: "Homepage hero",
  homepage_secondary: "Homepage secondary",
  homepage_bottom: "Homepage bottom",
  // Astrologers and consultations
  astrologers_top: "Astrologers list top",
  astrologer_profile: "Astrologer profile page",
  consultation_top: "Consultation page top",
  // Horoscope
  horoscope_top: "Horoscope page top",
  horoscope_sign: "Horoscope sign page",
  // Poojas
  pooja_top: "Pooja page top",
  pooja_detail: "Pooja detail page",
  // Store
  store_top: "Store page top",
  store_category: "Store category page",
  store_product: "Product page",
  order_confirmation: "Order confirmation page",
  // Calculators
  calculators_top: "Calculators page top",
  calculator_detail: "Calculator page",
  // Articles
  articles_top: "Articles page top",
  article_detail: "Article page",
};

/** Human label for a placement key; custom keys are shown as written. */
export const bannerPlacementLabel = (placement: string) => (Object.hasOwn(bannerPlacementLabels, placement) ? bannerPlacementLabels[placement]! : placement);

/** Placement filter options: the canonical set plus the current URL value when it is a custom key. */
export function bannerPlacementFilterOptions(current: string | undefined): Record<string, string> {
  if (!current || Object.hasOwn(bannerPlacementLabels, current)) return { ...bannerPlacementLabels };
  return { ...bannerPlacementLabels, [current]: current };
}
