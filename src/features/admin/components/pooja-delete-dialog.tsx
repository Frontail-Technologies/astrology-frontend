"use client";

import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import type { PoojaDefinition } from "@/features/pooja/types/pooja";

export function PoojaDeleteDialog({ pooja, onOpenChange }: { pooja: PoojaDefinition | null; onOpenChange: (open: boolean) => void }) {
  return (
    <AlertDialog open={Boolean(pooja)} onOpenChange={onOpenChange}>
      <AlertDialogContent className="sm:min-w-[32rem]">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {pooja?.name}?</AlertDialogTitle>
          <AlertDialogDescription>Permanent deletion requires the Admin API.</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="sm:justify-end">
          <AlertDialogCancel className="whitespace-nowrap">Close</AlertDialogCancel>
          <Button variant="destructive" disabled className="whitespace-nowrap">Deletion unavailable</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
