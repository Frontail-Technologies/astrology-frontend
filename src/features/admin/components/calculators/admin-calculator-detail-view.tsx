"use client";

import Link from "next/link";
import { Pencil } from "lucide-react";

import { Button } from "@/components/ui/button";
import { calculatorCategoryLabels, calculatorStatusLabels, calculatorStatusVariants } from "@/features/calculators/constants/calculator-status";
import { calculatorDeleteOptions, useCalculatorDetail } from "@/features/calculators/hooks/use-calculator-admin";
import { mediaDisplayUrl } from "@/features/media/media-url";
import { formatDateTime } from "../../lib/format";
import { AdminDeleteAction } from "../shared/admin-delete-action";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";
import { CalculatorStatusControl } from "./calculator-status-control";

export function AdminCalculatorDetailView({ id }: { id: string }) {
  const detail = useCalculatorDetail(id);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="calculator">
      {() => {
        const calculator = detail.data!;
        const info = calculator.detail;
        const image = mediaDisplayUrl(calculator.imageSrc);
        const fieldCount = info?.sections?.reduce((total, section) => total + section.fields.length, 0) ?? 0;
        return (
          <section className="space-y-5">
            <AdminPageHeader
              title={calculator.name}
              backHref="/admin/calculators"
              backLabel="Calculators"
              meta={
                <>
                  <AdminStatusBadge status={calculator.status} labels={calculatorStatusLabels} variants={calculatorStatusVariants} />
                  {calculator.featured ? (
                    <AdminStatusPill tone="info" dot={false}>
                      Featured
                    </AdminStatusPill>
                  ) : null}
                  <span>{calculatorCategoryLabels[calculator.category]}</span>
                  <span aria-hidden="true">·</span>
                  <span className="tabular-nums">Updated {formatDateTime(calculator.updatedAt)}</span>
                </>
              }
              actions={
                <>
                  <AdminDeleteAction
                    id={calculator.id}
                    entityLabel="calculator"
                    {...calculatorDeleteOptions}
                    redirectTo="/admin/calculators"
                    triggerClassName="bg-surface text-destructive hover:text-destructive"
                  />
                  <Button asChild variant="outline" size="sm" className="bg-surface">
                    <Link href={`/admin/calculators/${calculator.id}/edit`}>
                      <Pencil aria-hidden="true" />
                      Edit
                    </Link>
                  </Button>
                </>
              }
            />
            <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Catalog card">
                  <div className="flex flex-col gap-4 sm:flex-row">
                    {/* eslint-disable-next-line @next/next/no-img-element -- uploaded or external media */}
                    {image ? <img src={image} alt="" className="aspect-video w-full rounded-lg border border-border bg-muted object-cover sm:w-56" /> : null}
                    <div className="min-w-0 space-y-3">
                      <p className="text-sm leading-6">{calculator.shortDescription}</p>
                      <div>
                        <p className="mb-1.5 text-[13px] text-muted-foreground">Search keywords</p>
                        {calculator.keywords.length ? (
                          <div className="flex flex-wrap gap-1.5">
                            {calculator.keywords.map((keyword) => (
                              <AdminStatusPill key={keyword} tone="neutral" dot={false}>
                                {keyword}
                              </AdminStatusPill>
                            ))}
                          </div>
                        ) : (
                          <p className="text-sm text-muted-foreground">No keywords</p>
                        )}
                      </div>
                    </div>
                  </div>
                </AdminSectionCard>
                <AdminSectionCard title="Detail page">
                  {info ? (
                    <div className="space-y-4 text-sm">
                      {info.intro ? <p className="leading-6">{info.intro}</p> : <p className="text-muted-foreground">No introduction.</p>}
                      {info.howItWorks?.length ? (
                        <div>
                          <p className="mb-1.5 font-medium">How it works</p>
                          <ol className="list-decimal space-y-1 pl-5 text-muted-foreground">
                            {info.howItWorks.map((step, index) => (
                              <li key={index}>{step}</li>
                            ))}
                          </ol>
                        </div>
                      ) : null}
                      <div className="divide-y divide-border">
                        <DetailRow label="Submit button label" value={info.submitLabel ?? "Default"} />
                        <DetailRow label="Privacy note" value={info.privacyNote ?? "None"} />
                        <DetailRow label="Input fields" value={<span className="tabular-nums">{fieldCount}</span>} />
                        <DetailRow label="Related calculators" value={info.relatedSlugs?.length ? <span className="tabular-nums">{info.relatedSlugs.length}</span> : "None"} />
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">No detail page configuration.</p>
                  )}
                </AdminSectionCard>
              </div>
              <AdminDetailStickyRail className="space-y-5">
                <CalculatorStatusControl calculator={calculator} />
                <AdminSectionCard title="Record">
                  <div className="divide-y divide-border">
                    <DetailRow label="Address" value={<span className="break-all">/calculators/{calculator.slug}</span>} />
                    <DetailRow label="Sort order" value={<span className="tabular-nums">{calculator.sortOrder}</span>} />
                    <DetailRow label="Created" value={formatDateTime(calculator.createdAt)} />
                    <DetailRow label="Updated" value={formatDateTime(calculator.updatedAt)} />
                  </div>
                </AdminSectionCard>
              </AdminDetailStickyRail>
            </div>
          </section>
        );
      }}
    </AdminDetailFrame>
  );
}
