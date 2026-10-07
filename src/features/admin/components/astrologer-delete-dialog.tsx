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
import type { AstrologerListItem } from "@/features/astrologers/types/astrologer";

export function AstrologerDeleteDialog({
  astrologer,
  onOpenChange,
}: {
  astrologer: AstrologerListItem | null;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <AlertDialog open={Boolean(astrologer)} onOpenChange={onOpenChange}>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>Delete {astrologer?.name}?</AlertDialogTitle>
          <AlertDialogDescription>
            Deletion requires the Admin API to be connected.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Close</AlertDialogCancel>
          <Button variant="destructive" disabled>Deletion unavailable</Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
