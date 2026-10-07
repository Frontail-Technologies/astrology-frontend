"use client";

import { useState } from "react";
import { ExternalLink, Pencil, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { availabilityLabel } from "@/features/astrologers/data/astrologers";
import {
  formatAstrologerExperience,
  formatAstrologerRating,
  getAstrologerManagementStatus,
  getAstrologerProfileCompleteness,
} from "@/features/astrologers/selectors/astrologer-domain";
import type {
  AstrologerListItem,
  AstrologerManagementStatus,
  AstrologerOperationalSummary,
  AstrologerVerificationStatus,
} from "@/features/astrologers/types/astrologer";
import { AstrologerDeleteDialog } from "./astrologer-delete-dialog";
import { AdminDetailStickyRail } from "./shared/admin-detail-sticky-rail";

const managementStatusPresentation: Record<AstrologerManagementStatus, { label: string; variant: NonNullable<BadgeProps["variant"]> }> = {
  draft: { label: "Draft", variant: "pending" },
  active: { label: "Active", variant: "online" },
  suspended: { label: "Suspended", variant: "unavailable" },
  archived: { label: "Archived", variant: "default" },
};

const verificationStatusPresentation: Record<AstrologerVerificationStatus, { label: string; variant: NonNullable<BadgeProps["variant"]> }> = {
  unverified: { label: "Unverified", variant: "default" },
  pending: { label: "Pending", variant: "pending" },
  verified: { label: "Verified", variant: "verified" },
  rejected: { label: "Rejected", variant: "unavailable" },
};

function ValueRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2.5 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium text-foreground">{children}</span>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="px-5 pb-0 pt-5"><CardTitle className="font-sans text-base">{title}</CardTitle></CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

function formatPrice(priceInPaise: number, currency: "INR") {
  return new Intl.NumberFormat("en-IN", { style: "currency", currency, maximumFractionDigits: 2 }).format(priceInPaise / 100);
}

export function AdminAstrologerDetailView({
  astrologer,
  operationalSummary,
}: {
  astrologer: AstrologerListItem;
  operationalSummary?: AstrologerOperationalSummary;
}) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<AstrologerListItem | null>(null);
  const detail = astrologer.detail;
  const completeness = getAstrologerProfileCompleteness(astrologer);
  const managementStatus = getAstrologerManagementStatus(astrologer);
  const verificationStatus = astrologer.management?.verificationStatus;
  const liveAvailability = operationalSummary?.liveAvailability;
  const sessionStats = operationalSummary?.sessionStats;

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          
          <Avatar size="lg" className="shrink-0">
            <AvatarImage src={astrologer.avatarSrc} alt={astrologer.name} />
            <AvatarFallback>{astrologer.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-1">
            <h1 className="truncate font-sans text-xl font-semibold tracking-tight text-foreground">{astrologer.name}</h1>
            {detail?.role ? <p className="text-sm text-muted-foreground">{detail.role}</p> : null}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-medium text-foreground">{astrologer.primaryExpertise}</span>
              <Badge variant={astrologer.availability === "bookable" ? "online" : "muted"}>{availabilityLabel(astrologer.availability)}</Badge>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 self-start sm:self-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="size-9 p-0 text-foreground hover:bg-muted" aria-label={`Edit ${astrologer.name}`} onClick={() => router.push(`/admin/astrologers/${astrologer.slug}/edit`)}>
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit {astrologer.name}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="size-9 p-0 text-primary hover:bg-accent hover:text-primary" aria-label={`View public profile for ${astrologer.name}`} onClick={() => router.push(`/astrologer/${astrologer.slug}`)}>
                <ExternalLink className="size-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View public profile for {astrologer.name}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="size-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${astrologer.name}`} onClick={() => setDeleteTarget(astrologer)}>
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete {astrologer.name}</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(16rem,3fr)]">
        <div className="space-y-5">
          <Section title="Profile overview">
            <div className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p className="font-medium text-foreground">{detail?.intro ?? "\u2014"}</p>
              {detail?.bio.length ? detail.bio.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>{"\u2014"}</p>}
            </div>
          </Section>

          <Section title="Expertise & guidance">
            <div className="space-y-4">
              <ValueRow label="Primary expertise"><Badge variant="outline">{astrologer.primaryExpertise}</Badge></ValueRow>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">Specialties</p>
                <p className="mt-1.5 text-sm text-foreground">{astrologer.specialties.join(", ") || "\u2014"}</p>
              </div>
              <div className="border-t border-border pt-4">
                <p className="text-sm text-muted-foreground">Guidance areas</p>
                {detail?.guidanceAreas.length ? (
                  <ul className="mt-2 space-y-2 text-sm text-foreground">
                    {detail.guidanceAreas.map((area) => <li key={area.title}><span className="font-medium">{area.title}</span><span className="text-muted-foreground"> - {area.description}</span></li>)}
                  </ul>
                ) : <p className="mt-1.5 text-sm text-foreground">{"\u2014"}</p>}
              </div>
            </div>
          </Section>

          <Section title="Approach">
            <p className="text-sm leading-6 text-muted-foreground">{detail?.approachFocus ?? "\u2014"}</p>
          </Section>

          <Section title="Languages & consultation">
            <div className="divide-y divide-border">
              <ValueRow label="Languages">{astrologer.languages.join(", ") || "\u2014"}</ValueRow>
              <ValueRow label="Consultation modes">{detail?.consultationModes.join(", ") || "\u2014"}</ValueRow>
              <ValueRow label="Booking availability">{availabilityLabel(astrologer.availability)}</ValueRow>
            </div>
          </Section>

          <Section title="Experience & pricing">
            <div className="divide-y divide-border">
              <ValueRow label="Experience">{formatAstrologerExperience(astrologer.experienceYears)}</ValueRow>
              <div className="py-3">
                <p className="text-sm text-muted-foreground">Consultation pricing</p>
                {astrologer.consultationPricing?.length ? (
                  <div className="mt-2 space-y-2">
                    {astrologer.consultationPricing.map((pricing) => (
                      <div key={pricing.mode} className="flex items-center justify-between gap-3 text-sm text-foreground">
                        <span>{pricing.mode}</span><span className="font-medium">{formatPrice(pricing.priceInPaise, pricing.currency)}{pricing.durationMinutes ? ` / ${pricing.durationMinutes} min` : ""}</span>
                      </div>
                    ))}
                  </div>
                ) : <p className="mt-1.5 text-sm text-foreground">{"\u2014"}</p>}
              </div>
            </div>
          </Section>

          <Section title="Public profile metadata">
            <div className="divide-y divide-border font-mono text-xs">
              <ValueRow label="ID">{astrologer.id}</ValueRow>
              <ValueRow label="Slug">{astrologer.slug}</ValueRow>
              <ValueRow label="Public route">{`/astrologer/${astrologer.slug}`}</ValueRow>
            </div>
          </Section>
        </div>

        <AdminDetailStickyRail>
          <Section title="Profile">
            <div className="divide-y divide-border">
              <ValueRow label="Profile completeness">{`${completeness.percentage}%`}</ValueRow>
              <ValueRow label="Fields complete">{`${completeness.completed} of ${completeness.total}`}</ValueRow>
              <ValueRow label="Booking availability">{availabilityLabel(astrologer.availability)}</ValueRow>
            </div>
          </Section>
          <Section title="Management">
            <div className="divide-y divide-border">
              <ValueRow label="Management status">{managementStatus ? <Badge variant={managementStatusPresentation[managementStatus].variant}>{managementStatusPresentation[managementStatus].label}</Badge> : "\u2014"}</ValueRow>
              <ValueRow label="Verification">{verificationStatus ? <Badge variant={verificationStatusPresentation[verificationStatus].variant}>{verificationStatusPresentation[verificationStatus].label}</Badge> : "\u2014"}</ValueRow>
            </div>
          </Section>
          <Section title="Operations">
            <div className="divide-y divide-border">
              <ValueRow label="Live availability">{liveAvailability ? liveAvailability.state[0].toUpperCase() + liveAvailability.state.slice(1) : "Not connected"}</ValueRow>
              <ValueRow label="Rating">{formatAstrologerRating(operationalSummary?.ratingSummary)}</ValueRow>
              <ValueRow label="Sessions">{sessionStats ? `${sessionStats.total} total` : "Not connected"}</ValueRow>
              {sessionStats ? <ValueRow label="Completed / cancelled">{`${sessionStats.completed} / ${sessionStats.cancelled}`}</ValueRow> : null}
            </div>
          </Section>
        </AdminDetailStickyRail>
      </div>

      <AstrologerDeleteDialog astrologer={deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }} />
    </section>
  );
}
