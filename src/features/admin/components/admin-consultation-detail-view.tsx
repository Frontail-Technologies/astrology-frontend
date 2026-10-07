"use client";

import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { astrologers } from "@/features/astrologers/data/astrologers";
import { useConsultationRepository } from "@/features/consultations/hooks/use-consultation-repository";
import type { ConsultationBookingStatus, ConsultationPaymentStatus } from "@/features/consultations/types/consultation";
import { useCustomerRepository } from "@/features/customers/hooks/use-customer-repository";

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
const PAYMENT_LABELS: Record<ConsultationPaymentStatus, string> = {
  pending: "Pending",
  paid: "Paid",
  failed: "Failed",
  refunded: "Refunded",
};
const PAYMENT_VARIANTS: Record<ConsultationPaymentStatus, "pending" | "online" | "unavailable" | "muted"> = {
  pending: "pending",
  paid: "online",
  failed: "unavailable",
  refunded: "muted",
};

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long", timeStyle: "short" }).format(new Date(iso));
}

export function AdminConsultationDetailView({ consultationId }: { consultationId: string }) {
  const { records: consultations, ready } = useConsultationRepository();
  const { records: customers } = useCustomerRepository();

  if (!ready) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const consultation = consultations.find((c) => c.id === consultationId);
  if (!consultation) notFound();

  const customer = customers.find((c) => c.id === consultation.customerId);
  const astrologer = astrologers.find((a) => a.id === consultation.astrologerId);

  return (
    <section className="max-w-3xl space-y-4">
      <header className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          
          <div>
            <Link
              href="/admin/consultations"
              className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3" aria-hidden="true" />
              Consultations
            </Link>
            <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">
              Consultation {consultation.id}
            </h1>
          </div>
        </div>
        {consultation.bookingStatus && (
          <Badge variant={BOOKING_VARIANTS[consultation.bookingStatus]}>
            {BOOKING_LABELS[consultation.bookingStatus]}
          </Badge>
        )}
      </header>

      <div className="grid gap-4 sm:grid-cols-2">
        <Card className="shadow-sm">
          <CardHeader className="px-5 pb-3 pt-5">
            <CardTitle className="font-sans text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Participants
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 px-5 pb-5">
            <div>
              <p className="text-xs text-muted-foreground">Customer</p>
              {customer ? (
                <Link
                  href={`/admin/customers/${customer.id}`}
                  className="mt-0.5 block text-sm font-medium underline-offset-2 hover:underline"
                >
                  {customer.name ?? customer.email ?? customer.id}
                </Link>
              ) : (
                <p className="mt-0.5 text-sm font-medium">{consultation.customerId}</p>
              )}
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Astrologer</p>
              {astrologer ? (
                <Link
                  href={`/admin/astrologers/${astrologer.slug}`}
                  className="mt-0.5 block text-sm font-medium underline-offset-2 hover:underline"
                >
                  {astrologer.name}
                </Link>
              ) : (
                <p className="mt-0.5 text-sm font-medium">{consultation.astrologerId}</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="px-5 pb-3 pt-5">
            <CardTitle className="font-sans text-sm font-semibold uppercase tracking-wide text-muted-foreground">
              Session
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 px-5 pb-5">
            <Detail label="Mode" value={consultation.mode} />
            <Detail label="Scheduled" value={formatDateTime(consultation.scheduledAt)} />
            <Detail
              label="Duration"
              value={consultation.durationMinutes ? `${consultation.durationMinutes} min` : undefined}
            />
          </CardContent>
        </Card>
      </div>

      <Card className="shadow-sm">
        <CardHeader className="px-5 pb-3 pt-5">
          <CardTitle className="font-sans text-sm font-semibold uppercase tracking-wide text-muted-foreground">
            Status &amp; Payment
          </CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 px-5 pb-5 sm:grid-cols-2">
          <div>
            <p className="text-xs text-muted-foreground">Booking status</p>
            <div className="mt-1">
              {consultation.bookingStatus ? (
                <Badge variant={BOOKING_VARIANTS[consultation.bookingStatus]}>
                  {BOOKING_LABELS[consultation.bookingStatus]}
                </Badge>
              ) : (
                <span className="text-sm">—</span>
              )}
            </div>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Payment status</p>
            <div className="mt-1">
              {consultation.paymentStatus ? (
                <Badge variant={PAYMENT_VARIANTS[consultation.paymentStatus]}>
                  {PAYMENT_LABELS[consultation.paymentStatus]}
                </Badge>
              ) : (
                <span className="text-sm">—</span>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-2">
        <Link href="/admin/consultations" className={buttonVariants({ variant: "outline", size: "sm" })}>
          Back to Consultations
        </Link>
        {customer && (
          <Link
            href={`/admin/customers/${customer.id}`}
            className={buttonVariants({ variant: "ghost", size: "sm" })}
          >
            View customer
          </Link>
        )}
      </div>
    </section>
  );
}
