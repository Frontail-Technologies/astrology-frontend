"use client";

import Link from "next/link";
import { useMemo } from "react";
import { notFound } from "next/navigation";
import { AlertTriangle, Eye, Wallet as WalletIcon } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useWalletRepository } from "@/features/finance/hooks/use-finance-repositories";
import type { Wallet, WalletTransaction } from "@/features/finance/types/finance";
import { cn } from "@/lib/utils";
import { AdminDetailStickyRail } from "./shared/admin-detail-sticky-rail";
import { AdminMetricCard } from "./shared/admin-metric-card";
import { AdminListScaffold, AdminPageHeader, DetailRow, dateTime, money } from "./shared/admin-list-scaffold";

const kindLabels: Record<WalletTransaction["kind"], string> = { topup: "Top-up", consultation: "Consultation", refund: "Refund", adjustment: "Adjustment" };
const kindVariants: Record<WalletTransaction["kind"], "online" | "muted" | "verified" | "gold"> = { topup: "online", consultation: "muted", refund: "verified", adjustment: "gold" };
const balanceBands = { empty: "Empty", low: "Below ₹100", funded: "₹100 and above" };
const band = (balance: number) => (balance === 0 ? "empty" : balance < 10000 ? "low" : "funded");

export function AdminWalletsView() {
  const { records, ready } = useWalletRepository();
  const total = useMemo(() => records.reduce((sum, item) => sum + item.balanceInPaise, 0), [records]);
  const empty = records.filter((item) => item.balanceInPaise === 0).length;

  const columns = useMemo<ColumnDef<Wallet>[]>(() => [
    { accessorKey: "customerName", header: "Customer", cell: ({ row }) => <div><Link className="font-medium hover:underline" href={`/admin/customers/${row.original.customerId}`}>{row.original.customerName}</Link><p className="text-xs text-muted-foreground">{row.original.phone}</p></div> },
    { id: "balance", header: "Balance", cell: ({ row }) => <span className={cn("font-medium", row.original.balanceInPaise === 0 && "text-muted-foreground")}>{money(row.original.balanceInPaise)}</span> },
    { id: "last", header: "Last activity", cell: ({ row }) => <span className="text-xs">{row.original.transactions[0]?.description ?? "-"}</span> },
    { id: "updated", header: "Updated", cell: ({ row }) => <span className="whitespace-nowrap text-xs text-muted-foreground">{dateTime(row.original.updatedAt)}</span> },
    { id: "actions", header: "Actions", enableHiding: false, cell: ({ row }) => <div className="flex justify-end"><Link href={`/admin/wallets/${row.original.customerId}`} className="grid size-8 place-items-center rounded-md hover:bg-muted" aria-label={`View wallet of ${row.original.customerName}`} title="View wallet"><Eye className="size-4" /></Link></div> },
  ], []);

  if (!ready) return <div className="min-h-40" />;

  return (
    <AdminListScaffold
      title="Wallets"
      description="Customer wallet balances used for paid chat and call sessions."
      summary={<div className="grid gap-3 sm:grid-cols-3"><AdminMetricCard label="Total held" value={money(total)} icon={WalletIcon} tone="green" /><AdminMetricCard label="Wallets" value={records.length} icon={WalletIcon} tone="blue" /><AdminMetricCard label="Empty wallets" value={empty} secondary="Cannot start a paid chat" icon={AlertTriangle} tone="amber" /></div>}
      records={records}
      columns={columns}
      searchPlaceholder="Search customer or phone"
      searchText={(item) => `${item.customerName} ${item.phone}`}
      filters={[{ id: "balance", allLabel: "All balances", options: balanceBands, match: (item, value) => band(item.balanceInPaise) === value }]}
      emptyLabel="No wallets match the current filters."
      renderMobileCard={(item) => (
        <Link key={item.id} href={`/admin/wallets/${item.customerId}`} className="rounded-lg border border-border bg-surface p-4 shadow-sm">
          <div className="flex justify-between gap-3"><span className="font-medium">{item.customerName}</span><span className="font-semibold">{money(item.balanceInPaise)}</span></div>
          <p className="mt-2 text-xs text-muted-foreground">{item.transactions[0]?.description ?? "No activity"}</p>
        </Link>
      )}
    />
  );
}

export function AdminWalletDetailView({ customerId }: { customerId: string }) {
  const { records, ready } = useWalletRepository();
  if (!ready) return <div className="min-h-40" />;
  const wallet = records.find((item) => item.customerId === customerId);
  if (!wallet) notFound();
  const credits = wallet.transactions.filter((item) => item.amountInPaise > 0).reduce((sum, item) => sum + item.amountInPaise, 0);
  const debits = wallet.transactions.filter((item) => item.amountInPaise < 0).reduce((sum, item) => sum - item.amountInPaise, 0);

  return (
    <section className="mx-auto max-w-[1200px] space-y-4">
      <AdminPageHeader title={`${wallet.customerName}'s wallet`} backHref="/admin/wallets" backLabel="Wallets" />
      <div className="grid gap-4 xl:grid-cols-[minmax(0,7fr)_minmax(17rem,3fr)]">
        <Card className="shadow-sm">
          <CardHeader className="pb-3"><CardTitle>Transactions</CardTitle></CardHeader>
          <CardContent>
            {wallet.transactions.length ? (
              <div className="divide-y divide-border">
                {wallet.transactions.map((item) => (
                  <div key={item.id} className="grid gap-1 py-3 sm:grid-cols-[1fr_auto] sm:items-center">
                    <div>
                      <div className="flex items-center gap-2"><Badge variant={kindVariants[item.kind]}>{kindLabels[item.kind]}</Badge><span className="font-mono text-xs text-muted-foreground">{item.id}</span></div>
                      <p className="mt-1 text-sm">{item.description}</p>
                      <p className="text-xs text-muted-foreground">{dateTime(item.createdAt)}</p>
                    </div>
                    <div className="text-right">
                      <p className={cn("font-semibold", item.amountInPaise > 0 ? "text-success" : "text-foreground")}>{item.amountInPaise > 0 ? "+" : "−"}{money(Math.abs(item.amountInPaise))}</p>
                      <p className="text-xs text-muted-foreground">Balance {money(item.balanceAfterInPaise)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : <p className="text-sm text-muted-foreground">No wallet activity yet.</p>}
          </CardContent>
        </Card>
        <AdminDetailStickyRail>
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle>Balance</CardTitle></CardHeader>
            <CardContent>
              <p className="font-sans text-3xl font-semibold">{money(wallet.balanceInPaise)}</p>
              <div className="mt-3 divide-y divide-border">
                <DetailRow label="Credits" value={money(credits)} />
                <DetailRow label="Debits" value={money(debits)} />
                <DetailRow label="Updated" value={dateTime(wallet.updatedAt)} />
              </div>
            </CardContent>
          </Card>
          <Card className="shadow-sm">
            <CardHeader className="pb-3"><CardTitle>Customer</CardTitle></CardHeader>
            <CardContent><Link href={`/admin/customers/${wallet.customerId}`} className="font-medium hover:underline">{wallet.customerName}</Link><p className="mt-1 text-xs text-muted-foreground">{wallet.phone}</p></CardContent>
          </Card>
        </AdminDetailStickyRail>
      </div>
    </section>
  );
}
