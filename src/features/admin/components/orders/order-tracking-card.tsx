"use client";

import { useId, useState } from "react";
import { ExternalLink, Truck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { orderCourierLabels } from "@/features/orders/constants/order-status";
import { useUpdateOrderTracking } from "@/features/orders/hooks/use-order-admin";
import type { AdminOrder } from "@/features/orders/types/order-admin";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminSelectField } from "../shared/admin-select-field";

const httpUrl = (value: string) => {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
};

/** Courier and tracking number the customer sees in the app. Editable until the order is cancelled. */
export function OrderTrackingCard({ order }: { order: AdminOrder }) {
  const mutation = useUpdateOrderTracking(order.id);
  const [open, setOpen] = useState(false);
  const [courier, setCourier] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [trackingUrl, setTrackingUrl] = useState("");
  const ids = { courier: useId(), number: useId(), url: useId() };
  const hasTracking = Boolean(order.courier && order.trackingNumber);
  const cancelled = order.status === "cancelled";
  const urlValid = trackingUrl.trim() === "" || httpUrl(trackingUrl.trim());
  const valid = courier.trim().length >= 2 && courier.trim().length <= 80 && trackingNumber.trim().length >= 3 && trackingNumber.trim().length <= 80 && urlValid;

  const start = () => {
    mutation.reset();
    setCourier(order.courier ?? "");
    setTrackingNumber(order.trackingNumber ?? "");
    setTrackingUrl(order.trackingUrl ?? "");
    setOpen(true);
  };

  return (
    <AdminSectionCard
      title="Shipping & tracking"
      actions={
        cancelled ? null : (
          <Button variant="outline" size="sm" className="bg-surface" onClick={start}>
            <Truck aria-hidden="true" />
            {hasTracking ? "Edit" : "Add tracking"}
          </Button>
        )
      }
    >
      {hasTracking ? (
        <div className="divide-y divide-border">
          <DetailRow label="Courier" value={order.courier} />
          <DetailRow label="Tracking number" value={<span className="font-mono text-[13px]">{order.trackingNumber}</span>} />
          {order.trackingUrl ? (
            <DetailRow
              label="Tracking link"
              value={
                <a href={order.trackingUrl} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1 hover:underline">
                  Open
                  <ExternalLink className="size-3.5" aria-hidden="true" />
                </a>
              }
            />
          ) : null}
        </div>
      ) : (
        <p className="text-sm text-muted-foreground">{cancelled ? "This order was cancelled." : "No tracking yet. Add it when the parcel is handed to the courier."}</p>
      )}
      {order.cancellationReason ? (
        <div className="mt-3 rounded-[calc(var(--radius)-2px)] bg-muted p-3">
          <p className="mb-1 text-xs font-medium text-muted-foreground">Customer&apos;s cancellation reason</p>
          <p className="text-sm">{order.cancellationReason}</p>
        </div>
      ) : null}
      <AdminConfirmDialog
        open={open}
        onOpenChange={setOpen}
        title={hasTracking ? "Edit tracking" : "Add tracking"}
        description="The customer sees the courier, tracking number and link on the order in the app."
        confirmLabel="Save tracking"
        pending={mutation.isPending}
        error={mutation.error}
        confirmDisabled={!valid}
        onConfirm={() =>
          mutation.mutate(
            { courier: courier.trim(), trackingNumber: trackingNumber.trim(), trackingUrl: trackingUrl.trim() || null },
            { onSuccess: () => setOpen(false) },
          )
        }
      >
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor={ids.courier}>Courier</Label>
            <AdminSelectField
              control={{ id: ids.courier }}
              value={courier}
              onValueChange={(value) => setCourier(value ?? "")}
              options={orderCourierLabels}
              placeholder="Choose a courier"
              other={{ label: "Other courier…", placeholder: "Courier name", maxLength: 80, inputLabel: "Courier name" }}
              disabled={mutation.isPending}
            />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={ids.number}>Tracking number</Label>
            <Input id={ids.number} value={trackingNumber} onChange={(event) => setTrackingNumber(event.target.value)} maxLength={80} className="font-mono" disabled={mutation.isPending} />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor={ids.url}>Tracking link (optional)</Label>
            <Input id={ids.url} type="url" value={trackingUrl} onChange={(event) => setTrackingUrl(event.target.value)} maxLength={500} placeholder="https://" disabled={mutation.isPending} />
            {!urlValid ? <p className="text-xs text-destructive">Enter a full link starting with https://</p> : null}
          </div>
        </div>
      </AdminConfirmDialog>
    </AdminSectionCard>
  );
}
