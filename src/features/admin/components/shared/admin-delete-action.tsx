"use client";

import type { ReactNode } from "react";
import { Trash2 } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { useAdminDelete, type UseAdminDeleteOptions } from "@/features/admin/data/use-admin-delete";

import { AdminConfirmDialog } from "./admin-confirm-dialog";

/**
 * Delete button + confirmation dialog for one record. Server errors, including 409 conflicts such as "This
 * category is in use by 3 products", render inline in the dialog; on success it removes/invalidates caches,
 * toasts and optionally redirects (see `useAdminDelete`).
 *
 * ```tsx
 * <AdminDeleteAction id={tag.id} entityLabel="tag" mutationFn={deleteTag} invalidate={[tagKeys.all]}
 *   remove={(id) => [tagKeys.detail(id)]} redirectTo="/admin/master-data/tags" />
 * ```
 */
export function AdminDeleteAction<TId = string, TResult = unknown>({
  id,
  entityLabel,
  title,
  description,
  confirmLabel = "Delete",
  triggerLabel = "Delete",
  triggerVariant = "outline",
  triggerSize = "sm",
  triggerClassName,
  icon = <Trash2 aria-hidden="true" />,
  disabled = false,
  successMessage,
  ...options
}: Omit<UseAdminDeleteOptions<TId, TResult>, "successMessage"> & {
  id: TId;
  /** Lower-case noun used in the default copy ("Delete tag?"). */
  entityLabel: string;
  title?: string;
  description?: string;
  confirmLabel?: string;
  triggerLabel?: string;
  triggerVariant?: ButtonProps["variant"];
  triggerSize?: ButtonProps["size"];
  triggerClassName?: string;
  icon?: ReactNode;
  disabled?: boolean;
  /** Defaults to "<Entity> deleted"; pass `""` for no toast. */
  successMessage?: UseAdminDeleteOptions<TId, TResult>["successMessage"];
}) {
  const label = entityLabel.charAt(0).toUpperCase() + entityLabel.slice(1);
  const del = useAdminDelete<TId, TResult>({ ...options, successMessage: successMessage ?? `${label} deleted` });
  return (
    <>
      <Button type="button" variant={triggerVariant} size={triggerSize} className={triggerClassName} disabled={disabled} onClick={() => del.request(id)}>
        {icon}
        {triggerLabel}
      </Button>
      <AdminConfirmDialog
        {...del.dialogProps}
        title={title ?? `Delete ${entityLabel}?`}
        description={description ?? `This removes the ${entityLabel} from the admin panel and the public site. This cannot be undone here.`}
        confirmLabel={confirmLabel}
        destructive
        onConfirm={del.confirm}
      />
    </>
  );
}
