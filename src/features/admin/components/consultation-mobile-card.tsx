"use client";

import Link from "next/link";
import { Eye, MoreHorizontal } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import type { Consultation, ConsultationBookingStatus, ConsultationPaymentStatus } from "@/features/consultations/types/consultation";

const BOOKING_LABELS: Record<ConsultationBookingStatus, string> = {
  pending: "Pending",
  confirmed: "Confirmed",
  completed: "Completed",
  cancelled: "Cancelled",
};
const BOOKING_VARIANTS: Record<ConsultationBookingStatus, "pending" | "online" | "verified" | "unavailable"> = {
  pending: "pending",
  confirmed: "online",
  completed: "verified",
  cancelled: "unavailable",
};
const PAYMENT_VARIANTS: Record<ConsultationPaymentStatus, "pending" | "online" | "unavailable" | "muted"> = {
  pending: "pending",
  paid: "online",
  failed: "unavailable",
  refunded: "muted",
};
const PAYMENT_LABELS: Record<ConsultationPaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function ConsultationMobileCard({
  consultation,
  customerName,
  astrologerName,
}: {
  consultation: Consultation;
  customerName: string;
  astrologerName: string;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-3 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate font-medium text-foreground">{customerName}</p>
            <p className="truncate text-xs text-muted-foreground">{astrologerName}</p>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 shrink-0 p-0" aria-label={`Actions for consultation ${consultation.id}`}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/consultations/${consultation.id}`}>
                  <Eye aria-hidden="true" />
                  View
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          {consultation.bookingStatus && (
            <Badge variant={BOOKING_VARIANTS[consultation.bookingStatus]}>
              {BOOKING_LABELS[consultation.bookingStatus]}
            </Badge>
          )}
          {consultation.paymentStatus && (
            <Badge variant={PAYMENT_VARIANTS[consultation.paymentStatus]}>
              {PAYMENT_LABELS[consultation.paymentStatus]}
            </Badge>
          )}
          {consultation.mode && (
            <Badge variant="outline" className="text-xs">{consultation.mode}</Badge>
          )}
          <span className="text-xs text-muted-foreground">{formatDateTime(consultation.scheduledAt)}</span>
        </div>
      </CardContent>
    </Card>
  );
}
