"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useQueryClient, type QueryKey } from "@tanstack/react-query";
import { toast } from "sonner";

import { useConfirmAction } from "@/features/admin/components/shared/use-confirm-action";

import { useAdminMutation } from "./use-admin-mutation";

export type UseAdminDeleteOptions<TId, TResult> = {
  /** Calls the domain's delete API (for example `(id) => deleteBanner(id)` from `<domain>/api`). */
  mutationFn: (id: TId) => Promise<TResult>;
  /** Keys invalidated after success (usually the domain's `keys.all`, plus cross-domain keys). */
  invalidate?: QueryKey[];
  /** Keys removed from the cache before redirecting (usually `keys.detail(id)`), so a mounted detail never refetches a 404. */
  remove?: (id: TId) => QueryKey[];
  /** Success toast; omit for none. */
  successMessage?: string | ((result: TResult, id: TId) => string);
  /** Navigates after success (for example back to the list from a detail page). */
  redirectTo?: string | ((id: TId) => string);
  onDeleted?: (result: TResult, id: TId) => void;
};

/**
 * Confirm-then-delete flow for Admin records. Errors (including 409 "in use" conflicts) stay inline in the
 * `AdminConfirmDialog` (`toastErrors: false`), the dialog blocks double-submit, and caches change only after the
 * server confirms: remove `remove(id)` keys, redirect, toast, then invalidate `invalidate`.
 *
 * ```tsx
 * const del = useAdminDelete({ mutationFn: deleteBanner, invalidate: [bannerKeys.all], remove: (id) => [bannerKeys.detail(id)], successMessage: "Banner deleted", redirectTo: "/admin/banners" });
 * <Button onClick={() => del.request(banner.id)}>Delete</Button>
 * <AdminConfirmDialog {...del.dialogProps} title="Delete banner?" description="…" confirmLabel="Delete" destructive onConfirm={del.confirm} />
 * ```
 * (`AdminDeleteAction` renders exactly this.)
 */
export function useAdminDelete<TId = string, TResult = unknown>(options: UseAdminDeleteOptions<TId, TResult>) {
  const { mutationFn, invalidate, remove, successMessage, redirectTo, onDeleted } = options;
  const router = useRouter();
  const queryClient = useQueryClient();
  const mutation = useAdminMutation<TId, TResult>({ mutationFn, toastErrors: false });
  const confirmAction = useConfirmAction<{ id: TId }>(mutation);
  const { target, close } = confirmAction;
  const { mutate } = mutation;

  const confirm = useCallback(() => {
    if (!target) return;
    const { id } = target;
    mutate(id, {
      onSuccess: (result) => {
        close();
        for (const queryKey of remove?.(id) ?? []) queryClient.removeQueries({ queryKey });
        if (redirectTo) router.push(typeof redirectTo === "function" ? redirectTo(id) : redirectTo);
        const message = typeof successMessage === "function" ? successMessage(result, id) : successMessage;
        if (message) toast.success(message);
        for (const queryKey of invalidate ?? []) void queryClient.invalidateQueries({ queryKey });
        onDeleted?.(result, id);
      },
    });
  }, [close, invalidate, mutate, onDeleted, queryClient, redirectTo, remove, router, successMessage, target]);

  return {
    /** Opens the confirm dialog for `id`. */
    request: (id: TId) => confirmAction.open({ id }),
    /** The id awaiting confirmation, or null. */
    pendingId: target?.id ?? null,
    /** Pass as `onConfirm` (the reason argument is ignored). */
    confirm,
    /** Spread on `AdminConfirmDialog` (`open`, `onOpenChange`, `pending`, `error`). */
    dialogProps: confirmAction.dialogProps,
    mutation,
  };
}
