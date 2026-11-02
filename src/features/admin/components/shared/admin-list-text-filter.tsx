"use client";

import { useEffect, useState } from "react";

import { Input } from "@/components/ui/input";
import type { AdminListPatch, AdminListState } from "@/features/admin/data/admin-list-state";

const DEBOUNCE_MS = 400;
const trimValue = (value: string) => value.trim();

/**
 * Debounced exact-match text filter bound to one URL list filter (for example an article category or a banner
 * placement, which have no catalog endpoint to build a select from). Values the list config rejects never reach
 * the API. Shared by list views whose API filter is free text.
 */
export function AdminListTextFilter({
  list,
  filterKey,
  label,
  placeholder,
  maxLength = 120,
  normalize = trimValue,
  accepts,
}: {
  list: { state: AdminListState<string>; apply: (patch: AdminListPatch<string, string>) => void };
  filterKey: string;
  label: string;
  placeholder: string;
  maxLength?: number;
  normalize?: (value: string) => string;
  /** The same predicate the list config uses; values it rejects stay local (marked invalid) and are never applied. */
  accepts: (value: string) => boolean;
}) {
  const current = list.state.filters[filterKey] ?? "";
  const [text, setText] = useState(current);
  const [synced, setSynced] = useState(current);
  if (synced !== current) {
    setSynced(current);
    setText(current);
  }
  const { apply } = list;
  const next = normalize(text);
  const invalid = next !== "" && !accepts(next);

  useEffect(() => {
    if (next === current || invalid) return;
    const timer = setTimeout(() => apply({ filters: { [filterKey]: next || null } }), DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [apply, current, filterKey, invalid, next]);

  return (
    <Input
      value={text}
      onChange={(event) => setText(event.target.value)}
      placeholder={placeholder}
      aria-label={label}
      aria-invalid={invalid || undefined}
      title={invalid ? "This value is not a valid filter yet." : undefined}
      maxLength={maxLength}
      className="h-9 w-full sm:w-48"
    />
  );
}
