/** Admin shapes for `/admin/articles`. Separate from the public-site `types/article.ts`. */
export type ArticleStatus = "draft" | "published" | "scheduled" | "archived";

export type ArticleTagSummary = { id: string; name: string; slug: string };

/** `GET /admin/articles` item and detail (backend `toAdminArticle`). */
export type ManagedArticle = {
  id: string;
  title: string;
  slug: string;
  excerpt: string | null;
  content: string;
  heroImageUrl: string | null;
  category: string | null;
  authorName: string | null;
  status: ArticleStatus;
  publishedAt: string | null;
  scheduledAt: string | null;
  createdAt: string;
  updatedAt: string;
  tags: ArticleTagSummary[];
  allowedTransitions: ArticleStatus[];
};

/** Editable fields (create and `PATCH /:id`). The slug is server-generated; status changes use `/status`. */
export type ArticleInput = {
  title: string;
  excerpt: string | null;
  content: string;
  heroImageUrl: string | null;
  category: string | null;
  authorName: string | null;
  tagIds: string[];
};

export type ArticleStatusInput = { status: ArticleStatus; scheduledAt?: string; publishedAt?: string };

/** Admin master-data tag (`GET /admin/master-data/tags`), reduced to what the article editor needs. */
export type ArticleTagOption = { id: string | null; name: string; slug: string; active: boolean };
