"use client";

import Link from "next/link";
import { XCircle } from "lucide-react";

import { Button } from "@/components/ui/button";
import { orderStatusLabels, orderStatusVariants, orderTransitionCopy } from "@/features/orders/constants/order-status";
import { useOrderDetail, useUpdateOrderStatus } from "@/features/orders/hooks/use-order-admin";
import type { OrderStatus } from "@/features/orders/types/order-admin";
import { formatINR, formatOptionalDateTime } from "../../lib/format";
import { PaymentRefundsForEntity } from "../payments/admin-refunds";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { useConfirmAction } from "../shared/use-confirm-action";

const transitionLabel = (status: OrderStatus) => (status === "cancelled" ? "Cancel order" : `Mark ${orderStatusLabels[status].toLowerCase()}`);

export function AdminOrderDetailView({ orderId }: { orderId: string }) {
  const detail = useOrderDetail(orderId);
  const mutation = useUpdateOrderStatus(orderId);
  const confirm = useConfirmAction<OrderStatus>(mutation);
  const { target } = confirm;

  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="order">
      {() => {
        const order = detail.data!;
        const next = order.allowedTransitions;
        const forward = next.filter((status) => status !== "cancelled");
        const [primary, ...secondary] = forward;
        const canCancel = next.includes("cancelled");
        const timeline = [
          { label: "Placed", value: order.placedAt ?? order.createdAt },
          { label: "Confirmed", value: order.confirmedAt },
          { label: "Shipped", value: order.shippedAt },
          { label: "Delivered", value: order.deliveredAt },
          { label: "Cancelled", value: order.cancelledAt },
        ].filter((step) => step.label !== "Cancelled" || step.value);
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={`Order ${order.orderNumber}`}
              backHref="/admin/orders"
              backLabel="Orders"
              meta={
                <>
                  <AdminStatusBadge status={order.status} labels={orderStatusLabels} variants={orderStatusVariants} />
                  <span className="break-all">{order.customer.email}</span>
                  <span className="tabular-nums">Placed {formatOptionalDateTime(order.placedAt ?? order.createdAt)}</span>
                </>
              }
              actions={
                <>
                  {secondary.map((status) => (
                    <Button key={status} size="sm" variant="outline" className="bg-surface" onClick={() => confirm.open(status)}>
                      {transitionLabel(status)}
                    </Button>
                  ))}
                  {canCancel ? (
                    <AdminRowActions
                      label="More order actions"
                      className="size-9 min-h-9 border border-border bg-surface"
                      actions={[{ label: "Cancel order", icon: XCircle, destructive: true, onSelect: () => confirm.open("cancelled") }]}
                    />
                  ) : null}
                </>
              }
              primaryAction={
                primary ? (
                  <Button size="sm" variant="conversion" onClick={() => confirm.open(primary)}>
                    {transitionLabel(primary)}
                  </Button>
                ) : null
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Items" flush>
                  <ul className="divide-y divide-border">
                    {order.items.map((item) => (
                      <li key={`${item.productSlug}-${item.unitPricePaise}`} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                        <div className="min-w-0">
                          <p className="truncate font-medium">{item.productName}</p>
                          <p className="text-xs tabular-nums text-muted-foreground">
                            {item.quantity} × {formatINR(item.unitPricePaise)}
                          </p>
                        </div>
                        <span className="font-medium tabular-nums">{formatINR(item.lineTotalPaise)}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="divide-y divide-border border-t border-border px-5">
                    <DetailRow label="Subtotal" value={<span className="tabular-nums">{formatINR(order.subtotalPaise)}</span>} />
                    <DetailRow label="Shipping" value={<span className="tabular-nums">{formatINR(order.shippingPaise)}</span>} />
                    {order.discountPaise > 0 || order.couponCode ? (
                      <DetailRow label={`Discount${order.couponCode ? ` (${order.couponCode})` : ""}`} value={<span className="tabular-nums">−{formatINR(order.discountPaise)}</span>} />
                    ) : null}
                    <div className="flex items-center justify-between gap-4 py-3 text-sm">
                      <span className="font-semibold">Total</span>
                      <span className="text-base font-semibold tabular-nums">{formatINR(order.totalPaise)}</span>
                    </div>
                  </div>
                </AdminSectionCard>
                <AdminSectionCard title="Shipping address">
                  <address className="text-sm not-italic leading-relaxed">
                    <span className="font-medium">{order.shippingName}</span>
                    <br />
                    {order.shippingAddressLine1}
                    {order.shippingAddressLine2 ? (
                      <>
                        <br />
                        {order.shippingAddressLine2}
                      </>
                    ) : null}
                    <br />
                    {order.shippingCity}, {order.shippingState} {order.shippingPostalCode}
                    <br />
                    {order.shippingCountry}
                  </address>
                  <div className="mt-3 divide-y divide-border border-t border-border">
                    <DetailRow label="Email" value={<span className="break-all">{order.contactEmail}</span>} />
                    <DetailRow label="Phone" value={<span className="tabular-nums">{order.contactPhone}</span>} />
                  </div>
                </AdminSectionCard>
                <PaymentRefundsForEntity filter={{ orderId: order.id }} />
              </div>
              <AdminDetailStickyRail className="space-y-5">
                <AdminSectionCard title="Fulfilment">
                  <ol className="divide-y divide-border">
                    {timeline.map((step) => (
                      <li key={step.label} className="flex items-center justify-between gap-4 py-2.5 text-sm">
                        <span className={step.value ? "text-foreground" : "text-muted-foreground"}>{step.label}</span>
                        <span className={step.value ? "font-medium tabular-nums" : "text-muted-foreground"}>{formatOptionalDateTime(step.value, "Not yet")}</span>
                      </li>
                    ))}
                  </ol>
                  {next.length === 0 ? <p className="mt-3 text-[13px] text-muted-foreground">This order is complete. No further status changes are possible.</p> : null}
                </AdminSectionCard>
                <AdminSectionCard title="Customer">
                  <p className="break-all text-sm font-medium">{order.customer.email}</p>
                  {order.customer.phone ? <p className="text-[13px] tabular-nums text-muted-foreground">{order.customer.phone}</p> : null}
                  <Link href={`/admin/customers/${order.customer.id}`} className="mt-2 inline-block text-[13px] font-medium text-muted-foreground hover:text-foreground hover:underline">
                    View customer
                  </Link>
                </AdminSectionCard>
              </AdminDetailStickyRail>
            </div>

            <AdminConfirmDialog
              {...confirm.dialogProps}
              title={target === "cancelled" ? "Cancel this order?" : `Mark order ${target ? orderStatusLabels[target].toLowerCase() : ""}?`}
              description={target ? orderTransitionCopy[target] : ""}
              confirmLabel={target === "cancelled" ? "Cancel order" : "Update status"}
              destructive={target === "cancelled"}
              onConfirm={() => {
                if (target) mutation.mutate(target, { onSuccess: confirm.close });
              }}
            />
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
