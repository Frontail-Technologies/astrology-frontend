export type ArticleStatus = "draft" | "scheduled" | "published" | "archived";

export type Article = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  heroImage?: string;
  category: string;
  tags: string[];
  author?: string;
  status: ArticleStatus;
  publishedAt?: string;
  scheduledAt?: string;
  createdAt: string;
  updatedAt: string;
};
