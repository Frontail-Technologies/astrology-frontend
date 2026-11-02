"use client";

import { useQuery } from "@tanstack/react-query";

import { shouldRetryAdminRead } from "@/features/admin/data/admin-errors";
import { useAdminDetail } from "@/features/admin/data/use-admin-detail";
import { useAdminList } from "@/features/admin/data/use-admin-list";
import { useAdminMutation } from "@/features/admin/data/use-admin-mutation";
import {
  createArticle,
  deleteArticle,
  getArticle,
  listActiveArticleTags,
  listArticles,
  updateArticle,
  updateArticleStatus,
} from "../api/article-admin-api";
import { articleKeys } from "../queries/article-query-keys";
import { articleListConfig } from "../state/article-list-state";
import type { ArticleInput, ArticleStatusInput } from "../types/article-admin";

export function useArticleList() {
  return useAdminList(articleListConfig, articleKeys.list, listArticles);
}

export function useArticleDetail(id: string) {
  return useAdminDetail(articleKeys.detail(id), (signal) => getArticle(id, signal), Boolean(id));
}

export function useCreateArticle() {
  return useAdminMutation({
    mutationFn: (input: ArticleInput) => createArticle(input),
    invalidate: [articleKeys.all],
    successMessage: "Article created as a draft",
    toastErrors: false,
  });
}

export function useUpdateArticle(id: string) {
  return useAdminMutation({
    mutationFn: (input: ArticleInput) => updateArticle(id, input),
    invalidate: [articleKeys.all],
    successMessage: "Article saved",
    toastErrors: false,
  });
}

export function useArticleStatusUpdate(id: string) {
  return useAdminMutation({
    mutationFn: (input: ArticleStatusInput) => updateArticleStatus(id, input),
    invalidate: [articleKeys.all],
    successMessage: "Article status updated",
    toastErrors: false,
  });
}

/** Options for `AdminDeleteAction` (views never import the API module). */
export const articleDeleteOptions = {
  mutationFn: deleteArticle,
  invalidate: [articleKeys.all],
  remove: (id: string) => [articleKeys.detail(id)],
};

/** Active master-data tags for the editor and the list's tag filter. */
export function useArticleTags() {
  return useQuery({ queryKey: articleKeys.tags(), queryFn: ({ signal }) => listActiveArticleTags(signal), staleTime: 60_000, retry: shouldRetryAdminRead });
}
