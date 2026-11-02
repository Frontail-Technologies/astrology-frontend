import type { AdminListState } from "@/features/admin/data/admin-list-state";
import { createAdminQueryKeys } from "@/features/admin/data/query-keys";
import type { ArticleListFilter } from "../state/article-list-state";

const keys = createAdminQueryKeys("articles");

export const articleKeys = {
  ...keys,
  list: (state: AdminListState<ArticleListFilter, never>) => keys.list(state),
  /** Active master-data tags for the editor and the tag filter. */
  tags: () => keys.scoped("tags"),
};
