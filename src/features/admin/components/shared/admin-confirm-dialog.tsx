"use client";

import { useId, useState, type ReactNode } from "react";

import {
  AlertDialog,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { AdminError } from "@/features/admin/data/admin-errors";

export type AdminReasonRequirement = { label: string; minLength: number; maxLength: number; placeholder?: string };

/**
 * Confirmation for consequential Admin actions. The dialog stays open (and blocks double-submit) until the
 * mutation settles, shows server errors inline, and can require a reason that the backend also enforces.
 */
export function AdminConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  confirmLabel,
  destructive = false,
  reason,
  pending,
  error,
  onConfirm,
  children,
  confirmDisabled = false,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  confirmLabel: string;
  destructive?: boolean;
  reason?: AdminReasonRequirement;
  pending: boolean;
  error?: AdminError | null;
  onConfirm: (reason: string | undefined) => void;
  /** Extra action-specific fields (for example a schedule time or provider reference). */
  children?: ReactNode;
  confirmDisabled?: boolean;
}) {
  const reasonId = useId();
  const errorId = useId();
  const [reasonText, setReasonText] = useState("");
  const trimmed = reasonText.trim();
  const reasonValid = !reason || (trimmed.length >= reason.minLength && trimmed.length <= reason.maxLength);
  const reasonFieldError = error?.fieldErrors.find((field) => field.path === "reason")?.message;

  return (
    <AlertDialog
      open={open}
      onOpenChange={(next) => {
        if (pending) return;
        if (!next) setReasonText("");
        onOpenChange(next);
      }}
    >
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        {children}
        {reason ? (
          <div className="grid gap-1.5">
            <Label htmlFor={reasonId}>{reason.label}</Label>
            <Textarea
              id={reasonId}
              value={reasonText}
              onChange={(event) => setReasonText(event.target.value)}
              placeholder={reason.placeholder}
              maxLength={reason.maxLength}
              aria-invalid={Boolean(reasonFieldError) || undefined}
              aria-describedby={reasonFieldError || error ? errorId : undefined}
              disabled={pending}
            />
            <p className="text-xs text-muted-foreground">
              {trimmed.length}/{reason.maxLength} · at least {reason.minLength} characters. This reason is recorded in the audit log.
            </p>
          </div>
        ) : null}
        {error ? (
          <p id={errorId} role="alert" className="text-sm text-destructive">
            {reasonFieldError ?? error.message}
          </p>
        ) : null}
        <AlertDialogFooter>
          <AlertDialogCancel disabled={pending}>Cancel</AlertDialogCancel>
          <Button
            variant={destructive ? "destructive" : "default"}
            disabled={pending || !reasonValid || confirmDisabled}
            aria-busy={pending || undefined}
            onClick={() => onConfirm(reason ? trimmed : undefined)}
          >
            {pending ? "Working…" : confirmLabel}
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
