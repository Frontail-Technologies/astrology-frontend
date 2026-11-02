"use client";

import { Button } from "@/components/ui/button";
import { poojaStatusDescriptions, poojaStatusLabels, poojaStatuses } from "@/features/poojas/constants/pooja-status";
import { usePoojaStatusUpdate } from "@/features/poojas/hooks/use-pooja-admin";
import type { PoojaStatus } from "@/features/poojas/types/pooja-admin";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { useConfirmAction } from "../shared/use-confirm-action";

const actionLabels: Record<PoojaStatus, string> = { draft: "Move to draft", published: "Publish", suspended: "Suspend" };

/** Publication status buttons (the API has no transition guard, so every other status is offered), each confirmed. */
export function PoojaStatusControl({ id, name, status }: { id: string; name: string; status: PoojaStatus }) {
  const update = usePoojaStatusUpdate(id);
  const confirm = useConfirmAction<PoojaStatus>(update);
  const target = confirm.target;
  return (
    <div className="grid gap-2">
      <p className="text-[13px] text-muted-foreground">{poojaStatusDescriptions[status]}</p>
      <div className="flex flex-wrap gap-2">
        {poojaStatuses
          .filter((next) => next !== status)
          .map((next) => (
            <Button
              key={next}
              size="sm"
              variant={next === "published" ? "conversion" : "outline"}
              className={next === "published" ? undefined : next === "suspended" ? "bg-surface text-destructive hover:text-destructive" : "bg-surface"}
              disabled={update.isPending}
              onClick={() => confirm.open(next)}
            >
              {actionLabels[next]}
            </Button>
          ))}
      </div>
      <AdminConfirmDialog
        {...confirm.dialogProps}
        title={target ? `${actionLabels[target]} “${name}”?` : ""}
        description={target ? poojaStatusDescriptions[target] : ""}
        confirmLabel={target ? actionLabels[target] : "Confirm"}
        destructive={target === "suspended"}
        onConfirm={() => {
          if (target) update.mutate({ status: target }, { onSuccess: confirm.close });
        }}
      />
      <span className="sr-only">Current status: {poojaStatusLabels[status]}</span>
    </div>
  );
}
