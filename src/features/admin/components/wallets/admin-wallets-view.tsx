"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Eye, SlidersHorizontal, UserRound, Wallet } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ADMIN_REASON } from "@/features/admin/data/admin-reason";
import { rupeesToPaise } from "@/features/admin/lib/money";
import { newIdempotencyKey } from "@/features/admin/data/idempotency";
import { walletDelta, walletTransactionLabels } from "@/features/wallets/constants/wallet-ledger";
import { useAdjustWallet, useWalletDetail, useWalletLedger, useWalletList } from "@/features/wallets/hooks/use-wallet-admin";
import type { AdminWallet, AdminWalletTransaction, WalletTransactionType } from "@/features/wallets/types/wallet-admin";
import { formatDateTime, formatINR } from "../../lib/format";
import { CustomerIdentity } from "../customers/customer-mobile-card";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminEmptyState } from "../shared/admin-empty-state";
import { AdminErrorState } from "../shared/admin-list-states";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame, AdminServerList } from "../shared/admin-server-list";
import { AdminStatusPill } from "../shared/admin-status-badge";

const signed = (paise: number) => `${paise >= 0 ? "+" : "−"}${formatINR(Math.abs(paise))}`;

const walletActions = (wallet: AdminWallet): AdminRowAction[] => [
  { label: "View ledger", icon: Eye, href: `/admin/wallets/${wallet.userId}` },
  { label: "View customer", icon: UserRound, href: `/admin/customers/${wallet.userId}` },
];

export function AdminWalletsView() {
  const list = useWalletList();
  const columns = useMemo<ColumnDef<AdminWallet>[]>(
    () => [
      {
        id: "customer",
        header: "Customer",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => <CustomerIdentity customer={row.original} href={`/admin/wallets/${row.original.userId}`} className="min-w-48" />,
      },
      { id: "balance", header: "Balance", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm font-medium tabular-nums">{formatINR(row.original.balancePaise)}</span> },
      { id: "updated", header: "Last activity", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatDateTime(row.original.updatedAt)}</span> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/wallets/${row.original.userId}`} label={`View wallet of ${row.original.email}`} icon={Eye} />
            <AdminRowActions label="More actions" actions={walletActions(row.original).slice(1)} />
          </div>
        ),
      },
    ],
    [],
  );
  return (
    <AdminServerList
      title="Wallets"
      description="Customer wallet balances. Balances change only through ledger entries."
      noun="wallets"
      list={list}
      columns={columns}
      searchPlaceholder="Search by email or phone…"
      emptyLabel="No wallets yet"
      emptyDescription="A wallet is created when a customer first tops up."
      emptyIcon={Wallet}
      renderMobileCard={(wallet) => (
        <article key={wallet.id} className="rounded-xl border border-border bg-surface p-4">
          <div className="flex items-start justify-between gap-3">
            <CustomerIdentity customer={wallet} href={`/admin/wallets/${wallet.userId}`} size="md" />
            <AdminRowActions label={`Actions for ${wallet.email}`} actions={walletActions(wallet)} className="-mr-1.5 shrink-0" />
          </div>
          <div className="mt-3 flex items-center justify-between gap-2">
            <p className="text-xs tabular-nums text-muted-foreground">Last activity {formatDateTime(wallet.updatedAt)}</p>
            <span className="font-semibold tabular-nums">{formatINR(wallet.balancePaise)}</span>
          </div>
        </article>
      )}
    />
  );
}

function LedgerRow({ entry }: { entry: AdminWalletTransaction }) {
  const delta = walletDelta(entry);
  return (
    <li className="grid gap-1 px-5 py-3 text-sm sm:grid-cols-[1fr_auto] sm:items-center">
      <div className="min-w-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="font-medium">{walletTransactionLabels[entry.type]}</span>
          {entry.type === "adjustment" ? (
            <AdminStatusPill tone="info" dot={false}>
              By an admin
            </AdminStatusPill>
          ) : null}
          {entry.type === "refund" ? (
            <AdminStatusPill tone="neutral" dot={false}>
              Recorded manually
            </AdminStatusPill>
          ) : null}
        </div>
        <p className="text-xs tabular-nums text-muted-foreground">
          {formatDateTime(entry.createdAt)}
          {entry.createdBy ? ` · by ${entry.createdBy.email ?? "an admin"}` : ""}
          {entry.metadata?.reference ? ` · reference ${entry.metadata.reference}` : ""}
        </p>
        {entry.adminNote ? <p className="text-xs text-muted-foreground">{entry.adminNote}</p> : null}
      </div>
      <div className="sm:text-right">
        <p className={`font-medium tabular-nums ${delta < 0 ? "text-destructive" : "text-success"}`}>{signed(delta)}</p>
        <p className="text-xs tabular-nums text-muted-foreground">Balance {formatINR(entry.balanceAfterPaise)}</p>
      </div>
    </li>
  );
}

/** Wallet detail: balance, paginated append-only ledger and controlled admin adjustments. */
export function AdminWalletDetailView({ customerId }: { customerId: string }) {
  const detail = useWalletDetail(customerId);
  const [page, setPage] = useState(1);
  const [type, setType] = useState<WalletTransactionType | "all">("all");
  const ledger = useWalletLedger(customerId, page, type);
  const mutation = useAdjustWallet(customerId);
  const [open, setOpen] = useState(false);
  const [attemptKey, setAttemptKey] = useState("");
  const [direction, setDirection] = useState<"credit" | "debit">("credit");
  const [amount, setAmount] = useState("");
  const [reference, setReference] = useState("");

  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="wallet">
      {() => {
        const wallet = detail.data!;
        const amountPaise = rupeesToPaise(amount);
        const amountError =
          amount && (amountPaise === null || amountPaise <= 0)
            ? "Enter a positive amount in rupees (up to 2 decimals)."
            : direction === "debit" && amountPaise && amountPaise > wallet.balancePaise
              ? `A debit cannot exceed the balance of ${formatINR(wallet.balancePaise)}.`
              : null;
        const page_ = ledger.data;
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={`${formatINR(wallet.balancePaise)} wallet`}
              backHref="/admin/wallets"
              backLabel="Wallets"
              meta={
                <>
                  <span className="break-all">{wallet.email}</span>
                  <span className="tabular-nums">Last activity {formatDateTime(wallet.updatedAt)}</span>
                </>
              }
              actions={
                <>
                  <Button variant="outline" size="sm" className="bg-surface" asChild>
                    <Link href={`/admin/customers/${wallet.userId}`}>
                      <UserRound aria-hidden="true" />
                      View customer
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="bg-surface"
                    onClick={() => {
                      setAttemptKey(newIdempotencyKey());
                      setDirection("credit");
                      setAmount("");
                      setReference("");
                      setOpen(true);
                    }}
                  >
                    <SlidersHorizontal aria-hidden="true" />
                    Adjust balance
                  </Button>
                </>
              }
            />
            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <AdminSectionCard
                title="Ledger"
                description={page_ && page_.total > 0 ? `${page_.total} ${page_.total === 1 ? "entry" : "entries"}` : undefined}
                flush
                actions={
                  <Select
                    value={type}
                    onValueChange={(value) => {
                      setType(value as WalletTransactionType | "all");
                      setPage(1);
                    }}
                  >
                    <SelectTrigger className="h-9 w-40 bg-surface sm:w-44" aria-label="Filter ledger by type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All entries</SelectItem>
                      {Object.entries(walletTransactionLabels).map(([value, label]) => (
                        <SelectItem key={value} value={value}>
                          {label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                }
              >
                {ledger.error ? (
                  <div className="p-5">
                    <AdminErrorState error={ledger.error} onRetry={ledger.reload} title="Could not load the ledger" />
                  </div>
                ) : !page_ ? (
                  <p className="px-5 py-4 text-sm text-muted-foreground" role="status">
                    Loading ledger…
                  </p>
                ) : page_.items.length === 0 ? (
                  <AdminEmptyState
                    variant="inline"
                    icon={Wallet}
                    title={type === "all" ? "No ledger entries yet" : "No entries of this type"}
                    description={type === "all" ? "Top-ups, charges, refunds and adjustments appear here." : "Choose “All entries” to see everything."}
                  />
                ) : (
                  <ul className="divide-y divide-border">
                    {page_.items.map((entry) => (
                      <LedgerRow key={entry.id} entry={entry} />
                    ))}
                  </ul>
                )}
                {page_ && page_.total > 0 ? (
                  <div className="flex flex-wrap items-center justify-between gap-2 border-t border-border px-5 py-3 text-sm text-muted-foreground">
                    <span className="tabular-nums">
                      Page {page_.page} of {Math.max(page_.totalPages, 1)}
                    </span>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" className="bg-surface" disabled={page <= 1 || ledger.isFetching} onClick={() => setPage(page - 1)}>
                        Previous
                      </Button>
                      <Button size="sm" variant="outline" className="bg-surface" disabled={page >= page_.totalPages || ledger.isFetching} onClick={() => setPage(page + 1)}>
                        Next
                      </Button>
                    </div>
                  </div>
                ) : null}
              </AdminSectionCard>
              <AdminDetailStickyRail className="space-y-5">
                <AdminSectionCard title="Balance">
                  <p className="text-2xl font-semibold tracking-tight tabular-nums sm:text-[28px]">{formatINR(wallet.balancePaise)}</p>
                  <p className="mt-1 text-[13px] text-muted-foreground">The balance changes only through ledger entries. Adjustments need a reason and are recorded in the audit log.</p>
                </AdminSectionCard>
              </AdminDetailStickyRail>
            </div>

            <AdminConfirmDialog
              open={open}
              onOpenChange={(next) => {
                setOpen(next);
                if (!next) mutation.reset();
              }}
              title={direction === "credit" ? "Credit this wallet?" : "Debit this wallet?"}
              description="Adds an append-only ledger entry with your identity and reason, recorded in the audit log. The balance is never overwritten."
              confirmLabel={direction === "credit" ? "Credit wallet" : "Debit wallet"}
              destructive={direction === "debit"}
              reason={{ ...ADMIN_REASON, placeholder: "For example: Goodwill credit for dropped session, ticket ST-1042" }}
              pending={mutation.isPending}
              error={mutation.error}
              confirmDisabled={!amountPaise || Boolean(amountError)}
              onConfirm={(reason) => {
                if (!reason || !amountPaise) return;
                mutation.mutate(
                  { direction, amountPaise, reason, reference: reference.trim() || null, idempotencyKey: attemptKey },
                  {
                    onSuccess: () => {
                      setOpen(false);
                      setPage(1);
                    },
                  },
                );
              }}
            >
              <div className="grid gap-3 sm:grid-cols-2">
                <div className="grid gap-1.5">
                  <Label htmlFor="adjust-direction">Direction</Label>
                  <Select value={direction} onValueChange={(value) => setDirection(value as "credit" | "debit")} disabled={mutation.isPending}>
                    <SelectTrigger id="adjust-direction">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="credit">Add money (credit)</SelectItem>
                      <SelectItem value="debit">Remove money (debit)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-1.5">
                  <Label htmlFor="adjust-amount">Amount</Label>
                  <div className="relative">
                    <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground" aria-hidden="true">
                      ₹
                    </span>
                    <Input id="adjust-amount" inputMode="decimal" className="pl-7 tabular-nums" value={amount} onChange={(event) => setAmount(event.target.value)} disabled={mutation.isPending} />
                  </div>
                </div>
              </div>
              {amountError ? <p className="text-xs text-destructive">{amountError}</p> : null}
              <div className="grid gap-1.5">
                <Label htmlFor="adjust-reference">Reference (optional)</Label>
                <Input id="adjust-reference" value={reference} maxLength={120} onChange={(event) => setReference(event.target.value)} disabled={mutation.isPending} placeholder="Ticket or external reference" />
              </div>
              {mutation.error?.code === "IDEMPOTENCY_CONFLICT" ? (
                <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">This attempt was already used for a different adjustment. Close and reopen the dialog.</p>
              ) : null}
            </AdminConfirmDialog>
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
