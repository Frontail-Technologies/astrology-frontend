"use client";

import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { masterDataGroups, masterDataMeta } from "@/features/master-data/constants/master-data-entities";
import { useMasterDataCount } from "@/features/master-data/hooks/use-master-data-admin";
import type { MasterDataEntity } from "@/features/master-data/types/master-data-admin";
import { AdminSectionHeading } from "../shared/admin-section-heading";
import { masterDataIcons } from "./master-data-visuals";

/** Two `limit=1` reads per entity (active / inactive totals); nothing else is fetched for the overview. */
function EntityCard({ entity }: { entity: MasterDataEntity }) {
  const active = useMasterDataCount(entity, true);
  const inactive = useMasterDataCount(entity, false);
  const meta = masterDataMeta[entity];
  const Icon = masterDataIcons[entity];
  const failed = Boolean(active.error || inactive.error);
  const loaded = active.total !== null && inactive.total !== null;
  const total = loaded ? active.total! + inactive.total! : null;

  return (
    <Link
      href={`/admin/master-data/${entity}`}
      className="group block h-full rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
      aria-label={`${meta.plural}${total !== null ? `, ${total} entries` : ""}`}
    >
      <div className="flex h-full flex-col gap-3 rounded-xl border border-border bg-surface p-4 transition-colors group-hover:border-foreground/20">
        <div className="flex items-start justify-between gap-3">
          <span className="grid size-9 shrink-0 place-items-center rounded-lg bg-muted text-foreground/65">
            <Icon className="size-[18px]" aria-hidden="true" />
          </span>
          <span className="text-xl font-semibold tabular-nums" aria-hidden="true">
            {total ?? (failed ? "—" : "…")}
          </span>
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold leading-6 text-foreground">{meta.plural}</h3>
          <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">{meta.description}</p>
        </div>
        <div className="flex items-center justify-between gap-2 text-xs">
          {failed ? (
            <span className="text-destructive">Counts unavailable</span>
          ) : (
            <span className="text-muted-foreground tabular-nums">
              <span className="font-medium text-foreground">{active.total ?? "…"}</span> active · <span className="font-medium text-foreground">{inactive.total ?? "…"}</span> inactive
            </span>
          )}
          <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" aria-hidden="true" />
        </div>
      </div>
    </Link>
  );
}

export function AdminMasterDataOverview() {
  return (
    <section className="space-y-6">
      <h1 className="sr-only">Master data</h1>
      {masterDataGroups.map((group) => (
        <section key={group.label} className="space-y-3" aria-label={group.label}>
          <AdminSectionHeading title={group.label} />
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {group.entities.map((entity) => (
              <EntityCard key={entity} entity={entity} />
            ))}
          </div>
        </section>
      ))}
    </section>
  );
}
