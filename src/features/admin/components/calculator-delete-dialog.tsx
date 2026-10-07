"use client";

import { AlertDialog, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import type { CalculatorDefinition } from "@/features/calculators/types/calculator";

export function CalculatorDeleteDialog({ calculator, onOpenChange }: { calculator: CalculatorDefinition | null; onOpenChange: (open: boolean) => void }) {
  return <AlertDialog open={Boolean(calculator)} onOpenChange={onOpenChange}><AlertDialogContent className="sm:min-w-[32rem]"><AlertDialogHeader><AlertDialogTitle>Delete {calculator?.name}?</AlertDialogTitle><AlertDialogDescription>Permanent deletion requires the Admin API.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter className="sm:justify-end"><AlertDialogCancel className="whitespace-nowrap">Close</AlertDialogCancel><Button variant="destructive" disabled className="whitespace-nowrap">Deletion unavailable</Button></AlertDialogFooter></AlertDialogContent></AlertDialog>;
}
