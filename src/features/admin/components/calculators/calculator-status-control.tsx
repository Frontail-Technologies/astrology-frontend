"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { AdminSelectField } from "../shared/admin-select-field";
import { calculatorStatusDescriptions, calculatorStatusLabels, calculatorStatusVariants, calculatorStatuses } from "@/features/calculators/constants/calculator-status";
import { useCalculatorStatusUpdate } from "@/features/calculators/hooks/use-calculator-admin";
import type { CalculatorStatus, ManagedCalculator } from "@/features/calculators/types/calculator-admin";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { useConfirmAction } from "../shared/use-confirm-action";

/** Status select + confirm (`PATCH /:id/status`; the API has no transition guard). */
export function CalculatorStatusControl({ calculator }: { calculator: ManagedCalculator }) {
  const update = useCalculatorStatusUpdate(calculator.id);
  const confirm = useConfirmAction<CalculatorStatus>(update);
  const [choice, setChoice] = useState<CalculatorStatus>(calculator.status);
  const [syncedStatus, setSyncedStatus] = useState(calculator.status);
  if (syncedStatus !== calculator.status) {
    setSyncedStatus(calculator.status);
    setChoice(calculator.status);
  }
  const target = confirm.target;

  return (
    <AdminSectionCard title="Catalog status" actions={<AdminStatusBadge status={calculator.status} labels={calculatorStatusLabels} variants={calculatorStatusVariants} />}>
      <p className="text-sm text-muted-foreground">{calculatorStatusDescriptions[calculator.status]}</p>
      <label htmlFor={`calculator-status-${calculator.id}`} className="sr-only">
        New status
      </label>
      <div className="mt-3 flex items-start gap-2">
        <AdminSelectField
          control={{ id: `calculator-status-${calculator.id}` }}
          className="min-w-0 flex-1"
          value={choice}
          onValueChange={(value) => {
            if (value) setChoice(value as CalculatorStatus);
          }}
          options={calculatorStatuses.map((status) => ({ value: status, label: calculatorStatusLabels[status] }))}
        />
        <Button type="button" size="sm" variant="outline" className="bg-surface" disabled={choice === calculator.status || update.isPending} onClick={() => confirm.open(choice)}>
          Apply
        </Button>
      </div>
      <AdminConfirmDialog
        {...confirm.dialogProps}
        title={target ? `Set status to “${calculatorStatusLabels[target]}”?` : ""}
        description={target ? calculatorStatusDescriptions[target] : ""}
        confirmLabel="Change status"
        onConfirm={() => {
          if (target) update.mutate(target, { onSuccess: confirm.close });
        }}
      />
    </AdminSectionCard>
  );
}
