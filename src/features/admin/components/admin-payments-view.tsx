"use client";

import { useCopyToClipboard } from "../hooks/use-copy-to-clipboard";
import Link from "next/link";
import { useMemo, useState } from "react";
import { Check, Copy, Eye, Search } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";
import { toast } from "sonner";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AdminDataTable, AdminDataTableColumnVisibility } from "./shared/admin-data-table";
import { usePaymentRepository } from "@/features/payments/hooks/use-payment-repository";
import type { PaymentMethod, PaymentStatus, PaymentTransaction, PaymentType } from "@/features/payments/types/payment";

const typeLabels: Record<PaymentType, string> = { consultation: "Consultation", pooja: "Pooja", "store-order": "Store order" };
const methodLabels: Record<PaymentMethod, string> = { upi: "UPI", card: "Card", "net-banking": "Net Banking", wallet: "Wallet" };
const statusLabels: Record<PaymentStatus, string> = { success: "Success", pending: "Pending", failed: "Failed", refunded: "Refunded", "partially-refunded": "Partially refunded" };
const statusVariants: Record<PaymentStatus, "online" | "pending" | "unavailable" | "muted" | "verified"> = { success: "online", pending: "pending", failed: "unavailable", refunded: "muted", "partially-refunded": "verified" };
const money = (amount: number) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(amount / 100);
const date = (value: string) => new Intl.DateTimeFormat("en-IN", { dateStyle: "medium", timeStyle: "short" }).format(new Date(value));

export function AdminPaymentsView() {
  const { records, ready } = usePaymentRepository();
  const [query, setQuery] = useState(""); const [type, setType] = useState("all"); const [status, setStatus] = useState("all"); const [range, setRange] = useState("all");
  const { copied, copy } = useCopyToClipboard({ label: "Transaction ID" });
  const filtered = useMemo(() => records.filter((item) => { const since = range === "7d" ? Date.now() - 7 * 86400000 : range === "30d" ? Date.now() - 30 * 86400000 : 0; return (!query || `${item.id} ${item.customerName} ${item.referenceId}`.toLowerCase().includes(query.toLowerCase())) && (type === "all" || item.type === type) && (status === "all" || item.status === status) && (!since || new Date(item.createdAt).getTime() >= since); }), [query, range, records, status, type]);
  const columns = useMemo<ColumnDef<PaymentTransaction>[]>(() => [
    { id: "transaction", header: "Transaction", cell: ({ row }) => <div className="min-w-44"><div className="flex items-center gap-1"><span className="font-mono text-xs font-semibold">{row.original.id}</span><Button variant="ghost" size="sm" className="size-6 p-0 text-muted-foreground" aria-label={`Copy transaction ID ${row.original.id}`} title="Copy transaction ID" onClick={() => void copy(row.original.id)}>{copied === row.original.id ? <Check className="size-3.5" /> : <Copy className="size-3.5" />}</Button></div><p className="text-xs text-muted-foreground">{row.original.referenceId}</p></div> },
    { accessorKey: "customerName", header: "Customer", cell: ({ row }) => <Link className="font-medium hover:underline" href={`/admin/customers/${row.original.customerId}`}>{row.original.customerName}</Link> },
    { id: "type", header: "Type", cell: ({ row }) => typeLabels[row.original.type] },
    { id: "amount", header: "Amount", cell: ({ row }) => <span className="font-medium">{money(row.original.amountInPaise)}</span> },
    { id: "method", header: "Method", cell: ({ row }) => methodLabels[row.original.method] },
    { id: "status", header: "Status", cell: ({ row }) => <Badge variant={statusVariants[row.original.status]}>{statusLabels[row.original.status]}</Badge> },
    { id: "date", header: "Date", cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{date(row.original.createdAt)}</span> },
    { id: "reference", header: "Reference", cell: ({ row }) => <span className="font-mono text-xs">{row.original.referenceId}</span> },
    { id: "gateway", header: "Gateway", cell: ({ row }) => <span>{row.original.gateway ?? "-"}</span> },
    { id: "refunded", header: "Refunded", cell: ({ row }) => <span>{row.original.refundedAmountInPaise ? money(row.original.refundedAmountInPaise) : "-"}</span> },
    { id: "actions", header: "Actions", enableHiding: false, cell: ({ row }) => <div className="flex justify-end"><Link href={`/admin/payments/${row.original.id}`} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label={`View ${row.original.id}`} title="View payment"><Eye className="size-4" /></Link></div> },
  ], [copied]);
  if (!ready) return <div className="min-h-40" />;
  return <section className="space-y-4"><header className="flex items-end gap-3"><div><h1 className="font-sans text-xl font-semibold">Payments &amp; Transactions</h1><p className="text-sm text-muted-foreground">Review payment records and refund activity.</p></div></header><div className="hidden md:block"><AdminDataTable columns={columns} data={filtered} emptyState={<span>No payments match the current filters.</span>} initialColumnVisibility={{ reference: false, gateway: false, refunded: false }} toolbar={(table) => <div className="flex flex-wrap items-center gap-2"><div className="relative min-w-64 flex-1"><Search className="absolute left-3 top-2.5 size-4 text-muted-foreground" /><Input className="h-9 bg-surface pl-9" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search transaction, customer or reference" /></div><Select value={type} onValueChange={setType}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All types</SelectItem>{Object.entries(typeLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><Select value={status} onValueChange={setStatus}><SelectTrigger className="h-9 w-36 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All statuses</SelectItem>{Object.entries(statusLabels).map(([value, label]) => <SelectItem key={value} value={value}>{label}</SelectItem>)}</SelectContent></Select><Select value={range} onValueChange={setRange}><SelectTrigger className="h-9 w-32 bg-surface"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All dates</SelectItem><SelectItem value="7d">Last 7 days</SelectItem><SelectItem value="30d">Last 30 days</SelectItem></SelectContent></Select><AdminDataTableColumnVisibility table={table} /></div>} /></div><div className="grid gap-3 md:hidden">{filtered.map((item) => <Link key={item.id} href={`/admin/payments/${item.id}`} className="rounded-lg border border-border bg-surface p-4 shadow-sm"><div className="flex justify-between gap-3"><span className="font-mono text-xs font-semibold">{item.id}</span><Badge variant={statusVariants[item.status]}>{statusLabels[item.status]}</Badge></div><p className="mt-2 text-sm font-medium">{item.customerName}</p><div className="mt-2 flex justify-between text-xs text-muted-foreground"><span>{typeLabels[item.type]}</span><span className="font-medium text-foreground">{money(item.amountInPaise)}</span></div><p className="mt-2 text-xs text-muted-foreground">{date(item.createdAt)}</p></Link>)}</div></section>;
}
