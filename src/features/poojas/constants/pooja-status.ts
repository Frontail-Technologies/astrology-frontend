import type { PoojaStatus } from "../types/pooja-admin.ts";

export const poojaStatuses = ["draft", "published", "suspended"] as const satisfies readonly PoojaStatus[];

export const poojaStatusLabels: Record<PoojaStatus, string> = { draft: "Draft", published: "Published", suspended: "Suspended" };
export const poojaStatusVariants: Record<PoojaStatus, "muted" | "online" | "unavailable"> = { draft: "muted", published: "online", suspended: "unavailable" };
export const poojaStatusDescriptions: Record<PoojaStatus, string> = {
  draft: "Hidden from the public site while it is being prepared.",
  published: "Listed on the public site and open for requests.",
  suspended: "Removed from the public site; existing requests are unaffected.",
};

export const poojaFeaturedLabels = { true: "Featured", false: "Not featured" } as const;

export const POOJA_LIMITS = {
  maxCategories: 10,
  maxDurationMinutes: 1440,
  maxContentItems: 30,
  maxRelatedSlugs: 20,
} as const;
