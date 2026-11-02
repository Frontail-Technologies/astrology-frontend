"use client";

import type { ReactNode } from "react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { ADMIN_REASON } from "@/features/admin/data/admin-reason";
import { buildTransitionActions, type AdminTransitionConfig } from "@/features/admin/data/admin-transitions";
import type { AdminError } from "@/features/admin/data/admin-errors";
import { cn } from "@/lib/utils";

import { AdminConfirmDialog, type AdminReasonRequirement } from "./admin-confirm-dialog";
import { useConfirmAction } from "./use-confirm-action";

/**
 * Buttons for the server-provided `allowedTransitions` (never a client-side state machine), each confirmed in
 * `AdminConfirmDialog`. The dialog stays open until the mutation settles and shows server errors inline (create
 * the mutation with `toastErrors: false`). `[]` renders `finalStateText`.
 *
 * - `onConfirm(target, reason, close)`: call the mutation and pass `close` as its `onSuccess`.
 * - `requiresReason` (in the config) adds the audited reason textarea (`reason` overrides `ADMIN_REASON`).
 * - `children(target)` renders extra fields in the dialog (for example a schedule time); keep their state in the
 *   parent and use `isConfirmDisabled(target)` until they are valid.
 *
 * ```tsx
 * const update = useUpdatePoojaRequestStatus(id); // useAdminMutation({ ..., toastErrors: false })
 * <AdminTransitionActions allowed={request.allowedTransitions} labels={{ confirmed: "Confirm", cancelled: "Cancel request" }}
 *   variants={{ cancelled: "destructive" }} requiresReason={["cancelled"]} mutation={update}
 *   onConfirm={(status, reason, close) => update.mutate({ status, reason }, { onSuccess: close })} />
 * ```
 */
export function AdminTransitionActions<S extends string>({
  allowed,
  mutation,
  onConfirm,
  confirmTitle,
  reason = ADMIN_REASON,
  finalStateText = "This is a final state. No further status changes are available.",
  children,
  isConfirmDisabled,
  disabled = false,
  size = "sm",
  className,
  ...config
}: AdminTransitionConfig<S> & {
  allowed: readonly S[] | null | undefined;
  mutation: { isPending: boolean; error: AdminError | null; reset: () => void };
  onConfirm: (target: S, reason: string | undefined, close: () => void) => void;
  /** Dialog title per target (default "<label>?"). */
  confirmTitle?: (target: S, label: string) => string;
  reason?: AdminReasonRequirement;
  finalStateText?: ReactNode;
  children?: (target: S) => ReactNode;
  isConfirmDisabled?: (target: S) => boolean;
  disabled?: boolean;
  size?: ButtonProps["size"];
  className?: string;
}) {
  const confirm = useConfirmAction<S>(mutation);
  const actions = buildTransitionActions(allowed, config);
  const active = actions.find((action) => action.target === confirm.target) ?? null;

  if (!actions.length) {
    return <p className={cn("text-sm text-muted-foreground", className)}>{finalStateText}</p>;
  }

  return (
    <>
      <div className={cn("flex flex-wrap gap-2", className)}>
        {actions.map((action) => (
          <Button
            key={action.target}
            type="button"
            size={size}
            variant={action.variant}
            disabled={disabled || mutation.isPending}
            onClick={() => confirm.open(action.target)}
          >
            {action.label}
          </Button>
        ))}
      </div>
      <AdminConfirmDialog
        {...confirm.dialogProps}
        // Remount per target so the reason text never carries over between actions.
        key={active?.target ?? "closed"}
        title={active ? (confirmTitle?.(active.target, active.label) ?? `${active.label}?`) : ""}
        description={active?.description ?? "The status change is recorded in the audit log."}
        confirmLabel={active?.label ?? "Confirm"}
        destructive={active?.variant === "destructive"}
        reason={active?.requiresReason ? reason : undefined}
        confirmDisabled={active ? Boolean(isConfirmDisabled?.(active.target)) : true}
        onConfirm={(text) => {
          if (active) onConfirm(active.target, text, confirm.close);
        }}
      >
        {active && children ? children(active.target) : null}
      </AdminConfirmDialog>
    </>
  );
}
