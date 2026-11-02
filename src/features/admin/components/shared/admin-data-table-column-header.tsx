"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import type { RowData } from "@tanstack/react-table";
import type { LegacyColumn as Column } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";

type AdminDataTableColumnHeaderProps<TData extends RowData, TValue> = {
  column: Column<TData, TValue>;
  label: string;
};

export function AdminDataTableColumnHeader<TData extends RowData, TValue>({
  column,
  label,
}: AdminDataTableColumnHeaderProps<TData, TValue>) {
  if (!column.getCanSort()) {
    return <span>{label}</span>;
  }

  const sortDirection = column.getIsSorted();
  const Icon = sortDirection === "asc" ? ArrowUp : sortDirection === "desc" ? ArrowDown : ArrowUpDown;

  function toggleSort() {
    if (sortDirection === "desc") {
      column.clearSorting();
      return;
    }

    column.toggleSorting(sortDirection === "asc");
  }

  return (
    <Button
      variant="ghost"
      size="sm"
      className="-ml-2 h-8 min-h-8 gap-1 px-2 text-xs font-medium text-muted-foreground hover:bg-surface hover:text-foreground"
      onClick={toggleSort}
    >
      {label}
      <Icon
        className={`size-3.5 ${sortDirection ? "text-foreground" : "text-muted-foreground/45"}`}
        aria-hidden="true"
      />
    </Button>
  );
}
