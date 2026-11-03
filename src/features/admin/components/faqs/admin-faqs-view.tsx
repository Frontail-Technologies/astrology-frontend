"use client";

import Link from "next/link";
import { useMemo } from "react";
import { CircleHelp, Pencil, Plus } from "lucide-react";
import type { LegacyColumnDef as ColumnDef } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import { faqCategoryLabels, faqVisibilityLabels } from "@/features/faqs/constants/faq-status";
import { useFaqList } from "@/features/faqs/hooks/use-faq-admin";
import type { ManagedFaq } from "@/features/faqs/types/faq-admin";
import { formatDateOnly } from "../../lib/format";
import { AdminRowActionLink } from "../shared/admin-row-action-link";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminServerList } from "../shared/admin-server-list";
import { AdminStatusPill } from "../shared/admin-status-badge";

function NewFaqButton() {
  return (
    <Button asChild variant="conversion" size="sm">
      <Link href="/admin/faqs/new">
        <Plus aria-hidden="true" />
        New FAQ
      </Link>
    </Button>
  );
}

function VisibilityPill({ active }: { active: boolean }) {
  return active ? <AdminStatusPill tone="success">Shown</AdminStatusPill> : <AdminStatusPill tone="neutral">Hidden</AdminStatusPill>;
}

function FaqMobileCard({ faq }: { faq: ManagedFaq }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <Link href={`/admin/faqs/${faq.id}/edit`} className="line-clamp-2 font-medium text-foreground hover:underline">
            {faq.question}
          </Link>
          <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">{faq.answer}</p>
        </div>
        <AdminRowActions label={`Actions for ${faq.question}`} actions={[{ label: "Edit", icon: Pencil, href: `/admin/faqs/${faq.id}/edit` }]} className="-mr-1.5 -mt-1 shrink-0" />
      </div>
      <div className="mt-3 flex flex-wrap items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-1.5">
          <VisibilityPill active={faq.active} />
          <AdminStatusPill tone="neutral" dot={false}>
            {faqCategoryLabels[faq.category]}
          </AdminStatusPill>
        </div>
        <span className="text-xs tabular-nums text-muted-foreground">Updated {formatDateOnly(faq.updatedAt)}</span>
      </div>
    </div>
  );
}

export function AdminFaqsView() {
  const list = useFaqList();
  const columns = useMemo<ColumnDef<ManagedFaq>[]>(
    () => [
      {
        id: "question",
        header: "Question",
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="min-w-64 max-w-xl">
            <Link href={`/admin/faqs/${row.original.id}/edit`} className="block truncate font-medium text-foreground hover:underline">
              {row.original.question}
            </Link>
            <p className="truncate text-xs text-muted-foreground">{row.original.answer}</p>
          </div>
        ),
      },
      {
        id: "category",
        header: "Section",
        enableSorting: false,
        cell: ({ row }) => (
          <AdminStatusPill tone="neutral" dot={false}>
            {faqCategoryLabels[row.original.category]}
          </AdminStatusPill>
        ),
      },
      { id: "order", header: "Order", enableSorting: false, cell: ({ row }) => <span className="text-sm tabular-nums text-muted-foreground">{row.original.sortOrder}</span> },
      { id: "visibility", header: "In app", enableSorting: false, cell: ({ row }) => <VisibilityPill active={row.original.active} /> },
      {
        id: "updated",
        header: "Updated",
        enableSorting: false,
        cell: ({ row }) => <span className="whitespace-nowrap text-sm tabular-nums text-muted-foreground">{formatDateOnly(row.original.updatedAt)}</span>,
      },
      {
        id: "actions",
        header: () => <span>Actions</span>,
        enableSorting: false,
        enableHiding: false,
        cell: ({ row }) => (
          <div className="flex justify-end">
            <AdminRowActionLink href={`/admin/faqs/${row.original.id}/edit`} label={`Edit ${row.original.question}`} icon={Pencil} />
          </div>
        ),
      },
    ],
    [],
  );

  return (
    <AdminServerList
      title="FAQs"
      description="Help answers shown in the customer app, grouped by section."
      noun="FAQs"
      primaryAction={<NewFaqButton />}
      list={list}
      columns={columns}
      searchPlaceholder="Search questions and answers…"
      searchMaxLength={120}
      filters={[
        { key: "category", allLabel: "All sections", options: faqCategoryLabels },
        { key: "active", allLabel: "Shown or hidden", options: faqVisibilityLabels },
      ]}
      emptyLabel="No FAQs yet"
      emptyDescription="Add the questions customers ask most, such as how to top up the wallet or track an order."
      emptyIcon={CircleHelp}
      emptyAction={<NewFaqButton />}
      renderMobileCard={(faq) => <FaqMobileCard key={faq.id} faq={faq} />}
    />
  );
}
