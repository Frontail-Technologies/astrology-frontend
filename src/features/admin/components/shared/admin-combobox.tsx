"use client";

import { useId, useMemo, useRef, useState, type KeyboardEvent } from "react";
import { Check, ChevronsUpDown, Loader2, Plus, Search, X } from "lucide-react";

import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import type { AdminFieldControlProps } from "./admin-form-section";
import { toAdminOptions, type AdminOption, type AdminOptionsInput } from "./admin-options";

/**
 * Searchable single-select for longer or suggested option sets: records picked from an API list (astrologers,
 * products, poojas), zodiac signs, categories with many entries, distinct values already used in data.
 *
 * - Client filtering by default. Pass `onSearchChange` for server search: the list is then shown as given
 *   (show `loading` while fetching) and `selectedLabel` names a selected record that is not on the current page.
 * - `allowCustom` lets people use the typed text as the value. Only when the API accepts arbitrary strings.
 * - `clearable` shows a clear button that sets `null`.
 *
 * ```tsx
 * <AdminFormField label="Astrologer">
 *   {(control) => (
 *     <AdminCombobox control={control} value={astrologerId} onValueChange={setAstrologerId}
 *       options={astrologers.map((a) => ({ value: a.id, label: a.displayName }))}
 *       placeholder="Choose an astrologer" searchPlaceholder="Search astrologers…" clearable />
 *   )}
 * </AdminFormField>
 * ```
 */
export function AdminCombobox({
  value,
  onValueChange,
  options,
  placeholder = "Choose…",
  searchPlaceholder = "Search…",
  emptyText = "No matches.",
  loading = false,
  onSearchChange,
  selectedLabel,
  allowCustom,
  clearable = false,
  control,
  disabled = false,
  className,
}: {
  value: string | null | undefined;
  onValueChange: (value: string | null) => void;
  options: AdminOptionsInput;
  placeholder?: string;
  searchPlaceholder?: string;
  emptyText?: string;
  loading?: boolean;
  /** Server search: called with the typed query; disables client filtering. */
  onSearchChange?: (query: string) => void;
  /** Label for a selected value that is not in `options` (server-searched lists). */
  selectedLabel?: string;
  /** Use the typed text as the value. Only when the API accepts arbitrary strings. */
  allowCustom?: { label?: (query: string) => string; validate?: (query: string) => boolean; maxLength?: number };
  clearable?: boolean;
  control?: AdminFieldControlProps;
  disabled?: boolean;
  className?: string;
}) {
  const list = useMemo(() => toAdminOptions(options), [options]);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [activeIndex, setActiveIndex] = useState(0);
  const listId = useId();
  const listRef = useRef<HTMLUListElement>(null);

  const current = value ?? "";
  const selected = list.find((option) => option.value === current);
  const display = selected?.label ?? (current ? (selectedLabel ?? current) : "");

  const q = query.trim();
  const filtered = onSearchChange || !q ? list : list.filter((option) => `${option.label} ${option.description ?? ""}`.toLowerCase().includes(q.toLowerCase()));
  const canUseCustom =
    Boolean(allowCustom) && q !== "" && !list.some((option) => option.label.toLowerCase() === q.toLowerCase() || option.value === q) && (allowCustom?.validate?.(q) ?? true);
  const rows: Array<AdminOption & { custom?: boolean }> = canUseCustom
    ? [...filtered, { value: q, label: allowCustom?.label?.(q) ?? `Use “${q}”`, custom: true }]
    : filtered;
  const safeIndex = Math.min(activeIndex, Math.max(rows.length - 1, 0));

  const setOpenState = (next: boolean) => {
    setOpen(next);
    if (!next) {
      setQuery("");
      setActiveIndex(0);
      onSearchChange?.("");
    }
  };

  const choose = (option: AdminOption | undefined) => {
    if (!option || option.disabled) return;
    onValueChange(option.value);
    setOpenState(false);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "ArrowDown") {
      event.preventDefault();
      setActiveIndex((safeIndex + 1) % Math.max(rows.length, 1));
    } else if (event.key === "ArrowUp") {
      event.preventDefault();
      setActiveIndex((safeIndex - 1 + rows.length) % Math.max(rows.length, 1));
    } else if (event.key === "Enter") {
      event.preventDefault();
      choose(rows[safeIndex]);
    }
  };

  return (
    <div className={cn("relative", className)}>
      <Popover open={open} onOpenChange={setOpenState}>
        <PopoverTrigger asChild disabled={disabled}>
          <button
            type="button"
            role="combobox"
            aria-expanded={open}
            aria-controls={listId}
            aria-haspopup="listbox"
            {...control}
            className={cn(
              "flex h-11 w-full items-center justify-between gap-2 rounded-[calc(var(--radius)-2px)] border border-input bg-surface px-3 text-left text-sm outline-none transition-[color,box-shadow] focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/30 disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive md:h-9",
              clearable && current && "pr-9",
            )}
          >
            <span className={cn("min-w-0 truncate", !display && "text-muted-foreground")}>{display || placeholder}</span>
            <ChevronsUpDown className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
          </button>
        </PopoverTrigger>
        <PopoverContent align="start" className="w-(--radix-popover-trigger-width) min-w-64 p-0">
          <div className="flex items-center gap-2 border-b border-border px-3">
            <Search className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
            <input
              autoFocus
            data-admin-bare-input
              value={query}
              maxLength={allowCustom?.maxLength}
              onChange={(event) => {
                setQuery(event.target.value);
                setActiveIndex(0);
                onSearchChange?.(event.target.value);
              }}
              onKeyDown={onKeyDown}
              placeholder={searchPlaceholder}
              className="h-10 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
              role="combobox"
              aria-expanded="true"
              aria-controls={listId}
              aria-autocomplete="list"
              aria-activedescendant={rows[safeIndex] ? `${listId}-${safeIndex}` : undefined}
              aria-label={searchPlaceholder}
            />
            {loading ? <Loader2 className="size-4 shrink-0 animate-spin text-muted-foreground" aria-label="Loading" /> : null}
          </div>
          <ul ref={listRef} id={listId} role="listbox" className="max-h-64 overflow-y-auto p-1">
            {rows.length === 0 ? (
              <li className="px-3 py-6 text-center text-sm text-muted-foreground">{loading ? "Loading…" : emptyText}</li>
            ) : (
              rows.map((option, index) => {
                const isSelected = !option.custom && option.value === current;
                return (
                  <li
                    key={`${option.custom ? "custom:" : ""}${option.value}`}
                    id={`${listId}-${index}`}
                    role="option"
                    aria-selected={isSelected}
                    aria-disabled={option.disabled || undefined}
                    onMouseMove={() => setActiveIndex(index)}
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={() => choose(option)}
                    className={cn(
                      "flex cursor-pointer items-center gap-2 rounded-md px-2.5 py-2 text-sm",
                      index === safeIndex && "bg-muted",
                      option.disabled && "cursor-not-allowed opacity-50",
                    )}
                  >
                    {option.custom ? (
                      <Plus className="size-4 shrink-0 text-muted-foreground" aria-hidden="true" />
                    ) : (
                      <Check className={cn("size-4 shrink-0", isSelected ? "text-foreground" : "invisible")} aria-hidden="true" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="block truncate">{option.label}</span>
                      {option.description ? <span className="block truncate text-xs text-muted-foreground">{option.description}</span> : null}
                    </span>
                  </li>
                );
              })
            )}
          </ul>
        </PopoverContent>
      </Popover>
      {clearable && current && !disabled ? (
        <button
          type="button"
          onClick={() => onValueChange(null)}
          className="absolute right-8 top-1/2 grid size-6 -translate-y-1/2 place-items-center rounded text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
          aria-label="Clear selection"
        >
          <X className="size-3.5" aria-hidden="true" />
        </button>
      ) : null}
    </div>
  );
}
