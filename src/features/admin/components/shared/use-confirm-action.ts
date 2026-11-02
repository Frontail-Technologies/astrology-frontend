"use client";

import { useCallback, useState } from "react";

import type { AdminError } from "@/features/admin/data/admin-errors";

type ConfirmableMutation = { isPending: boolean; error: AdminError | null; reset: () => void };

/**
 * State for "pick an action, then confirm it in `AdminConfirmDialog`". `open(target)` shows the dialog; closing it
 * clears the target and resets the mutation (so a stale error never shows on the next open); pass `close` as the
 * mutation's `onSuccess` to close after the server confirms.
 *
 * `<AdminConfirmDialog {...confirm.dialogProps} title=… onConfirm={() => mutation.mutate(x, { onSuccess: confirm.close })} />`
 */
export function useConfirmAction<T>(mutation: ConfirmableMutation) {
  const [target, setTarget] = useState<T | null>(null);
  const { reset } = mutation;
  const close = useCallback(() => setTarget(null), []);
  const onOpenChange = useCallback(
    (open: boolean) => {
      if (!open) {
        setTarget(null);
        reset();
      }
    },
    [reset],
  );
  return {
    target,
    open: setTarget as (target: T) => void,
    close,
    dialogProps: { open: target !== null, onOpenChange, pending: mutation.isPending, error: mutation.error },
  };
}
