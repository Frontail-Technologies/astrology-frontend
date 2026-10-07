"use client";

import Link from "next/link";
import { Eye, ExternalLink, Pencil, Trash2 } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { availabilityLabel } from "@/features/astrologers/data/astrologers";
import {
  formatAstrologerExperience,
  formatAstrologerRating,
  formatAstrologerStartingPrice,
  getAstrologerManagementStatus,
} from "@/features/astrologers/selectors/astrologer-domain";
import type { AstrologerListItem, AstrologerManagementStatus, AstrologerVerificationStatus } from "@/features/astrologers/types/astrologer";
import { AdminDataTableColumnHeader } from "./shared/admin-data-table-column-header";

const managementStatusPresentation: Record<AstrologerManagementStatus, { label: string; variant: "default" | "online" | "pending" | "unavailable" }> = {
  draft: { label: "Draft", variant: "pending" },
  active: { label: "Active", variant: "online" },
  suspended: { label: "Suspended", variant: "unavailable" },
  archived: { label: "Archived", variant: "default" },
};

const verificationStatusPresentation: Record<AstrologerVerificationStatus, { label: string; variant: "default" | "verified" | "pending" | "unavailable" }> = {
  unverified: { label: "Unverified", variant: "default" },
  pending: { label: "Pending", variant: "pending" },
  verified: { label: "Verified", variant: "verified" },
  rejected: { label: "Rejected", variant: "unavailable" },
};

function IconLink({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Link
          href={href}
          aria-label={label}
          className="inline-flex size-8 items-center justify-center rounded-[calc(var(--radius)-2px)] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        >
          {children}
        </Link>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

function DeleteIntentButton({
  astrologer,
  onDelete,
}: {
  astrologer: AstrologerListItem;
  onDelete: (astrologer: AstrologerListItem) => void;
}) {
  const label = `Delete ${astrologer.name}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-0 text-muted-foreground hover:text-destructive"
          aria-label={label}
          onClick={() => onDelete(astrologer)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function getAstrologerTableColumns(
  onDelete: (astrologer: AstrologerListItem) => void,
): ColumnDef<AstrologerListItem, any>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Astrologer" />,
      enableHiding: false,
      cell: ({ row }) => {
        const astrologer = row.original;
        return (
          <div className="flex min-w-[190px] items-center gap-3">
            <Avatar>
              <AvatarImage src={astrologer.avatarSrc} alt={astrologer.name} />
              <AvatarFallback>{astrologer.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{astrologer.name}</p>
              <p className="truncate text-xs text-muted-foreground">{astrologer.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "primaryExpertise",
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Primary expertise" />,
      enableHiding: false,
      cell: ({ row }) => <span className="font-medium text-foreground">{row.original.primaryExpertise}</span>,
    },
    {
      accessorKey: "specialties",
      header: "Specialties",
      cell: ({ row }) => {
        const specialties = row.original.specialties;
        const remaining = specialties.length - 2;
        return (
          <div className="flex flex-col gap-0.5 text-muted-foreground">
            <span>{specialties.slice(0, 2).join(", ")}</span>
            {remaining > 0 ? <span className="text-xs text-muted-foreground/70">+{remaining}</span> : null}
          </div>
        );
      },
    },
    {
      accessorKey: "languages",
      header: "Languages",
      cell: ({ row }) => <span className="text-muted-foreground">{row.original.languages.join(", ")}</span>,
    },
    {
      accessorKey: "availability",
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Booking availability" />,
      enableHiding: false,
      cell: ({ row }) => {
        const availability = row.original.availability;
        return (
          <Badge className="min-h-5 px-1.5 py-0 text-[11px]" variant={availability === "bookable" ? "online" : "muted"}>
            {availabilityLabel(availability)}
          </Badge>
        );
      },
    },
    {
      accessorKey: "experienceYears",
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Experience" />,
      enableHiding: false,
      cell: ({ row }) => <span className="text-muted-foreground">{formatAstrologerExperience(row.original.experienceYears)}</span>,
    },
    {
      id: "managementStatus",
      accessorFn: (astrologer) => getAstrologerManagementStatus(astrologer),
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Management status" />,
      enableHiding: false,
      cell: ({ row }) => {
        const status = getAstrologerManagementStatus(row.original);
        if (!status) return <span className="text-muted-foreground">{"\u2014"}</span>;
        const presentation = managementStatusPresentation[status];
        return <Badge className="min-h-5 px-1.5 py-0 text-[11px]" variant={presentation.variant}>{presentation.label}</Badge>;
      },
    },
    {
      id: "rating",
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Rating" />,
      enableHiding: false,
      cell: () => <span className="text-muted-foreground">{formatAstrologerRating()}</span>,
    },
    {
      id: "startingPrice",
      header: "Starting price",
      cell: ({ row }) => <span className="text-muted-foreground">{formatAstrologerStartingPrice(row.original.consultationPricing)}</span>,
    },
    {
      id: "liveAvailability",
      header: "Live availability",
      cell: () => <span className="text-muted-foreground">Not connected</span>,
    },
    {
      id: "verification",
      header: "Verification",
      cell: ({ row }) => {
        const status = row.original.management?.verificationStatus;
        if (!status) return <span className="text-muted-foreground">{"\u2014"}</span>;
        const presentation = verificationStatusPresentation[status];
        return <Badge className="min-h-5 px-1.5 py-0 text-[11px]" variant={presentation.variant}>{presentation.label}</Badge>;
      },
    },
    {
      id: "actions",
      header: () => <span>Actions</span>,
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const astrologer = row.original;
        return (
          <div className="flex items-center justify-end gap-0.5">
            <IconLink href={`/admin/astrologers/${astrologer.slug}`} label={`View ${astrologer.name}`}>
              <Eye className="size-4" aria-hidden="true" />
            </IconLink>
            <IconLink href={`/admin/astrologers/${astrologer.slug}/edit`} label={`Edit ${astrologer.name}`}>
              <Pencil className="size-4" aria-hidden="true" />
            </IconLink>
            <IconLink href={`/astrologer/${astrologer.slug}`} label={`Open public profile for ${astrologer.name}`}>
              <ExternalLink className="size-4" aria-hidden="true" />
            </IconLink>
            <DeleteIntentButton astrologer={astrologer} onDelete={onDelete} />
          </div>
        );
      },
    },
  ];
}
