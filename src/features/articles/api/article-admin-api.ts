import { adminGet, adminList, adminSend, encodeId } from "@/features/admin/data/admin-api";
import type { ArticleInput, ArticleStatusInput, ArticleTagOption, ManagedArticle } from "../types/article-admin";

export function listArticles(query: Record<string, string | number>, signal?: AbortSignal) {
  return adminList<ManagedArticle>("/articles", query, signal);
}

export function getArticle(id: string, signal?: AbortSignal) {
  return adminGet<ManagedArticle>(`/articles/${encodeId(id)}`, { signal });
}

/** New articles start as drafts; publishing and scheduling go through `updateArticleStatus`. */
export function createArticle(input: ArticleInput) {
  return adminSend<ManagedArticle>("/articles", "POST", input);
}

export function updateArticle(id: string, input: ArticleInput) {
  return adminSend<ManagedArticle>(`/articles/${encodeId(id)}`, "PATCH", input);
}

/** `scheduledAt` is required for `scheduled`; the server rejects targets outside `allowedTransitions`. */
export function updateArticleStatus(id: string, input: ArticleStatusInput) {
  return adminSend<ManagedArticle>(`/articles/${encodeId(id)}/status`, "PATCH", input);
}

export function deleteArticle(id: string) {
  return adminSend<{ deleted: true }>(`/articles/${encodeId(id)}`, "DELETE");
}

/** Active master-data tags (admin list; there is no public tags endpoint). First 100 by the server order. */
export async function listActiveArticleTags(signal?: AbortSignal): Promise<ArticleTagOption[]> {
  const page = await adminList<ArticleTagOption>("/master-data/tags", { active: "true", page: 1, limit: 100 }, signal);
  return page.items.map(({ id, name, slug, active }) => ({ id, name, slug, active }));
}
