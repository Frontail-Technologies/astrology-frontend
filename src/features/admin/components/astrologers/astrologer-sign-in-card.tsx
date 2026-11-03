"use client";

import { useId, useState } from "react";
import { Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ASTROLOGER_IDENTITY_HINTS } from "@/features/astrologers/constants/astrologer-status";
import { useUpdateAstrologerPhone } from "@/features/astrologers/hooks/use-astrologer-admin";
import { formatLoginPhone, isLoginPhone, normalizeLoginPhone } from "@/features/astrologers/lib/astrologer-phone";
import type { ManagedAstrologer } from "@/features/astrologers/types/astrologer-admin";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminSectionCard } from "../shared/admin-section-card";

/** The astrologer's sign-in identity (phone OTP in the app) with an audited "Change phone" action. */
export function AstrologerSignInCard({ astrologer }: { astrologer: ManagedAstrologer }) {
  const mutation = useUpdateAstrologerPhone(astrologer.id);
  const [open, setOpen] = useState(false);
  const [phone, setPhone] = useState("");
  const inputId = useId();
  const valid = isLoginPhone(phone);
  const unchanged = valid && normalizeLoginPhone(phone) === astrologer.phone;
  const hint = mutation.error?.code ? ASTROLOGER_IDENTITY_HINTS[mutation.error.code] : undefined;
  const canSignIn = astrologer.verificationStatus === "verified";

  return (
    <AdminSectionCard
      title="Sign-in"
      actions={
        <Button
          variant="outline"
          size="sm"
          className="bg-surface"
          onClick={() => {
            setPhone(astrologer.phone ?? "");
            mutation.reset();
            setOpen(true);
          }}
        >
          <Smartphone aria-hidden="true" />
          Change phone
        </Button>
      }
    >
      <div className="divide-y divide-border">
        <DetailRow label="Phone" value={astrologer.phone ? <span className="tabular-nums">{formatLoginPhone(astrologer.phone)}</span> : "Not set"} />
        {astrologer.email ? <DetailRow label="Email" value={<span className="break-all">{astrologer.email}</span>} /> : null}
      </div>
      <p className="mt-3 text-[13px] text-muted-foreground">
        {canSignIn ? "Signs in to the app with a code sent to this number." : "Can sign in to the app once the profile is verified."}
      </p>
      <AdminConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title="Change sign-in phone?"
        description="The astrologer will sign in with the new number from now on. The old number stops working."
        confirmLabel="Change phone"
        pending={mutation.isPending}
        error={hint ? null : mutation.error}
        confirmDisabled={!valid || unchanged}
        onConfirm={() => mutation.mutate(normalizeLoginPhone(phone), { onSuccess: () => setOpen(false) })}
      >
        <div className="grid gap-1.5">
          <Label htmlFor={inputId}>New mobile number</Label>
          <Input id={inputId} type="tel" inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="98765 43210" className="tabular-nums" disabled={mutation.isPending} />
          <p className="text-xs text-muted-foreground">{phone && !valid ? "Enter a mobile number, for example 98765 43210 or +91 98765 43210." : "Ten-digit Indian numbers get +91 automatically."}</p>
          {hint ? <p className="rounded-[calc(var(--radius)-2px)] border border-warning/30 bg-warning/10 p-3 text-sm">{hint}</p> : null}
        </div>
      </AdminConfirmDialog>
    </AdminSectionCard>
  );
}
