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
import { Card, CardContent } from "@/components/ui/card";
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

type AdminDataTableProps<TData extends RowData> = {
  columns: ColumnDef<TData, any>[];
  data: TData[];
  emptyState: ReactNode;
  toolbar?: (table: TanStackTable<TData>) => ReactNode;
  initialColumnVisibility?: VisibilityState;
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
        <Button variant="outline" size="sm" className="h-9 shrink-0 bg-surface hover:bg-surface-muted">
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

export function AdminDataTable<TData extends RowData>({
  columns,
  data,
  emptyState,
  toolbar,
  initialColumnVisibility = {},
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
    <Card className="min-w-0 overflow-hidden shadow-sm">
      {toolbar ? <CardContent className="border-b border-border p-3">{toolbar(table)}</CardContent> : null}
      <div className="max-w-full overflow-x-auto [scrollbar-color:theme(colors.slate.400)_transparent] [scrollbar-width:thin]">
        <Table className="w-max min-w-full">
          <TableHeader className="bg-muted">
            {table.getHeaderGroups().map((headerGroup) => (
              <TableRow key={headerGroup.id} className="hover:bg-transparent">
                {headerGroup.headers.map((header) => (
                  <TableHead
                    key={header.id}
                    className={`h-10 px-4 text-xs font-semibold text-muted-foreground ${header.column.id === "actions" ? "sticky right-0 z-20 w-[116px] min-w-[116px] border-l border-border bg-muted pr-4 text-right" : ""}`}
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
                <TableRow key={row.id}>
                  {row.getVisibleCells().map((cell) => (
                    <TableCell key={cell.id} className={`px-4 py-2.5 align-middle ${cell.column.id === "actions" ? "sticky right-0 z-10 w-[116px] min-w-[116px] border-l border-border bg-surface pr-4" : ""}`}>
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </TableCell>
                  ))}
                </TableRow>
              ))
            ) : (
              <TableRow className="hover:bg-transparent">
                <TableCell colSpan={table.getVisibleLeafColumns().length} className="h-36 text-center">
                  {emptyState}
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </Card>
  );
}
