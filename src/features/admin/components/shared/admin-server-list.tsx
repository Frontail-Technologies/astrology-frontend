"use client";

import type { ReactNode } from "react";
import { FileQuestion, RotateCcw, Search, SearchX, SlidersHorizontal, X, type LucideIcon } from "lucide-react";
import type { RowData } from "@tanstack/react-table";
import type { LegacyColumnDef as ColumnDef, LegacyTable as TanStackTable } from "@tanstack/react-table/legacy";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Sheet, SheetClose, SheetContent, SheetDescription, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import type { AdminError } from "@/features/admin/data/admin-errors";
import { hasActiveListFilters, type AdminListPatch, type AdminListState, type AdminPage } from "@/features/admin/data/admin-list-state";
import { cn } from "@/lib/utils";
import { AdminDataTable, AdminDataTableColumnVisibility } from "./admin-data-table";
import { AdminEmptyState } from "./admin-empty-state";
import { AdminErrorState, AdminListLoading, AdminPagination } from "./admin-list-states";

export type ServerListFilter = { key: string; allLabel: string; options: Record<string, string> };

/** What `useAdminListState` + `useAdminListQuery` return; every server-backed list hook spreads both. */
export type ServerListModel<T> = {
  state: AdminListState<string>;
  searchInput: string;
  setSearchInput: (value: string) => void;
  apply: (patch: AdminListPatch<string, string>) => void;
  clear: () => void;
  page: AdminPage<T> | null;
  items: T[];
  isInitialLoading: boolean;
  isFetching: boolean;
  error: AdminError | null;
  retry: () => void;
};

const number = new Intl.NumberFormat("en-IN");

/**
 * Server-backed Admin list: URL state, server search/filters/pagination, shared loading/error/empty states.
 * Search renders only when the backend list endpoint supports it (`searchPlaceholder`). Nothing is filtered in
 * the browser.
 *
 * Layout (one card on desktop):
 *   header   title + count · `headerAside` · `primaryAction`
 *   toolbar  search · filter selects · `toolbarExtras` · date range · id chips · Clear · Columns
 *   table    sticky header, 52px rows, pinned actions column
 *   footer   "Showing 1 to 20 of 132 customers" · Previous / Next
 * On mobile the card dissolves: header, search + a "Filters" sheet, the domain's mobile cards, pagination.
 */
export function AdminServerList<T extends RowData>({
  title,
  description,
  noun,
  headerAside,
  primaryAction,
  toolbarExtras,
  summary,
  list,
  columns,
  filters = [],
  searchPlaceholder,
  searchMaxLength = 120,
  dateRange = false,
  idFilterLabels = {},
  idFilterName,
  extraActiveCount = 0,
  initialColumnVisibility,
  emptyLabel,
  emptyDescription,
  emptyIcon,
  emptyAction,
  renderMobileCard,
}: {
  title: string;
  /** One line under the title (what this list is). */
  description?: string;
  noun: string;
  /** Extra content on the right of the header row (notes, secondary buttons). */
  headerAside?: ReactNode;
  /** The list's single committed action, for example "New article" (`<Button variant="conversion" size="sm">`). */
  primaryAction?: ReactNode;
  /** Extra filter controls rendered in the toolbar after the filter selects (and inside the mobile Filters sheet). */
  toolbarExtras?: ReactNode;
  summary?: ReactNode;
  list: ServerListModel<T>;
  columns: ColumnDef<T>[];
  filters?: ServerListFilter[];
  searchPlaceholder?: string;
  searchMaxLength?: number;
  /** Render from/to date inputs (the list config must set `dateRange: true`). */
  dateRange?: boolean;
  /**
   * Labels for UUID filters set through links (for example "Astrologer" for `astrologerId`). Active id filters
   * render as removable chips; ids are never typed by hand.
   */
  idFilterLabels?: Record<string, string>;
  /**
   * Display name for an active id filter, read from the loaded rows (every row matches the filter, so the first
   * row usually carries the name). Chips without a name read "selected"; raw ids are never shown.
   */
  idFilterName?: (key: string, rows: T[]) => string | null | undefined;
  /** Active filters rendered through `toolbarExtras`, added to the mobile "Filters" badge count. */
  extraActiveCount?: number;
  initialColumnVisibility?: Record<string, boolean>;
  emptyLabel: string;
  /** Next step shown under `emptyLabel` when the list is empty without filters. */
  emptyDescription?: string;
  emptyIcon?: LucideIcon;
  /** Action shown when the list is empty without filters (usually the same as `primaryAction`). */
  emptyAction?: ReactNode;
  renderMobileCard: (record: T) => ReactNode;
}) {
  const { state, searchInput, setSearchInput, apply, clear, page, items, isInitialLoading, isFetching, error, retry } = list;
  const hasActiveFilters = hasActiveListFilters(state) || searchInput.trim() !== "";
  const pastLastPage = Boolean(page && page.total > 0 && items.length === 0 && state.page > 1);
  const emptyTitle = pastLastPage ? "This page is past the end of the results." : hasActiveFilters ? `No ${noun} match these filters.` : emptyLabel;
  const emptyHint = pastLastPage ? undefined : hasActiveFilters ? "Try a different search or clear the filters." : emptyDescription;
  const emptyButton = pastLastPage ? (
    <Button variant="outline" size="sm" className="bg-surface" onClick={() => apply({ page: 1 })}>
      Go to first page
    </Button>
  ) : hasActiveFilters ? (
    <Button variant="outline" size="sm" className="bg-surface" onClick={clear}>
      Clear filters
    </Button>
  ) : (
    (emptyAction ?? null)
  );
  const emptyState = (
    <AdminEmptyState variant="inline" icon={hasActiveFilters ? SearchX : emptyIcon} title={emptyTitle} description={emptyHint} action={emptyButton} />
  );

  const activeFilterCount =
    filters.filter((filter) => state.filters[filter.key]).length + (state.from ? 1 : 0) + (state.to ? 1 : 0) + extraActiveCount;
  const hasFilterControls = filters.length > 0 || Boolean(toolbarExtras) || dateRange;

  const search = searchPlaceholder ? (
    <div className="relative min-w-0 flex-1 md:max-w-sm">
      <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden="true" />
      <Input
        type="search"
        value={searchInput}
        onChange={(event) => setSearchInput(event.target.value)}
        placeholder={searchPlaceholder}
        className="h-9 min-h-9 bg-surface pl-9 text-sm"
        aria-label={`Search ${noun}`}
        maxLength={searchMaxLength}
      />
    </div>
  ) : null;

  const filterControls = (
    <>
      {filters.map((filter) => (
        <Select
          key={filter.key}
          value={state.filters[filter.key] ?? "all"}
          onValueChange={(value) => apply({ filters: { [filter.key]: value === "all" ? null : value } })}
        >
          <SelectTrigger
            className={cn("h-9 w-full bg-surface text-sm md:w-auto md:min-w-40", state.filters[filter.key] && "border-foreground/30 font-medium")}
            aria-label={filter.allLabel}
          >
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">{filter.allLabel}</SelectItem>
            {Object.entries(filter.options).map(([value, label]) => (
              <SelectItem key={value} value={value}>
                {label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      ))}
      {toolbarExtras}
      {dateRange ? (
        <div className="flex w-full items-center gap-2 md:w-auto">
          <Input
            type="date"
            value={state.from ?? ""}
            max={state.to}
            onChange={(event) => apply({ from: event.target.value || null })}
            className="h-9 min-h-9 min-w-0 flex-1 bg-surface text-sm md:w-38 md:flex-none"
            aria-label="From date"
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            value={state.to ?? ""}
            min={state.from}
            onChange={(event) => apply({ to: event.target.value || null })}
            className="h-9 min-h-9 min-w-0 flex-1 bg-surface text-sm md:w-38 md:flex-none"
            aria-label="To date"
          />
        </div>
      ) : null}
    </>
  );

  const idEntries = Object.entries(state.ids ?? {}).filter(([, id]) => Boolean(id));
  const idChips = idEntries.map(([key, id]) => {
    const name = idFilterName?.(key, items)?.trim();
    return (
    <span key={key} title={String(id)} className="inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border border-border bg-muted/60 pl-3 pr-1.5 text-xs">
      <span className="shrink-0 text-muted-foreground">{idFilterLabels[key] ?? key}</span>
      <span className={cn("truncate", name ? "font-medium text-foreground" : "text-muted-foreground")}>{name || "selected"}</span>
      <button
        type="button"
        onClick={() => apply({ ids: { [key]: null } })}
        className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
        aria-label={`Remove ${idFilterLabels[key] ?? key} filter`}
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </span>
    );
  });

  const clearButton = hasActiveFilters ? (
    <Button variant="ghost" size="sm" onClick={clear} className="h-9 min-h-9 px-2.5 text-muted-foreground hover:text-foreground">
      <RotateCcw aria-hidden="true" />
      Clear
    </Button>
  ) : null;

  const header = (
    <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3 md:px-5 md:pb-3.5 md:pt-4">
      <div className="min-w-0">
        <div className="flex min-w-0 items-center gap-2.5">
          <h1 data-admin-visible-title className="truncate font-sans text-base font-semibold tracking-tight text-foreground">
            {title}
          </h1>
          {page ? (
            <span className="inline-flex h-6 shrink-0 items-center rounded-full bg-muted px-2.5 text-xs font-medium tabular-nums text-muted-foreground">
              {number.format(page.total)}
              {hasActiveFilters ? " matching" : ""}
            </span>
          ) : null}
        </div>
        {description ? <p className="mt-0.5 text-[13px] text-muted-foreground">{description}</p> : null}
      </div>
      {headerAside || primaryAction ? (
        <div className="flex min-w-0 flex-wrap items-center gap-2">
          {headerAside}
          {primaryAction}
        </div>
      ) : null}
    </div>
  );

  const desktopToolbar = (table: TanStackTable<T>) => (
    <div className="flex flex-wrap items-center gap-2">
      {search}
      {filterControls}
      {idChips}
      {clearButton}
      <div className="ml-auto">
        <AdminDataTableColumnVisibility table={table} />
      </div>
    </div>
  );

  const mobileToolbar = (
    <div className="grid gap-2">
      {search || hasFilterControls ? (
        <div className="flex items-center gap-2">
          {search}
          {hasFilterControls ? (
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="outline" size="sm" className={cn("h-9 min-h-9 shrink-0 bg-surface", !search && "w-full")}>
                  <SlidersHorizontal aria-hidden="true" />
                  Filters
                  {activeFilterCount ? (
                    <span className="grid size-5 place-items-center rounded-full bg-foreground text-[10px] font-semibold text-surface">{activeFilterCount}</span>
                  ) : null}
                </Button>
              </SheetTrigger>
              <SheetContent side="bottom" className="max-h-[85svh] gap-0 overflow-y-auto rounded-t-2xl p-0">
                <SheetHeader className="border-b border-border px-5 py-4 text-left">
                  <SheetTitle className="text-base">Filter {noun}</SheetTitle>
                  <SheetDescription className="text-xs">Results update as you choose.</SheetDescription>
                </SheetHeader>
                <div className="grid gap-3 px-5 py-4">{filterControls}</div>
                <div className="flex items-center justify-between gap-2 border-t border-border px-5 py-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
                  <Button variant="ghost" size="sm" onClick={clear} disabled={!hasActiveFilters}>
                    Clear all
                  </Button>
                  <SheetClose asChild>
                    <Button size="sm">Show results</Button>
                  </SheetClose>
                </div>
              </SheetContent>
            </Sheet>
          ) : null}
        </div>
      ) : null}
      {idChips.length || clearButton ? (
        <div className="flex flex-wrap items-center gap-2">
          {idChips}
          {clearButton}
        </div>
      ) : null}
    </div>
  );

  const pagination = page && page.total > 0 ? <AdminPagination page={page} isFetching={isFetching} noun={noun} onPageChange={(next) => apply({ page: next })} /> : null;

  return (
    <section className="min-w-0 space-y-4" aria-busy={isFetching || undefined}>
      {summary}

      {error && !page ? (
        <div className="space-y-3">
          {header}
          <AdminErrorState error={error} onRetry={retry} title={`Could not load ${noun}`} />
        </div>
      ) : isInitialLoading ? (
        <div className="min-w-0 space-y-3 md:space-y-0 md:rounded-xl md:border md:border-border md:bg-surface">
          {header}
          <div className="md:border-t md:border-border md:p-4">
            <AdminListLoading label={`Loading ${noun}`} />
          </div>
        </div>
      ) : (
        <>
          {error ? <AdminErrorState error={error} onRetry={retry} title={`Could not refresh ${noun}`} /> : null}
          <div className={cn("hidden md:block", isFetching && "opacity-70 transition-opacity")}>
            <AdminDataTable
              columns={columns}
              data={items}
              initialColumnVisibility={initialColumnVisibility}
              header={header}
              toolbar={desktopToolbar}
              stickyHeader
              emptyState={emptyState}
              footer={pagination}
            />
          </div>
          <div className="space-y-3 md:hidden">
            {header}
            {mobileToolbar}
            <div className={cn("space-y-3", isFetching && "opacity-70 transition-opacity")}>
              {items.length > 0 ? items.map(renderMobileCard) : <div className="rounded-xl border border-border bg-surface">{emptyState}</div>}
            </div>
            {pagination}
          </div>
        </>
      )}
    </section>
  );
}

/** Detail-screen loading/error frame shared by every API-backed detail view. */
export function AdminDetailFrame({ ready, error, onRetry, noun, children }: { ready: boolean; error: AdminError | null; onRetry: () => void; noun: string; children: () => ReactNode }) {
  if (!ready) {
    return (
      <div className="space-y-4" role="status" aria-live="polite">
        <span className="sr-only">Loading {noun}…</span>
        <Skeleton className="h-4 w-28 rounded" />
        <Skeleton className="h-8 w-72 max-w-full rounded-lg" />
        <div className="grid gap-4 lg:grid-cols-3">
          <Skeleton className="h-56 rounded-xl lg:col-span-2" />
          <Skeleton className="h-56 rounded-xl" />
        </div>
      </div>
    );
  }
  if (error?.kind === "not_found") {
    return <AdminEmptyState icon={FileQuestion} title={`This ${noun} does not exist or was removed.`} description="Check the link, or go back to the list." />;
  }
  if (error) return <AdminErrorState error={error} onRetry={onRetry} title={`Could not load ${noun}`} />;
  return <>{children()}</>;
}
