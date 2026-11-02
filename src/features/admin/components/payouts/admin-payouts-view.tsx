"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { Eye, HandCoins, Plus, UserRound } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { useAstrologerPicker } from "@/features/astrologers/hooks/use-astrologer-admin";
import { useAvailableEarnings } from "@/features/earnings/hooks/use-earning-admin";
import { PAYOUT_CREATE_ERROR_HINTS, payoutStatusLabels, payoutStatusVariants } from "@/features/payouts/constants/payout-status";
import { useCreatePayout, usePayoutList } from "@/features/payouts/hooks/use-payout-admin";
import type { AdminPayout } from "@/features/payouts/types/payout-admin";
import { formatDateTime, formatINR } from "../../lib/format";
import { AdminCombobox } from "../shared/admin-combobox";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminFormField } from "../shared/admin-form-section";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions, type AdminRowAction } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusBadge } from "../shared/admin-status-badge";

/** Create a payout from an astrologer's available earnings. The server computes the amount from the earnings. */
function CreatePayoutDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const router = useRouter();
  const [astrologerId, setAstrologerId] = useState<string | null>(null);
  const [selected, setSelected] = useState<string[] | null>(null);
  const astrologers = useAstrologerPicker(open);
  const earnings = useAvailableEarnings(astrologerId);
  const mutation = useCreatePayout();
  const items = earnings.data?.items ?? [];
  const chosen = selected ?? items.map((earning) => earning.id);
  const total = items.filter((earning) => chosen.includes(earning.id)).reduce((sum, earning) => sum + earning.astrologerEarningPaise, 0);
  const hint = mutation.error?.code ? PAYOUT_CREATE_ERROR_HINTS[mutation.error.code] : undefined;

  return (
    <AdminConfirmDialog
      open={open}
      onOpenChange={(next) => {
        if (!next) {
          setAstrologerId(null);
          setSelected(null);
          mutation.reset();
        }
        onOpenChange(next);
      }}
      title="Create a payout"
      description="Bundles the selected available earnings into one pending payout. The amount is calculated by the server from those earnings."
      confirmLabel={total ? `Create payout of ${formatINR(total)}` : "Create payout"}
      pending={mutation.isPending}
      error={mutation.error}
      confirmDisabled={!astrologerId || chosen.length === 0}
      onConfirm={() => {
        if (!astrologerId) return;
        const all = chosen.length === items.length;
        mutation.mutate(all ? { astrologerId } : { astrologerId, earningIds: chosen }, {
          onSuccess: (payout) => {
            onOpenChange(false);
            router.push(`/admin/payouts/${payout.id}`);
          },
        });
      }}
    >
      <AdminFormField label="Astrologer" description="Only verified astrologers are listed." error={astrologers.error ? "Could not load astrologers." : undefined}>
        {(control) => (
          <AdminCombobox
            control={control}
            value={astrologerId}
            onValueChange={(value) => {
              setAstrologerId(value);
              setSelected(null);
            }}
            options={(astrologers.data?.items ?? []).map((astrologer) => ({ value: astrologer.id, label: astrologer.displayName }))}
            loading={astrologers.isPending}
            placeholder="Choose an astrologer"
            searchPlaceholder="Search astrologers…"
            disabled={mutation.isPending}
          />
        )}
      </AdminFormField>
      {astrologerId ? (
        <fieldset className="space-y-2">
          <legend className="mb-2 text-sm font-medium">Earnings ready to pay out</legend>
          {!earnings.ready ? (
            <p className="text-xs text-muted-foreground">Loading earnings…</p>
          ) : earnings.error ? (
            <p className="text-xs text-destructive">{earnings.error.message}</p>
          ) : items.length === 0 ? (
            <p className="text-xs text-muted-foreground">This astrologer has no earnings ready to pay out.</p>
          ) : (
            <div className="max-h-56 space-y-1.5 overflow-y-auto rounded-md border border-border p-2">
              {items.map((earning) => (
                <label key={earning.id} className="flex items-center justify-between gap-3 text-sm">
                  <span className="flex items-center gap-2">
                    <Checkbox
                      checked={chosen.includes(earning.id)}
                      onCheckedChange={(checked) => setSelected(checked === true ? [...chosen, earning.id] : chosen.filter((id) => id !== earning.id))}
                      disabled={mutation.isPending}
                    />
                    {formatDateTime(earning.createdAt)}
                  </span>
                  <span className="font-medium tabular-nums">{formatINR(earning.astrologerEarningPaise)}</span>
                </label>
              ))}
            </div>
          )}
        </fieldset>
      ) : null}
      {hint ? <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">{hint}</p> : null}
    </AdminConfirmDialog>
  );
}

const astrologerName = (payout: AdminPayout) => payout.astrologer?.displayName ?? "Astrologer";
const earningsLabel = (count: number) => (count === 1 ? "1 earning" : `${count} earnings`);

const rowActions = (payout: AdminPayout): AdminRowAction[] => [
  { label: "View payout", icon: Eye, href: `/admin/payouts/${payout.id}` },
  { label: "View astrologer", icon: UserRound, href: `/admin/astrologers/${payout.astrologerId}` },
];

export function AdminPayoutsView() {
  const list = usePayoutList();
  const [creating, setCreating] = useState(false);
  const createButton = (
    <Button size="sm" variant="conversion" onClick={() => setCreating(true)}>
      <Plus aria-hidden="true" />
      Create payout
    </Button>
  );
  const columns = useMemo<ColumnDef<AdminPayout>[]>(
    () => [
      {
        id: "astrologer",
        header: "Astrologer",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-40">
            <Link className="block truncate font-medium hover:underline" href={`/admin/payouts/${row.original.id}`}>
              {astrologerName(row.original)}
            </Link>
            <p className="text-xs tabular-nums text-muted-foreground">{earningsLabel(row.original.itemCount)}</p>
          </div>
        ),
      },
      { id: "amount", header: "Amount", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm font-medium tabular-nums">{formatINR(row.original.amountPaise)}</span> },
      { id: "requested", header: "Requested", enableSorting: false, cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatDateTime(row.original.requestedAt)}</span> },
      { id: "status", header: "Status", enableSorting: false, cell: ({ row }) => <AdminStatusBadge status={row.original.status} labels={payoutStatusLabels} variants={payoutStatusVariants} /> },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end gap-0.5">
            <AdminRowActionLink href={`/admin/payouts/${row.original.id}`} label="View payout" icon={Eye} />
            <AdminRowActions label="More actions" actions={rowActions(row.original).slice(1)} />
          </div>
        ),
      },
    ],
    [],
  );
  return (
    <>
      <AdminServerList
        title="Payouts"
        description="Transfers of earned money to astrologers."
        noun="payouts"
        primaryAction={createButton}
        list={list}
        dateRange
        idFilterLabels={{ astrologerId: "Astrologer" }}
        idFilterName={(_key, rows) => rows[0]?.astrologer?.displayName}
        columns={columns}
        filters={[{ key: "status", allLabel: "All statuses", options: payoutStatusLabels }]}
        emptyLabel="No payouts yet"
        emptyDescription="Create a payout to bundle an astrologer's available earnings into one transfer."
        emptyIcon={HandCoins}
        emptyAction={createButton}
        renderMobileCard={(payout) => (
          <article key={payout.id} className="rounded-xl border border-border bg-surface p-4">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <Link href={`/admin/payouts/${payout.id}`} className="block truncate font-medium hover:underline">
                  {astrologerName(payout)}
                </Link>
                <p className="text-xs tabular-nums text-muted-foreground">
                  {formatINR(payout.amountPaise)} · {earningsLabel(payout.itemCount)}
                </p>
              </div>
              <AdminRowActions label="Payout actions" actions={rowActions(payout)} className="-mr-1.5 shrink-0" />
            </div>
            <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
              <p className="text-xs tabular-nums text-muted-foreground">{formatDateTime(payout.requestedAt)}</p>
              <AdminStatusBadge status={payout.status} labels={payoutStatusLabels} variants={payoutStatusVariants} />
            </div>
          </article>
        )}
      />
      <CreatePayoutDialog open={creating} onOpenChange={setCreating} />
    </>
  );
}
