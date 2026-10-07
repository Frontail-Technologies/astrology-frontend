"use client";

import Link from "next/link";
import { Eye, ExternalLink, ImageOff, Pencil, Trash2 } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { getCalculatorCatalogStatusLabel, getCalculatorCategoryLabel, getCalculatorEngineStateLabel, getCalculatorImplementationState, getCalculatorImplementationStateLabel, hasCalculatorPublicRoute } from "@/features/calculators/selectors/calculator-domain";
import type { CalculatorDefinition } from "@/features/calculators/types/calculator";
import { AdminDataTableColumnHeader } from "./shared/admin-data-table-column-header";

function IconLink({ href, label, children }: { href: string; label: string; children: React.ReactNode }) { return <Tooltip><TooltipTrigger asChild><Link href={href} aria-label={label} className="inline-flex size-8 items-center justify-center rounded-[calc(var(--radius)-2px)] text-muted-foreground outline-none transition-colors hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring">{children}</Link></TooltipTrigger><TooltipContent>{label}</TooltipContent></Tooltip>; }
function Thumbnail({ calculator }: { calculator: CalculatorDefinition }) { return <div className="relative flex size-11 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--radius)-3px)] bg-muted text-muted-foreground"><ImageOff className="size-4" aria-hidden="true" /><img src={calculator.imageSrc} alt="" className="absolute inset-0 size-full object-cover" onError={(event) => { event.currentTarget.style.display = "none"; }} /></div>; }

export function getCalculatorTableColumns(onDelete: (calculator: CalculatorDefinition) => void): ColumnDef<CalculatorDefinition, unknown>[] {
  return [
    { accessorKey: "name", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Calculator" />, enableHiding: false, cell: ({ row }) => <div className="flex min-w-[210px] items-center gap-3"><Thumbnail calculator={row.original} /><div className="min-w-0"><p className="truncate font-medium text-foreground">{row.original.name}</p><p className="truncate text-xs text-muted-foreground">{row.original.slug}</p></div></div> },
    { accessorKey: "category", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Category" />, enableHiding: false, cell: ({ row }) => <span className="text-muted-foreground">{getCalculatorCategoryLabel(row.original.category)}</span> },
    { accessorKey: "status", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Catalog status" />, enableHiding: false, cell: ({ row }) => <Badge variant={row.original.status === "available" ? "online" : "pending"}>{getCalculatorCatalogStatusLabel(row.original.status)}</Badge> },
    { id: "uiState", accessorFn: getCalculatorImplementationState, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="UI state" />, enableHiding: false, cell: ({ row }) => <Badge variant={getCalculatorImplementationState(row.original) === "partial" ? "verified" : "muted"}>{getCalculatorImplementationStateLabel(getCalculatorImplementationState(row.original))}</Badge> },
    { id: "engine", header: "Engine", enableSorting: false, cell: () => <span className="text-muted-foreground">{getCalculatorEngineStateLabel()}</span> },
    { accessorKey: "shortDescription", header: "Short description", cell: ({ row }) => <span className="block max-w-[280px] truncate text-muted-foreground">{row.original.shortDescription}</span> },
    { accessorKey: "slug", header: "Slug", cell: ({ row }) => <span className="font-mono text-xs text-muted-foreground">{row.original.slug}</span> },
    { id: "actions", header: () => <span>Actions</span>, enableHiding: false, enableSorting: false, cell: ({ row }) => { const calculator = row.original; return <div className="flex items-center justify-end gap-0.5"><IconLink href={`/admin/calculators/${calculator.slug}`} label={`View ${calculator.name}`}><Eye className="size-4" aria-hidden="true" /></IconLink><IconLink href={`/admin/calculators/${calculator.slug}/edit`} label={`Edit ${calculator.name}`}><Pencil className="size-4" aria-hidden="true" /></IconLink>{hasCalculatorPublicRoute(calculator) ? <IconLink href={`/calculators/${calculator.slug}`} label={`Open public page for ${calculator.name}`}><ExternalLink className="size-4" aria-hidden="true" /></IconLink> : null}<Tooltip><TooltipTrigger asChild><Button variant="ghost" size="sm" className="size-8 p-0 text-muted-foreground hover:text-destructive" aria-label={`Delete ${calculator.name}`} onClick={() => onDelete(calculator)}><Trash2 aria-hidden="true" /></Button></TooltipTrigger><TooltipContent>Delete {calculator.name}</TooltipContent></Tooltip></div>; } },
  ];
}
