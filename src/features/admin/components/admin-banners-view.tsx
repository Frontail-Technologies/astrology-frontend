"use client";

import { formatAdminDate } from "../lib/format";
import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Check, Copy, Eye, Pencil, Plus, Search, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { bannerRepository } from "@/features/banners/repositories/banner-repository";
import type { Banner, BannerPlacement, BannerStatus } from "@/features/banners/types/banner";

import { AdminDataTable, AdminDataTableColumnVisibility } from "./shared/admin-data-table";

const placements: Array<{ value: "all" | BannerPlacement; label: string }> = [{ value: "all", label: "All" }, { value: "homepage", label: "Homepage" }, { value: "store", label: "Store" }, { value: "pooja", label: "Poojas" }, { value: "consultation", label: "Consultations" }];
const placementLabels: Record<BannerPlacement, string> = { homepage: "Homepage", store: "Store", pooja: "Poojas", consultation: "Consultations" };
const statusLabels: Record<BannerStatus, string> = { active: "Active", draft: "Draft", scheduled: "Scheduled", inactive: "Inactive", expired: "Expired" };
const statusVariant = (status: BannerStatus) => status === "active" ? "online" : status === "scheduled" ? "pending" : "muted";
const adminPrimaryClass = "!bg-primary !text-primary-foreground hover:!bg-primary/90";
const formatSchedule = (banner: Banner) => banner.startsAt || banner.endsAt ? `${formatAdminDate(banner.startsAt)} - ${formatAdminDate(banner.endsAt)}` : "No schedule";

export function AdminBannersView() {
  const [data, setData] = useState<Banner[]>([]);
  const [query, setQuery] = useState("");
  const [placement, setPlacement] = useState<"all" | BannerPlacement>("all");
  const [status, setStatus] = useState("all");
  const [target, setTarget] = useState<Banner | null>(null);
  const load = () => bannerRepository.list().then(setData);
  const { copied, copy: copyLink } = useCopyToClipboard({ label: "Banner link" });

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => data.filter((banner) => (!query || `${banner.title ?? ""} ${banner.id}`.toLowerCase().includes(query.toLowerCase())) && (placement === "all" || banner.placement === placement) && (status === "all" || banner.status === status)), [data, placement, query, status]);
  const columns = useMemo<ColumnDef<Banner>[]>(() => [
    { id: "banner", header: "Banner", cell: ({ row }) => <div className="flex min-w-64 items-center gap-3"><img src={row.original.imageSrc} alt="" className="h-10 w-16 shrink-0 rounded-md border border-border object-cover" /><div className="min-w-0"><p className="truncate font-medium">{row.original.title || "Untitled banner"}</p><p className="truncate text-xs text-muted-foreground">{row.original.id}</p></div></div> },
    { id: "placement", header: "Placement", cell: ({ row }) => placementLabels[row.original.placement] },
    { id: "link", header: "Link", cell: ({ row }) => row.original.linkUrl ? <div className="flex max-w-48 items-center gap-1"><span className="truncate text-xs text-muted-foreground">{row.original.linkUrl}</span><Button variant="ghost" size="sm" className="size-6 shrink-0 p-0 text-muted-foreground" aria-label={`Copy banner link ${row.original.linkUrl}`} title="Copy banner link" onClick={() => void copyLink(row.original.linkUrl!)}>{copied === row.original.linkUrl ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}</Button></div> : <span className="text-muted-foreground">-</span> },
    { id: "schedule", header: "Schedule", cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatSchedule(row.original)}</span> },
    { id: "status", header: "Status", cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{statusLabels[row.original.status]}</Badge> },
    { id: "actions", header: "Actions", enableHiding: false, cell: ({ row }) => <div className="flex items-center justify-end gap-1"><Link href={`/admin/banners/${row.original.id}`} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label={`View ${row.original.title || "banner"}`} title="View banner"><Eye className="size-4" /></Link><Link href={`/admin/banners/${row.original.id}/edit`} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label={`Edit ${row.original.title || "banner"}`} title="Edit banner"><Pencil className="size-4" /></Link><Button variant="ghost" size="sm" className="size-8 p-0 text-destructive hover:text-destructive" aria-label={`Delete ${row.original.title || "banner"}`} title="Delete banner" onClick={() => setTarget(row.original)}><Trash2 /></Button></div> },
  ], [copied]);

  return <section className="space-y-4"><header className="flex flex-wrap items-end justify-between gap-3"><div className="flex items-center gap-3"><div><h1 className="font-sans text-xl font-semibold">Banners & Promotions</h1><p className="text-sm text-muted-foreground">Manage banner placements and promotions.</p></div></div><Link href="/admin/banners/new"><Button size="sm" className={adminPrimaryClass}><Plus />New Banner</Button></Link></header><Tabs value={placement} onValueChange={(value) => setPlacement(value as "all" | BannerPlacement)}><TabsList variant="line"><>{placements.map((item) => <TabsTrigger key={item.value} value={item.value} >{item.label}</TabsTrigger>)}</></TabsList></Tabs><AdminDataTable columns={columns} data={filtered} emptyState={<span>No banners match the current filters.</span>} toolbar={(table) => <div className="flex flex-wrap items-center gap-2"><div className="relative min-w-64 flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-9 bg-surface pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search banners" /></div><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><AdminDataTableColumnVisibility table={table} /></div>} /><AlertDialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete banner?</AlertDialogTitle><AlertDialogDescription>This removes the banner from the catalog.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { if (target) { await bannerRepository.delete(target.id); toast.success("Banner deleted"); setTarget(null); load(); } }}>Delete banner</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></section>;
}
