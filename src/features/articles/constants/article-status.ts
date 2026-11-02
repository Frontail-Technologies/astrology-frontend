import type { ArticleStatus } from "../types/article-admin.ts";

export const articleStatusLabels: Record<ArticleStatus, string> = { draft: "Draft", scheduled: "Scheduled", published: "Published", archived: "Archived" };
export const articleStatusVariants: Record<ArticleStatus, "outline" | "pending" | "online" | "muted"> = {
  draft: "outline",
  scheduled: "pending",
  published: "online",
  archived: "muted",
};

/** Button labels for the server-provided `allowedTransitions`. */
export const articleTransitionLabels: Record<ArticleStatus, string> = {
  published: "Publish now",
  scheduled: "Schedule",
  draft: "Move to draft",
  archived: "Archive",
};
export const articleTransitionDescriptions: Partial<Record<ArticleStatus, string>> = {
  published: "The article becomes visible on the public site immediately.",
  scheduled: "The article is hidden until the chosen time, then appears on the public site.",
  draft: "The article is removed from the public site and kept as a draft.",
  archived: "The article is removed from the public site and archived.",
};
export const articleTransitionOrder: readonly ArticleStatus[] = ["published", "scheduled", "draft", "archived"];

export const INVALID_ARTICLE_TRANSITION = "INVALID_ARTICLE_TRANSITION";

/** Field limits mirrored from the backend validation (`article.validation.ts`). */
export const ARTICLE_LIMITS = { title: [2, 240], excerpt: 1_000, content: 200_000, category: 120, authorName: 160, tags: 30 } as const;

const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
/** Valid list filter values (the server matches category exactly and tags by slug). */
export const isArticleCategoryFilter = (value: string) => value.trim() === value && value.length >= 1 && value.length <= ARTICLE_LIMITS.category;
export const isArticleTagFilter = (value: string) => value.length <= 140 && SLUG_PATTERN.test(value);

/**
 * Canonical article categories (the public articles page groups by these). The API stores category as free text
 * (≤120 characters), so editors keep an "Other" escape. Values are stored exactly as labelled.
 */
export const articleCategories = ["Astrology Guides", "Horoscope", "Relationships", "Remedies", "Spirituality", "Numerology"] as const;
export const articleCategoryOptions: Readonly<Record<string, string>> = Object.fromEntries(articleCategories.map((category) => [category, category]));

/** Category filter options: the canonical set plus the current URL value when it is a custom category. */
export function articleCategoryFilterOptions(current: string | undefined): Record<string, string> {
  if (!current || Object.hasOwn(articleCategoryOptions, current)) return { ...articleCategoryOptions };
  return { ...articleCategoryOptions, [current]: current };
}
