import type { AdminListConfig } from "../../admin/data/admin-list-state.ts";
import { articleStatusLabels, isArticleCategoryFilter, isArticleTagFilter } from "../constants/article-status.ts";

export type ArticleListFilter = "status" | "category" | "tag";

export const articleListConfig: AdminListConfig<ArticleListFilter, never> = {
  defaultLimit: 20,
  maxLimit: 100,
  searchMaxLength: 240,
  filters: {
    status: Object.keys(articleStatusLabels),
    // Exact category match on the server (free text, no category catalog endpoint).
    category: isArticleCategoryFilter,
    // Master-data tag slug.
    tag: isArticleTagFilter,
  },
};
