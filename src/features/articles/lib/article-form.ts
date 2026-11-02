import type { ArticleInput, ArticleTagOption, ArticleTagSummary, ManagedArticle } from "../types/article-admin.ts";

/** Article editor values. Optional text fields are `""` in the form and `null` in the API. */
export type ArticleFormValues = {
  title: string;
  excerpt: string;
  content: string;
  heroImageUrl: string | null;
  category: string;
  authorName: string;
  tagIds: string[];
};

export const emptyArticleForm: ArticleFormValues = { title: "", excerpt: "", content: "", heroImageUrl: null, category: "", authorName: "", tagIds: [] };

export function articleToFormValues(article: ManagedArticle): ArticleFormValues {
  return {
    title: article.title,
    excerpt: article.excerpt ?? "",
    content: article.content,
    heroImageUrl: article.heroImageUrl,
    category: article.category ?? "",
    authorName: article.authorName ?? "",
    tagIds: article.tags.map((tag) => tag.id),
  };
}

const textOrNull = (value: string) => {
  const trimmed = value.trim();
  return trimmed ? trimmed : null;
};

export function articleFormToInput(values: ArticleFormValues): ArticleInput {
  return {
    title: values.title.trim(),
    excerpt: textOrNull(values.excerpt),
    content: values.content.trim(),
    heroImageUrl: values.heroImageUrl,
    category: textOrNull(values.category),
    authorName: textOrNull(values.authorName),
    tagIds: [...new Set(values.tagIds)],
  };
}

/**
 * Tag choices for the editor: active master-data tags plus any tag already attached to the article that is no
 * longer in the active list (shown as inactive so the editor can remove it; the server rejects inactive tags).
 */
export function articleTagChoices(active: readonly ArticleTagOption[], attached: readonly ArticleTagSummary[]): Array<ArticleTagSummary & { active: boolean }> {
  const choices = active.filter((tag): tag is ArticleTagOption & { id: string } => Boolean(tag.id)).map((tag) => ({ id: tag.id, name: tag.name, slug: tag.slug, active: true }));
  const known = new Set(choices.map((tag) => tag.id));
  for (const tag of attached) if (!known.has(tag.id)) choices.push({ ...tag, active: false });
  return choices;
}

/** Splits stored article text into paragraphs (blank-line separated) for plain-text rendering; never HTML. */
export function articleParagraphs(content: string): string[] {
  return content
    .replace(/\r\n?/g, "\n")
    .split(/\n\s*\n/)
    .map((paragraph) => paragraph.trim())
    .filter(Boolean);
}

/** True when `iso` is a valid instant after `now` (a scheduled publish time must be in the future). */
export function isFutureInstant(iso: string | null, now: number = Date.now()): boolean {
  if (!iso) return false;
  const time = new Date(iso).getTime();
  return Number.isFinite(time) && time > now;
}
