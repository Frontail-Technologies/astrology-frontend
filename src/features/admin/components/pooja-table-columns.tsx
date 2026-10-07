"use client";

import Link from "next/link";
import { Eye, ExternalLink, ImageOff, Pencil, Star, Trash2 } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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
import type { PoojaDefinition } from "@/features/pooja/types/pooja";
import { AdminDataTableColumnHeader } from "./shared/admin-data-table-column-header";

const statusVariant = {
  available: "online",
  "coming-soon": "pending",
} as const;

const managementStatusVariant = {
  draft: "pending",
  active: "online",
  archived: "muted",
} as const;

function PoojaThumbnail({ pooja }: { pooja: PoojaDefinition }) {
  return (
    <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--radius)-3px)] bg-muted text-muted-foreground">
      <ImageOff className="size-4" aria-hidden="true" />
      <img
        src={pooja.imageSrc}
        alt=""
        className="absolute inset-0 size-full object-cover"
        onError={(event) => {
          event.currentTarget.style.display = "none";
        }}
      />
    </div>
  );
}

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) {
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

function DeleteIntentButton({ pooja, onDelete }: { pooja: PoojaDefinition; onDelete: (pooja: PoojaDefinition) => void }) {
  const label = `Delete ${pooja.name}`;

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className="size-8 p-0 text-muted-foreground hover:text-destructive"
          aria-label={label}
          onClick={() => onDelete(pooja)}
        >
          <Trash2 aria-hidden="true" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  );
}

export function getPoojaTableColumns(
  onDelete: (pooja: PoojaDefinition) => void,
): ColumnDef<PoojaDefinition, unknown>[] {
  return [
    {
      accessorKey: "name",
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Pooja" />,
      enableHiding: false,
      cell: ({ row }) => {
        const pooja = row.original;
        return (
          <div className="flex min-w-[210px] items-center gap-3">
            <PoojaThumbnail pooja={pooja} />
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{pooja.name}</p>
              <p className="truncate text-xs text-muted-foreground">{pooja.slug}</p>
            </div>
          </div>
        );
      },
    },
    {
      accessorKey: "categories",
      header: "Categories",
      cell: ({ row }) => {
        const categories = row.original.categories;
        const remaining = categories.length - 2;
        return (
          <div className="min-w-[150px] text-sm text-muted-foreground">
            <span>{categories.slice(0, 2).map(getPoojaCategoryLabel).join(", ")}</span>
            {remaining > 0 ? <span className="ml-1 text-xs">+{remaining}</span> : null}
          </div>
        );
      },
    },
    {
      accessorKey: "status",
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Service status" />,
      enableHiding: false,
      cell: ({ row }) => {
        const status = row.original.status;
        return <Badge variant={statusVariant[status]}>{getPoojaStatusLabel(status)}</Badge>;
      },
    },
    {
      id: "featured",
      accessorFn: (pooja) => pooja.featured ?? false,
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Featured" />,
      cell: ({ row }) => row.original.featured ? (
        <span className="inline-flex items-center gap-1.5 text-sm text-muted-foreground">
          <Star className="size-3.5 fill-current text-primary" aria-hidden="true" />
          Featured
        </span>
      ) : <span className="text-muted-foreground">{"\u2014"}</span>,
    },
    {
      id: "contentCompleteness",
      accessorFn: (pooja) => getPoojaContentCompleteness(pooja).percentage,
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Content completeness" />,
      enableHiding: false,
      cell: ({ row }) => {
        const completeness = getPoojaContentCompleteness(row.original);
        return <span className="whitespace-nowrap text-sm text-muted-foreground">{completeness.percentage}% <span className="text-xs">{completeness.completed}/{completeness.total}</span></span>;
      },
    },
    {
      id: "estimatedDuration",
      accessorFn: (pooja) => pooja.management?.estimatedDurationMinutes,
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Estimated duration" />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatPoojaDuration(row.original.management?.estimatedDurationMinutes)}</span>,
    },
    {
      id: "price",
      accessorFn: (pooja) => pooja.management?.priceInPaise,
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Price" />,
      cell: ({ row }) => <span className="whitespace-nowrap text-muted-foreground">{formatPoojaPrice(row.original.management?.priceInPaise, row.original.management?.currency)}</span>,
    },
    {
      id: "ritualSteps",
      accessorFn: (pooja) => getPoojaRitualStepCount(pooja),
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Ritual steps" />,
      cell: ({ row }) => <span className="text-muted-foreground">{getPoojaRitualStepCount(row.original)}</span>,
    },
    {
      id: "requiredDetails",
      accessorFn: (pooja) => getPoojaRequiredDetailsCount(pooja),
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Required details" />,
      cell: ({ row }) => <span className="text-muted-foreground">{getPoojaRequiredDetailsCount(row.original)}</span>,
    },
    {
      id: "managementStatus",
      accessorFn: (pooja) => pooja.management?.managementStatus,
      header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Management status" />,
      cell: ({ row }) => {
        const status = row.original.management?.managementStatus;
        if (!status) return <span className="text-muted-foreground">{"\u2014"}</span>;
        return <Badge variant={managementStatusVariant[status]}>{getPoojaManagementStatusLabel(status)}</Badge>;
      },
    },
    {
      id: "actions",
      header: () => <span>Actions</span>,
      enableHiding: false,
      enableSorting: false,
      cell: ({ row }) => {
        const pooja = row.original;
        return (
          <div className="flex items-center justify-end gap-0.5">
            <IconLink href={`/admin/poojas/${pooja.slug}`} label={`View ${pooja.name}`}>
              <Eye className="size-4" aria-hidden="true" />
            </IconLink>
            <IconLink href={`/admin/poojas/${pooja.slug}/edit`} label={`Edit ${pooja.name}`}>
              <Pencil className="size-4" aria-hidden="true" />
            </IconLink>
            <IconLink href={`/pooja/${pooja.slug}`} label={`Open public page for ${pooja.name}`}>
              <ExternalLink className="size-4" aria-hidden="true" />
            </IconLink>
            <DeleteIntentButton pooja={pooja} onDelete={onDelete} />
          </div>
        );
      },
    },
  ];
}
