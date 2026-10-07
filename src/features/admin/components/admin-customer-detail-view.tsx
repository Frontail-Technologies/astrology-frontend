"use client";

import { getInitials } from "../lib/format";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ArrowLeft, CalendarDays } from "lucide-react";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { buttonVariants } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useCustomerRepository } from "@/features/customers/hooks/use-customer-repository";
import { useConsultationRepository } from "@/features/consultations/hooks/use-consultation-repository";
import { astrologers } from "@/features/astrologers/data/astrologers";
import type { CustomerAccountStatus } from "@/features/customers/types/customer";

const STATUS_LABELS: Record<CustomerAccountStatus, string> = {
  active: "Active",
  suspended: "Suspended",
  archived: "Archived",
};
const STATUS_VARIANTS: Record<CustomerAccountStatus, "online" | "unavailable" | "muted"> = {
  active: "online",
  suspended: "unavailable",
  archived: "muted",
};

function Detail({ label, value }: { label: string; value?: string | null }) {
  return (
    <div className="grid gap-0.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="text-sm font-medium">{value ?? "—"}</p>
    </div>
  );
}

function formatDate(iso?: string) {
  if (!iso) return undefined;
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "long" }).format(new Date(iso));
}

function formatDateTime(iso?: string) {
  if (!iso) return "—";
  return new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export function AdminCustomerDetailView({ customerId }: { customerId: string }) {
  const { records: customers, ready } = useCustomerRepository();
  const { records: consultations } = useConsultationRepository();

  if (!ready) {
    return (
      <div className="flex min-h-48 items-center justify-center">
        <p className="text-sm text-muted-foreground">Loading…</p>
      </div>
    );
  }

  const customer = customers.find((c) => c.id === customerId);
  if (!customer) notFound();

  const customerConsultations = consultations.filter((c) => c.customerId === customerId);

  return (
    <section className="max-w-4xl space-y-4">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          
          <div>
            <Link
              href="/admin/customers"
              className="mb-1 inline-flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <ArrowLeft className="size-3" aria-hidden="true" />
              Customers
            </Link>
            <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">
              {customer.name ?? "Unknown customer"}
            </h1>
          </div>
        </div>
        {customer.accountStatus && (
          <Badge variant={STATUS_VARIANTS[customer.accountStatus]}>
            {STATUS_LABELS[customer.accountStatus]}
          </Badge>
        )}
      </header>

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="space-y-4">
          <Card className="shadow-sm">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Profile
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="flex items-center gap-4">
                <Avatar className="size-14">
                  <AvatarFallback className="bg-accent text-base font-semibold text-sidebar-primary">
                    {getInitials(customer.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-lg font-semibold">{customer.name ?? "—"}</p>
                  <p className="text-sm text-muted-foreground">{customer.email ?? "—"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Contact
              </CardTitle>
            </CardHeader>
            <CardContent className="grid gap-3 px-5 pb-5 sm:grid-cols-2">
              <Detail label="Email" value={customer.email} />
              <Detail label="Phone" value={customer.phone} />
            </CardContent>
          </Card>

          {customer.birthDetails && (
            <Card className="shadow-sm">
              <CardHeader className="px-5 pb-3 pt-5">
                <CardTitle className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Birth details
                </CardTitle>
              </CardHeader>
              <CardContent className="grid gap-3 px-5 pb-5 sm:grid-cols-3">
                <Detail label="Date of birth" value={customer.birthDetails.date} />
                <Detail label="Time of birth" value={customer.birthDetails.time} />
                <Detail label="Place" value={customer.birthDetails.place} />
              </CardContent>
            </Card>
          )}

          <Card className="shadow-sm">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Consultations
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-2">
              {customerConsultations.length === 0 ? (
                <p className="pb-3 text-sm text-muted-foreground">No consultations on record.</p>
              ) : (
                <div className="divide-y divide-border">
                  {customerConsultations.map((con) => {
                    const astrologer = astrologers.find((a) => a.id === con.astrologerId);
                    return (
                      <div key={con.id} className="flex items-center justify-between gap-3 py-3">
                        <div>
                          <p className="text-sm font-medium">
                            {astrologer?.name ?? con.astrologerId}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {con.mode} · {formatDateTime(con.scheduledAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge
                            variant={
                              con.bookingStatus === "completed"
                                ? "verified"
                                : con.bookingStatus === "confirmed"
                                  ? "online"
                                  : con.bookingStatus === "cancelled"
                                    ? "unavailable"
                                    : "pending"
                            }
                          >
                            {con.bookingStatus
                              ? con.bookingStatus.charAt(0).toUpperCase() + con.bookingStatus.slice(1)
                              : "—"}
                          </Badge>
                          <Link
                            href={`/admin/consultations/${con.id}`}
                            className={buttonVariants({ variant: "ghost", size: "sm" })}
                          >
                            View
                          </Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        <aside className="space-y-4 lg:sticky lg:top-6 lg:self-start">
          <Card className="shadow-sm">
            <CardHeader className="px-5 pb-3 pt-5">
              <CardTitle className="font-sans text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Account
              </CardTitle>
            </CardHeader>
            <CardContent className="px-5 pb-5">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-muted-foreground">Status</p>
                  {customer.accountStatus ? (
                    <Badge variant={STATUS_VARIANTS[customer.accountStatus]} className="mt-1">
                      {STATUS_LABELS[customer.accountStatus]}
                    </Badge>
                  ) : (
                    <p className="mt-1 text-sm">—</p>
                  )}
                </div>
                <Separator />
                <div className="flex items-center gap-2 text-xs text-muted-foreground">
                  <CalendarDays className="size-3.5" aria-hidden="true" />
                  <span>Joined {formatDate(customer.createdAt) ?? "unknown"}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="shadow-sm">
            <CardContent className="px-5 py-4">
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Consultations</dt>
                  <dd className="font-medium">{customerConsultations.length}</dd>
                </div>
                <div className="flex justify-between gap-2">
                  <dt className="text-muted-foreground">Completed</dt>
                  <dd className="font-medium">
                    {customerConsultations.filter((c) => c.bookingStatus === "completed").length}
                  </dd>
                </div>
              </dl>
            </CardContent>
          </Card>
        </aside>
      </div>
    </section>
  );
}
