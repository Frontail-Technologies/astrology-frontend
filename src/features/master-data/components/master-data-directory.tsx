"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pencil, Plus, Search, Trash2 } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { toast } from "sonner";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button, buttonVariants } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminDataTable, AdminDataTableColumnVisibility } from "@/features/admin/components/shared/admin-data-table";
import { AdminDataTableColumnHeader } from "@/features/admin/components/shared/admin-data-table-column-header";
import { masterDataLabels } from "../data/master-data";
import { useMasterDataRepository } from "../hooks/use-master-data-repository";
import type { CityRecord, CountryRecord, LanguageRecord, MasterDataRecord, MasterDataType, StateRecord } from "../types/master-data";
import { canDeleteMasterData, getMasterDataUsage } from "../utils/master-data";
import { MasterDataCopyCode } from "./master-data-copy-code";
import { MasterDataStatusBadge } from "./master-data-status-badge";
import { MasterDataSubnav } from "./master-data-subnav";
import { getMasterDataIcon, masterDataVisuals } from "./master-data-visuals";

const formatDate = (value: string) => new Intl.DateTimeFormat("en-IN", { day: "2-digit", month: "short", year: "numeric" }).format(new Date(value));

export function MasterDataDirectory({ type }: { type: MasterDataType }) {
  const repository = useMasterDataRepository();
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [target, setTarget] = useState<MasterDataRecord | null>(null);
  const records = repository.list(type) as MasterDataRecord[];
  const visual = masterDataVisuals[type];
  const filtered = records.filter((record) => (
    (!query || record.name.toLowerCase().includes(query.toLowerCase()) || ("slug" in record && record.slug.includes(query.toLowerCase())) || ("code" in record && record.code.toLowerCase().includes(query.toLowerCase())))
    && (status === "all" || record.status === status)
  ));
  const maxUsage = Math.max(1, ...records.map((record) => getMasterDataUsage(type, record.id, repository.data).count));

  const locationSecondary = (record: MasterDataRecord) => {
    if (type === "states") return repository.data.countries.find((country) => country.id === (record as StateRecord).countryId)?.name;
    if (type === "cities") {
      const state = repository.data.states.find((item) => item.id === (record as CityRecord).stateId);
      const country = repository.data.countries.find((item) => item.id === state?.countryId);
      return [state?.name, country?.name].filter(Boolean).join(" · ");
    }
    return "slug" in record ? record.slug : "code" in record ? record.code : record.id;
  };
  const identity = (record: MasterDataRecord) => {
    const Icon = getMasterDataIcon(type, record);
    return <div className="flex min-w-56 items-center gap-3"><span className={`grid size-9 shrink-0 place-items-center rounded-md ${visual.tileClass} ${visual.iconClass}`}><Icon className="size-4" aria-hidden="true" /></span><div className="min-w-0"><p className="truncate font-medium">{record.name}</p><p className="truncate text-xs text-muted-foreground">{locationSecondary(record)}</p></div></div>;
  };
  const actions = (record: MasterDataRecord) => <div className="flex w-full items-center justify-end gap-1"><Link href={`/admin/master-data/${type}/${record.id}/edit`} className="grid size-8 place-items-center rounded-md text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" aria-label={`Edit ${record.name}`} title="Edit"><Pencil className="size-4" /></Link><Button variant="ghost" size="sm" className="size-8 p-0 text-muted-foreground hover:text-destructive" onClick={() => setTarget(record)} aria-label={`Delete ${record.name}`} title="Delete"><Trash2 className="size-4" /></Button></div>;
  const usage = (record: MasterDataRecord) => {
    const result = getMasterDataUsage(type, record.id, repository.data);
    return <div className="min-w-20"><div className="flex items-baseline gap-1"><span className="font-medium tabular-nums">{result.count}</span><span className="text-xs text-muted-foreground">{result.label}</span></div>{result.count > 0 ? <div className="mt-1 h-1 w-16 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${visual.barClass}`} style={{ width: `${Math.round((result.count / maxUsage) * 100)}%` }} /></div> : null}</div>;
  };

  const columns = useMemo<ColumnDef<MasterDataRecord>[]>(() => {
    const statusColumn: ColumnDef<MasterDataRecord> = { id: "status", accessorFn: (row) => row.status, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Status" />, cell: ({ row }) => <MasterDataStatusBadge status={row.original.status} /> };
    const actionColumn: ColumnDef<MasterDataRecord> = { id: "actions", header: () => <span>Actions</span>, enableHiding: false, enableSorting: false, cell: ({ row }) => actions(row.original) };
    if (type === "languages") return [
      { id: "language", accessorFn: (row) => row.name, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Language" />, cell: ({ row }) => identity(row.original) },
      { id: "nativeName", accessorFn: (row) => (row as LanguageRecord).nativeName, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Native name" />, cell: ({ row }) => (row.original as LanguageRecord).nativeName },
      { id: "code", accessorFn: (row) => (row as LanguageRecord).code, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Code" />, cell: ({ row }) => <MasterDataCopyCode value={(row.original as LanguageRecord).code} label="language code" /> },
      { id: "direction", accessorFn: (row) => (row as LanguageRecord).direction, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Direction" />, cell: ({ row }) => <Badge variant="outline">{(row.original as LanguageRecord).direction.toUpperCase()}</Badge> },
      { id: "default", accessorFn: (row) => Number((row as LanguageRecord).isDefault), header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Default" />, cell: ({ row }) => (row.original as LanguageRecord).isDefault ? <Badge variant="saffron">Default</Badge> : <span className="text-muted-foreground">-</span> }, statusColumn,
      { id: "sortOrder", accessorFn: (row) => row.sortOrder, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Sort order" />, cell: ({ row }) => row.original.sortOrder }, actionColumn,
    ];
    if (type === "countries") return [
      { id: "country", accessorFn: (row) => row.name, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Country" />, cell: ({ row }) => identity(row.original) },
      { id: "iso", accessorFn: (row) => (row as CountryRecord).isoCode, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="ISO" />, cell: ({ row }) => <MasterDataCopyCode value={(row.original as CountryRecord).isoCode} label="ISO code" /> },
      { id: "phone", accessorFn: (row) => (row as CountryRecord).phoneCode ?? "", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Phone code" />, cell: ({ row }) => (row.original as CountryRecord).phoneCode ? <MasterDataCopyCode value={(row.original as CountryRecord).phoneCode!} label="phone code" /> : <span className="text-muted-foreground">-</span> },
      { id: "states", accessorFn: (row) => getMasterDataUsage(type, row.id, repository.data).count, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="States" />, cell: ({ row }) => usage(row.original) }, statusColumn, actionColumn,
    ];
    if (type === "states") return [
      { id: "state", accessorFn: (row) => row.name, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="State" />, cell: ({ row }) => identity(row.original) },
      { id: "code", accessorFn: (row) => (row as StateRecord).code, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Code" />, cell: ({ row }) => <MasterDataCopyCode value={(row.original as StateRecord).code} label="state code" /> },
      { id: "country", accessorFn: (row) => repository.data.countries.find((country) => country.id === (row as StateRecord).countryId)?.name ?? "", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Country" />, cell: ({ row }) => repository.data.countries.find((country) => country.id === (row.original as StateRecord).countryId)?.name ?? "Unknown" },
      { id: "cities", accessorFn: (row) => getMasterDataUsage(type, row.id, repository.data).count, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Cities" />, cell: ({ row }) => usage(row.original) }, statusColumn, actionColumn,
    ];
    if (type === "cities") return [
      { id: "city", accessorFn: (row) => row.name, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="City" />, cell: ({ row }) => identity(row.original) },
      { id: "state", accessorFn: (row) => repository.data.states.find((state) => state.id === (row as CityRecord).stateId)?.name ?? "", header: ({ column }) => <AdminDataTableColumnHeader column={column} label="State" />, cell: ({ row }) => repository.data.states.find((state) => state.id === (row.original as CityRecord).stateId)?.name ?? "Unknown" },
      { id: "country", accessorFn: (row) => { const state = repository.data.states.find((item) => item.id === (row as CityRecord).stateId); return repository.data.countries.find((country) => country.id === state?.countryId)?.name ?? ""; }, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Country" />, cell: ({ row }) => { const state = repository.data.states.find((item) => item.id === (row.original as CityRecord).stateId); return repository.data.countries.find((country) => country.id === state?.countryId)?.name ?? "Unknown"; } }, statusColumn, actionColumn,
    ];
    return [
      { id: "identity", accessorFn: (row) => row.name, header: ({ column }) => <AdminDataTableColumnHeader column={column} label={masterDataLabels[type].singular} />, cell: ({ row }) => identity(row.original) },
      { id: "usage", accessorFn: (row) => getMasterDataUsage(type, row.id, repository.data).count, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Usage" />, cell: ({ row }) => usage(row.original) }, statusColumn,
      { id: "sortOrder", accessorFn: (row) => row.sortOrder, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Sort order" />, cell: ({ row }) => row.original.sortOrder },
      { id: "updated", accessorFn: (row) => row.updatedAt, header: ({ column }) => <AdminDataTableColumnHeader column={column} label="Updated" />, cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatDate(row.original.updatedAt)}</span> }, actionColumn,
    ];
  }, [maxUsage, repository.data, type]);

  const blocked = target ? !canDeleteMasterData(type, target.id, repository.data) : false;
  const targetUsage = target ? getMasterDataUsage(type, target.id, repository.data) : null;
  return <section className="space-y-4"><header className="flex flex-wrap items-end justify-between gap-3"><div className="flex items-center gap-3"><div><Link href="/admin/master-data" className="text-xs text-muted-foreground hover:text-foreground">Master Data</Link><div className="flex items-center gap-2"><h1 className="font-sans text-xl font-semibold">{masterDataLabels[type].plural}</h1><span className="text-sm text-muted-foreground">{records.length}</span></div><p className="text-sm text-muted-foreground">{masterDataLabels[type].description}</p></div></div><Link href={`/admin/master-data/${type}/new`} className={buttonVariants({ variant: "conversion", size: "sm" })}><Plus />Add {masterDataLabels[type].singular}</Link></header><MasterDataSubnav type={type} /><div className="hidden md:block"><AdminDataTable data={filtered} columns={columns} emptyState={<span>No records match the current filters.</span>} toolbar={(table) => <div className="flex flex-wrap items-center gap-2"><div className="relative min-w-56 flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-9 bg-surface pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder={`Search ${masterDataLabels[type].plural.toLowerCase()}`} /></div><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select><AdminDataTableColumnVisibility table={table} /></div>} /></div><div className="space-y-3 md:hidden"><div className="relative"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-9 bg-surface pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search" /></div><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-full bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem><SelectItem value="active">Active</SelectItem><SelectItem value="inactive">Inactive</SelectItem></SelectContent></Select>{filtered.map((record) => <Card key={record.id}><CardContent className="p-3"><div className="flex items-start justify-between gap-2">{identity(record)}<MasterDataStatusBadge status={record.status} /></div><div className="mt-2 flex items-center justify-between border-t border-border pt-2">{usage(record)}{actions(record)}</div></CardContent></Card>)}</div><AlertDialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>{blocked ? `Cannot delete ${target?.name}` : `Delete ${target?.name}?`}</AlertDialogTitle><AlertDialogDescription>{blocked ? `This item is currently used by ${targetUsage?.count} ${targetUsage?.label} and cannot be deleted.` : "This removes the item from Master Data."}</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>{blocked ? "Close" : "Cancel"}</AlertDialogCancel>{!blocked ? <AlertDialogAction onClick={() => { if (target) { repository.remove(type, target.id); toast.success(`${masterDataLabels[type].singular} deleted`); setTarget(null); } }}>Delete</AlertDialogAction> : null}</AlertDialogFooter></AlertDialogContent></AlertDialog></section>;
}
