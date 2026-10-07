"use client";

import { useState } from "react";
import { ExternalLink, ImageOff, Pencil, Star, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";

import { Badge, type BadgeProps } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getPoojaCategoryLabel, getPoojaStatusLabel } from "@/features/pooja/data/poojas";
import {
  formatPoojaDuration,
  formatPoojaPrice,
  getPoojaContentCompleteness,
  getPoojaManagementStatusLabel,
  getPoojaRequiredDetailsCount,
  getPoojaRitualStepCount,
} from "@/features/pooja/selectors/pooja-domain";
import type { PoojaDefinition, PoojaManagementStatus } from "@/features/pooja/types/pooja";
import { PoojaDeleteDialog } from "./pooja-delete-dialog";
import { AdminDetailStickyRail } from "./shared/admin-detail-sticky-rail";

const serviceStatusVariant = {
  available: "online",
  "coming-soon": "pending",
} as const;

const managementStatusPresentation: Record<PoojaManagementStatus, { label: string; variant: NonNullable<BadgeProps["variant"]> }> = {
  draft: { label: "Draft", variant: "pending" },
  active: { label: "Active", variant: "online" },
  archived: { label: "Archived", variant: "muted" },
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

function PoojaImage({ pooja }: { pooja: PoojaDefinition }) {
  return (
    <div className="relative flex size-16 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--radius)-3px)] bg-muted text-muted-foreground">
      <ImageOff className="size-5" aria-hidden="true" />
      <img
        src={pooja.imageSrc}
        alt={pooja.name}
        className="absolute inset-0 size-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

export function AdminPoojaDetailView({ pooja }: { pooja: PoojaDefinition }) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<PoojaDefinition | null>(null);
  const completeness = getPoojaContentCompleteness(pooja);
  const ritualStepCount = getPoojaRitualStepCount(pooja);
  const requiredDetailsCount = getPoojaRequiredDetailsCount(pooja);
  const managementStatus = pooja.management?.managementStatus;

  return (
    <section className="space-y-5">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex min-w-0 items-start gap-3">
          
          <PoojaImage pooja={pooja} />
          <div className="min-w-0 space-y-1.5">
            <h1 className="truncate font-sans text-xl font-semibold tracking-tight text-foreground">{pooja.name}</h1>
            <p className="text-sm text-muted-foreground">{pooja.categories.map(getPoojaCategoryLabel).join(", ")}</p>
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant={serviceStatusVariant[pooja.status]}>{getPoojaStatusLabel(pooja.status)}</Badge>
              {pooja.featured ? <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground"><Star className="size-3.5 fill-current text-primary" aria-hidden="true" />Featured</span> : null}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 self-start sm:self-center">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="size-9 p-0 text-foreground hover:bg-muted" aria-label={`Edit ${pooja.name}`} onClick={() => router.push(`/admin/poojas/${pooja.slug}/edit`)}>
                <Pencil className="size-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Edit {pooja.name}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="size-9 p-0 text-primary hover:bg-accent hover:text-primary" aria-label={`View public page for ${pooja.name}`} onClick={() => router.push(`/pooja/${pooja.slug}`)}>
                <ExternalLink className="size-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>View public page for {pooja.name}</TooltipContent>
          </Tooltip>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button variant="ghost" size="sm" className="size-9 p-0 text-destructive hover:bg-destructive/10 hover:text-destructive" aria-label={`Delete ${pooja.name}`} onClick={() => setDeleteTarget(pooja)}>
                <Trash2 className="size-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>Delete {pooja.name}</TooltipContent>
          </Tooltip>
        </div>
      </header>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,7fr)_minmax(16rem,3fr)]">
        <div className="space-y-5">
          <Section title="Overview">
            <div className="space-y-4 text-sm leading-6 text-muted-foreground">
              <p className="font-medium text-foreground">{pooja.shortDescription}</p>
              {pooja.detail.overview.length > 0 ? pooja.detail.overview.map((paragraph) => <p key={paragraph}>{paragraph}</p>) : <p>{"\u2014"}</p>}
            </div>
          </Section>

          <Section title="Quick facts">
            {pooja.detail.quickFacts.length > 0 ? (
              <dl className="grid gap-x-6 gap-y-4 sm:grid-cols-2">
                {pooja.detail.quickFacts.map((fact) => (
                  <div key={`${fact.label}-${fact.value}`} className="border-b border-border pb-3">
                    <dt className="text-xs font-medium text-muted-foreground">{fact.label}</dt>
                    <dd className="mt-1 text-sm font-medium text-foreground">{fact.value}</dd>
                  </div>
                ))}
              </dl>
            ) : <p className="text-sm text-muted-foreground">{"\u2014"}</p>}
          </Section>

          <Section title="Ritual process">
            {pooja.detail.ritualSteps.length > 0 ? (
              <ol className="space-y-4">
                {pooja.detail.ritualSteps.map((step, index) => (
                  <li key={`${step.title}-${index}`} className="flex gap-3">
                    <span className="flex size-6 shrink-0 items-center justify-center rounded-full bg-muted text-xs font-semibold text-foreground">{index + 1}</span>
                    <div className="min-w-0">
                      <h3 className="text-sm font-medium text-foreground">{step.title}</h3>
                      <p className="mt-1 text-sm leading-6 text-muted-foreground">{step.description}</p>
                    </div>
                  </li>
                ))}
              </ol>
            ) : <p className="text-sm text-muted-foreground">{"\u2014"}</p>}
          </Section>

          <Section title="Required details">
            {pooja.detail.requiredDetails.length > 0 ? (
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {pooja.detail.requiredDetails.map((detail) => <li key={detail} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />{detail}</li>)}
              </ul>
            ) : <p className="text-sm text-muted-foreground">{"\u2014"}</p>}
          </Section>

          <Section title="Preparation">
            {pooja.detail.preparationNotes.length > 0 ? (
              <ul className="space-y-2 text-sm leading-6 text-muted-foreground">
                {pooja.detail.preparationNotes.map((note) => <li key={note} className="flex gap-2"><span className="mt-2 size-1.5 shrink-0 rounded-full bg-primary" aria-hidden="true" />{note}</li>)}
              </ul>
            ) : <p className="text-sm text-muted-foreground">{"\u2014"}</p>}
          </Section>

          {pooja.detail.optionalSection ? (
            <Section title={pooja.detail.optionalSection.title}>
              <div className="space-y-3 text-sm leading-6 text-muted-foreground">
                {pooja.detail.optionalSection.body.map((paragraph) => <p key={paragraph}>{paragraph}</p>)}
              </div>
            </Section>
          ) : null}

          <Section title="Public metadata">
            <div className="divide-y divide-border font-mono text-xs">
              <ValueRow label="Slug">{pooja.slug}</ValueRow>
              <ValueRow label="Public route">{`/pooja/${pooja.slug}`}</ValueRow>
            </div>
          </Section>
        </div>

        <AdminDetailStickyRail>
          <Section title="Catalog">
            <div className="divide-y divide-border">
              <ValueRow label="Service status"><Badge variant={serviceStatusVariant[pooja.status]}>{getPoojaStatusLabel(pooja.status)}</Badge></ValueRow>
              <ValueRow label="Featured">{pooja.featured ? "Yes" : "No"}</ValueRow>
              <ValueRow label="Categories">{pooja.categories.map(getPoojaCategoryLabel).join(", ")}</ValueRow>
            </div>
          </Section>
          <Section title="Content">
            <div className="divide-y divide-border">
              <ValueRow label="Content completeness">{`${completeness.percentage}%`}</ValueRow>
              <ValueRow label="Fields complete">{`${completeness.completed} of ${completeness.total}`}</ValueRow>
              <ValueRow label="Ritual steps">{ritualStepCount}</ValueRow>
              <ValueRow label="Required details">{requiredDetailsCount}</ValueRow>
            </div>
          </Section>
          <Section title="Management">
            <div className="divide-y divide-border">
              <ValueRow label="Management status">{managementStatus ? <Badge variant={managementStatusPresentation[managementStatus].variant}>{managementStatusPresentation[managementStatus].label}</Badge> : "\u2014"}</ValueRow>
              <ValueRow label="Estimated duration">{formatPoojaDuration(pooja.management?.estimatedDurationMinutes)}</ValueRow>
              <ValueRow label="Price">{formatPoojaPrice(pooja.management?.priceInPaise, pooja.management?.currency)}</ValueRow>
            </div>
          </Section>
          {pooja.management?.createdAt || pooja.management?.updatedAt ? (
            <Section title="System">
              <div className="divide-y divide-border">
                {pooja.management.createdAt ? <ValueRow label="Created">{pooja.management.createdAt}</ValueRow> : null}
                {pooja.management.updatedAt ? <ValueRow label="Updated">{pooja.management.updatedAt}</ValueRow> : null}
              </div>
            </Section>
          ) : null}
        </AdminDetailStickyRail>
      </div>

      <PoojaDeleteDialog pooja={deleteTarget} onOpenChange={(open) => { if (!open) setDeleteTarget(null); }} />
    </section>
  );
}
