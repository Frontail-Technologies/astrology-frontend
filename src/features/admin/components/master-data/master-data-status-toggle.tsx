"use client";

import type { ReactNode } from "react";
import { Power, PowerOff } from "lucide-react";

import { Button, type ButtonProps } from "@/components/ui/button";
import { MASTER_DATA_ERROR_HINTS, masterDataMeta } from "@/features/master-data/constants/master-data-entities";
import { useMasterDataStatus } from "@/features/master-data/hooks/use-master-data-admin";
import type { MasterDataEntity } from "@/features/master-data/types/master-data-admin";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { useConfirmAction } from "../shared/use-confirm-action";

/**
 * Activate/deactivate through `PATCH /:key/status`, confirmed in a dialog that shows server errors inline (for example
 * `DEFAULT_LANGUAGE_REQUIRED` when deactivating the default language). Returns the trigger callback and the dialog so
 * the action can live in a button or in a row "⋯" menu.
 */
export function useMasterDataStatusConfirm({ entity, recordKey, name, active }: { entity: MasterDataEntity; recordKey: string; name: string; active: boolean }): {
  label: string;
  icon: typeof Power;
  pending: boolean;
  open: () => void;
  dialog: ReactNode;
} {
  const status = useMasterDataStatus(entity);
  const confirm = useConfirmAction<boolean>(status);
  const next = !active;
  const label = next ? "Activate" : "Deactivate";
  const hint = status.error?.code ? MASTER_DATA_ERROR_HINTS[status.error.code] : undefined;
  const noun = masterDataMeta[entity].singular.toLowerCase();

  return {
    label,
    icon: next ? Power : PowerOff,
    pending: status.isPending,
    open: () => confirm.open(next),
    dialog: (
      <AdminConfirmDialog
        {...confirm.dialogProps}
        title={`${label} ${name}?`}
        description={
          next
            ? `The ${noun} becomes available in pickers and on the public site again.`
            : `The ${noun} is hidden from pickers and the public site. Records that already use it keep working.`
        }
        confirmLabel={label}
        destructive={!next}
        onConfirm={() => status.mutate({ key: recordKey, active: next }, { onSuccess: confirm.close })}
      >
        {hint ? <p className="rounded-[calc(var(--radius)-2px)] border border-warning/30 bg-warning/10 p-3 text-sm">{hint}</p> : null}
      </AdminConfirmDialog>
    ),
  };
}

export function MasterDataStatusToggle({
  entity,
  recordKey,
  name,
  active,
  size = "sm",
  variant = "outline",
}: {
  entity: MasterDataEntity;
  recordKey: string;
  name: string;
  active: boolean;
  size?: ButtonProps["size"];
  variant?: ButtonProps["variant"];
}) {
  const toggle = useMasterDataStatusConfirm({ entity, recordKey, name, active });
  const Icon = toggle.icon;
  return (
    <>
      <Button type="button" size={size} variant={variant} className={variant === "outline" ? "bg-surface" : undefined} disabled={toggle.pending} onClick={toggle.open}>
        <Icon aria-hidden="true" />
        {toggle.label}
      </Button>
      {toggle.dialog}
    </>
  );
}
