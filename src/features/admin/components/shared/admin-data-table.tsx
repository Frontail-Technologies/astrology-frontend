"use client";

import { useState, type ReactNode } from "react";
import { Columns3 } from "lucide-react";
import {
  flexRender,
  type RowData,
} from "@tanstack/react-table";
import {
  getCoreRowModel,
  getSortedRowModel,
  useLegacyTable,
  type LegacyColumnDef as ColumnDef,
  type LegacyTable as TanStackTable,
} from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";

type AdminDataTableProps<TData extends RowData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  emptyState: ReactNode;
  toolbar?: (table: TanStackTable<TData>) => ReactNode;
  initialColumnVisibility?: VisibilityState;
  /** Rendered above the toolbar inside the card (list title row). */
  header?: ReactNode;
  /** Rendered under the table inside the card (pagination). */
  footer?: ReactNode;
  /** Keep the column header visible while the table body scrolls (the body scrolls inside the card). */
  stickyHeader?: boolean;
  className?: string;
};

type SortingState = Array<{ id: string; desc: boolean }>;
type VisibilityState = Record<string, boolean>;

export function AdminDataTableColumnVisibility<TData extends RowData>({
  table,
}: {
  table: TanStackTable<TData>;
}) {
  const hideableColumns = table.getAllColumns().filter((column) => column.getCanHide());

  if (hideableColumns.length === 0) {
    return null;
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm" className="h-9 min-h-9 shrink-0 bg-surface font-medium text-foreground/80 hover:bg-muted">
          <Columns3 aria-hidden="true" />
          Columns
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>Visible columns</DropdownMenuLabel>
        <DropdownMenuSeparator />
        {hideableColumns.map((column) => (
          <DropdownMenuCheckboxItem
            key={column.id}
            checked={column.getIsVisible()}
            onCheckedChange={(value) => column.toggleVisibility(value)}
          >
            {column.id.replace(/([A-Z])/g, " $1").replace(/^./, (value) => value.toUpperCase())}
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

/**
 * Admin table card: optional header row and toolbar, a header row on a quiet tint, comfortable 52px rows with
 * hover, an optional sticky header and a footer slot. An `actions` column is pinned to the right edge.
 */
export function AdminDataTable<TData extends RowData>({
  columns,
  data,
  emptyState,
  toolbar,
  initialColumnVisibility = {},
  header,
  footer,
  stickyHeader = false,
  className,
}: AdminDataTableProps<TData>) {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>(initialColumnVisibility);
  const table = useLegacyTable<TData>({
    data,
    columns,
    state: { sorting, columnVisibility },
    onSortingChange: setSorting,
    onColumnVisibilityChange: setColumnVisibility,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
  });

  return (
    <div className={cn("min-w-0 overflow-hidden rounded-xl border border-border bg-surface", className)}>
      {header}
      {toolbar ? <div className="border-b border-border px-4 py-3">{toolbar(table)}</div> : null}
      <div
        className={cn(
          "max-w-full overflow-x-auto [scrollbar-width:thin] [&_[data-slot=table-container]]:overflow-visible",
          stickyHeader && "max-h-[calc(100svh-15rem)] min-h-40 overflow-y-auto",
        )}
      >
        <Table className="w-max min-w-full">
          <TableHeader className={cn("bg-muted/70", stickyHeader && "sticky top-0 z-30 bg-muted")}>
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="border-border hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={cn(
                      "h-10 px-4 text-xs font-medium text-muted-foreground first:pl-5",
                      header.column.id === "actions" && "sticky right-0 z-20 w-[96px] min-w-[96px] bg-muted pr-5 text-right",
                    )}
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(header.column.columnDef.header, header.getContext())}
                  </TableHead>
                ))}
              </TableRow>
            ))}
          </TableHeader>
          <TableBody>
            {table.getRowModel().rows.length > 0 ? (
              table.getRowModel().rows.map((row) => (
                <TableRow key={row.id} className="group/row border-border hover:bg-muted/45">
                  {row.getVisibleCells().map((cell) => (
                    <TableCell
                      key={cell.id}
                      className={cn(
                        "h-[52px] px-4 py-2 align-middle text-sm first:pl-5",
                        cell.column.id === "actions" && "sticky right-0 z-10 w-[96px] min-w-[96px] bg-surface pr-5 group-hover/row:bg-[color-mix(in_srgb,var(--muted)_45%,var(--surface))]",
                      )}
                    >
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-40 whitespace-normal text-center text-sm text-muted-foreground">
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
      {footer ? <div className="border-t border-border px-5 py-3">{footer}</div> : null}
    </div>
  );
}
