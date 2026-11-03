"use client";

import Link from "next/link";
import { useMemo } from "react";
import { Eye, Pencil, Plus, Sparkles } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  astrologerModeLabels,
  availabilityLabels,
  availabilityVariants,
  verificationLabels,
  verificationVariants,
  visibilityLabels,
  visibilityVariants,
} from "@/features/astrologers/constants/astrologer-status";
import { useAstrologerList } from "@/features/astrologers/hooks/use-astrologer-admin";
import type { ManagedAstrologer } from "@/features/astrologers/types/astrologer-admin";
import { formatINR, getInitials } from "../../lib/format";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";

function pricingSummary(astrologer: ManagedAstrologer) {
  const enabled = astrologer.consultationModes.filter((mode) => mode.enabled);
  if (!enabled.length) return "No modes enabled";
  return enabled.map((mode) => `${astrologerModeLabels[mode.mode] ?? mode.mode} ${formatINR(mode.pricePaise)}`).join(" · ");
}

function experienceLabel(years: number) {
  return years === 1 ? "1 year" : `${years} years`;
}

function StatusPills({ astrologer }: { astrologer: ManagedAstrologer }) {
  return (
    <div className="flex flex-wrap items-center gap-1.5">
      <AdminStatusBadge status={astrologer.verificationStatus} labels={verificationLabels} variants={verificationVariants} />
      <AdminStatusBadge status={astrologer.visibilityStatus} labels={visibilityLabels} variants={visibilityVariants} />
      {astrologer.featured ? (
        <AdminStatusPill tone="neutral" dot={false}>
          Featured
        </AdminStatusPill>
      ) : null}
    </div>
  );
}

function AstrologerIdentity({ astrologer, linked = false }: { astrologer: ManagedAstrologer; linked?: boolean }) {
  const expertise = astrologer.expertise.map((item) => item.name).join(", ");
  return (
    <div className="flex min-w-0 items-center gap-3">
      <Avatar className="size-8 shrink-0">
        <AvatarFallback className="bg-accent text-xs font-semibold text-sidebar-primary">{getInitials(astrologer.displayName)}</AvatarFallback>
      </Avatar>
      <div className="min-w-0">
        {linked ? (
          <Link href={`/admin/astrologers/${astrologer.id}`} className="block truncate font-medium text-foreground hover:underline">
            {astrologer.displayName}
          </Link>
        ) : (
          <p className="truncate font-medium text-foreground">{astrologer.displayName}</p>
        )}
        <p className="truncate text-xs text-muted-foreground">{expertise || "No expertise set"}</p>
      </div>
    </div>
  );
}

function NewAstrologerButton() {
  return (
    <Button asChild variant="conversion" size="sm">
      <Link href="/admin/astrologers/new">
        <Plus aria-hidden="true" />
        New astrologer
      </Link>
    </Button>
  );
}

const rowActions = (astrologer: ManagedAstrologer) => [
  { label: "View profile", icon: Eye, href: `/admin/astrologers/${astrologer.id}` },
  { label: "Edit profile", icon: Pencil, href: `/admin/astrologers/${astrologer.id}/edit` },
];

/** Astrologers list. Admins create the phone sign-in account; the profile is verified and published from its page. */
export function AdminAstrologersView() {
  const list = useAstrologerList();
  const columns = useMemo<ColumnDef<ManagedAstrologer>[]>(
    () => [
      {
        id: "astrologer",
        header: "Astrologer",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-52">
            <AstrologerIdentity astrologer={row.original} />
          </div>
        ),
      },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <StatusPills astrologer={row.original} /> },
      {
        id: "availability",
        header: "Availability",
        enableSorting: false,
        cell: ({ row }) => <AdminStatusBadge status={row.original.availability} labels={availabilityLabels} variants={availabilityVariants} />,
      },
      { id: "pricing", header: "Pricing", enableSorting: false, cell: ({ row }) => <span className="text-sm tabular-nums text-muted-foreground">{pricingSummary(row.original)}</span> },
      { id: "languages", header: "Languages", enableSorting: false, cell: ({ row }) => <span className="text-sm text-muted-foreground">{row.original.languages.join(", ") || "Not set"}</span> },
      { id: "experience", header: "Experience", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{experienceLabel(row.original.experienceYears)}</span> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/astrologers/${row.original.id}`} label={`View ${row.original.displayName}`} icon={Eye} />
            <AdminRowActionLink href={`/admin/astrologers/${row.original.id}/edit`} label={`Edit ${row.original.displayName}`} icon={Pencil} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="Astrologers"
      description="Create astrologer accounts, then verify and publish their profiles."
      noun="astrologers"
      primaryAction={<NewAstrologerButton />}
      list={list}
      columns={columns}
      searchPlaceholder="Search by name or profile link…"
      filters={[
        { key: "verificationStatus", allLabel: "All verification", options: verificationLabels },
        { key: "visibilityStatus", allLabel: "All visibility", options: visibilityLabels },
      ]}
      initialColumnVisibility={{ languages: false, experience: false }}
      emptyLabel="No astrologers yet"
      emptyDescription="Create an account with the astrologer's mobile number to get started."
      emptyIcon={Sparkles}
      emptyAction={<NewAstrologerButton />}
      renderMobileCard={(astrologer) => (
        <article key={astrologer.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <AstrologerIdentity astrologer={astrologer} linked />
            <AdminRowActions label={`Actions for ${astrologer.displayName}`} actions={rowActions(astrologer)} className="-mr-1.5 shrink-0" />
          </div>
          <div className="mt-3 flex flex-wrap items-center gap-1.5">
            <StatusPills astrologer={astrologer} />
            <AdminStatusBadge status={astrologer.availability} labels={availabilityLabels} variants={availabilityVariants} />
          </div>
          <p className="mt-2 text-xs tabular-nums text-muted-foreground">
            {experienceLabel(astrologer.experienceYears)} · {pricingSummary(astrologer)}
          </p>
        </article>
      )}
    />
  );
}
