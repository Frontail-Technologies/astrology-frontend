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
import { couponRepository } from "@/features/coupons/repositories/coupon-repository";
import type { Coupon, CouponStatus } from "@/features/coupons/types/coupon";

import { AdminDataTable, AdminDataTableColumnVisibility } from "./shared/admin-data-table";

const statusLabels: Record<CouponStatus, string> = { active: "Active", draft: "Draft", scheduled: "Scheduled", inactive: "Inactive", expired: "Expired" };
const statusVariant = (status: CouponStatus) => status === "active" ? "online" : status === "scheduled" ? "pending" : "muted";
const formatValidity = (coupon: Coupon) => coupon.startsAt || coupon.endsAt ? `${formatAdminDate(coupon.startsAt)} - ${formatAdminDate(coupon.endsAt)}` : "Always available";
const formatDiscount = (coupon: Coupon) => coupon.discountType === "percentage" ? `${coupon.discountValue}%` : new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(coupon.discountValue / 100);
const adminPrimaryClass = "!bg-primary !text-primary-foreground hover:!bg-primary/90";

export function AdminCouponsView() {
  const [data, setData] = useState<Coupon[]>([]);
  const [query, setQuery] = useState("");
  const [type, setType] = useState("all");
  const [status, setStatus] = useState("all");
  const [target, setTarget] = useState<Coupon | null>(null);
  const load = () => couponRepository.list().then(setData);
  const { copied, copy: copyCode } = useCopyToClipboard({ label: "Coupon code" });

  useEffect(() => { load(); }, []);

  const filtered = useMemo(() => data.filter((coupon) => (!query || `${coupon.code} ${coupon.title}`.toLowerCase().includes(query.toLowerCase())) && (type === "all" || coupon.discountType === type) && (status === "all" || coupon.status === status)), [data, query, status, type]);
  const columns = useMemo<ColumnDef<Coupon>[]>(() => [
    { id: "coupon", header: "Coupon", cell: ({ row }) => <div className="flex min-w-48 items-center gap-2.5"><span className="size-2 shrink-0 rounded-full" style={{ backgroundColor: row.original.color ?? "var(--primary)" }} aria-hidden="true" /><div className="min-w-0"><div className="flex items-center gap-1"><span className="font-mono text-xs font-semibold tracking-wide">{row.original.code}</span><Button variant="ghost" size="sm" className="size-6 p-0 text-muted-foreground" aria-label={`Copy coupon code ${row.original.code}`} title="Copy coupon code" onClick={() => void copyCode(row.original.code)}>{copied === row.original.code ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}</Button></div><p className="truncate text-xs text-muted-foreground">{row.original.title}</p></div></div> },
    { id: "type", header: "Type", cell: ({ row }) => <span>{row.original.discountType === "flat" ? "Flat amount" : "Percentage"}</span> },
    { id: "discount", header: "Discount", cell: ({ row }) => <span className="font-medium">{formatDiscount(row.original)}</span> },
    { id: "usage", header: "Usage", cell: ({ row }) => <span>{row.original.usageLimit ? `${row.original.usageCount} / ${row.original.usageLimit}` : "No limit"}</span> },
    { id: "validity", header: "Validity", cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{formatValidity(row.original)}</span> },
    { id: "status", header: "Status", cell: ({ row }) => <Badge variant={statusVariant(row.original.status)}>{statusLabels[row.original.status]}</Badge> },
    { id: "actions", header: "Actions", enableHiding: false, cell: ({ row }) => <div className="flex items-center justify-end gap-1"><Link href={`/admin/coupons/${row.original.id}`} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label={`View ${row.original.code}`} title="View coupon"><Eye className="size-4" /></Link><Link href={`/admin/coupons/${row.original.id}/edit`} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label={`Edit ${row.original.code}`} title="Edit coupon"><Pencil className="size-4" /></Link><Button variant="ghost" size="sm" className="size-8 p-0 text-destructive hover:text-destructive" aria-label={`Delete ${row.original.code}`} title="Delete coupon" onClick={() => setTarget(row.original)}><Trash2 /></Button></div> },
  ], [copied]);

  return <section className="space-y-4"><header className="flex flex-wrap items-end justify-between gap-3"><div className="flex items-center gap-3"><div><h1 className="font-sans text-xl font-semibold">Coupons & Offers</h1><p className="text-sm text-muted-foreground">Manage discount coupons and promotional offers.</p></div></div><Link href="/admin/coupons/new"><Button size="sm" className={adminPrimaryClass}><Plus />New Coupon</Button></Link></header><AdminDataTable columns={columns} data={filtered} emptyState={<span>No coupons match the current filters.</span>} toolbar={(table) => <div className="flex flex-wrap items-center gap-2"><div className="relative min-w-64 flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-9 bg-surface pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search by code or offer" /></div><Select value={type} onValueChange={setType}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem><SelectItem value="percentage">Percentage</SelectItem><SelectItem value="flat">Flat amount</SelectItem></SelectContent></Select><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><AdminDataTableColumnVisibility table={table} /></div>} /><AlertDialog open={Boolean(target)} onOpenChange={(open) => !open && setTarget(null)}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Delete {target?.code}?</AlertDialogTitle><AlertDialogDescription>This removes the coupon from the catalog.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel>Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { if (target) { await couponRepository.delete(target.id); toast.success("Coupon deleted"); setTarget(null); load(); } }}>Delete coupon</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog></section>;
}
