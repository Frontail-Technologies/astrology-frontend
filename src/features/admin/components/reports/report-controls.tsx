"use client";

import { useState } from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  ADMIN_RANGE_PRESETS,
  adminRangePresetLabels,
  isValidCustomRange,
  todayKey,
  type AdminRangePreset,
  type AdminRangeState,
} from "@/features/admin/data/admin-range";

/**
 * Preset + custom date range control. Presets apply immediately; a custom range is held as a local draft and only
 * applied (and written to the URL by the caller) once both dates form a valid range.
 */
export function ReportRangeControl({
  value,
  onChange,
}: {
  value: AdminRangeState;
  onChange: (next: AdminRangeState) => void;
}) {
  const max = todayKey();
  const [draft, setDraft] = useState(value);
  const [synced, setSynced] = useState(value);
  if (synced !== value) {
    setSynced(value);
    setDraft(value);
  }
  const change = (next: AdminRangeState) => {
    setDraft(next);
    if (next.preset !== "custom" || isValidCustomRange(next.customFrom, next.customTo)) onChange(next);
  };
  const incomplete = draft.preset === "custom" && !isValidCustomRange(draft.customFrom, draft.customTo);
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={draft.preset} onValueChange={(preset) => change({ ...draft, preset: preset as AdminRangePreset })}>
        <SelectTrigger className="h-9 w-40 bg-surface text-sm" aria-label="Date range">
          <SelectValue>{adminRangePresetLabels[draft.preset]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {ADMIN_RANGE_PRESETS.map((preset) => (
            <SelectItem key={preset} value={preset}>
              {adminRangePresetLabels[preset]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {draft.preset === "custom" ? (
        <>
          <Input
            type="date"
            className="h-9 min-h-9 w-36 bg-surface text-sm"
            aria-label="From date"
            value={draft.customFrom}
            max={draft.customTo || max}
            onChange={(event) => change({ ...draft, customFrom: event.target.value })}
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            className="h-9 min-h-9 w-36 bg-surface text-sm"
            aria-label="To date"
            value={draft.customTo}
            min={draft.customFrom || undefined}
            max={max}
            onChange={(event) => change({ ...draft, customTo: event.target.value })}
          />
          {incomplete ? <span className="w-full text-xs text-muted-foreground sm:w-auto">Choose both dates (up to two years) to apply.</span> : null}
        </>
      ) : null}
    </div>
  );
}

export function ReportFilterSelect({
  label,
  value,
  onChange,
  options,
  className = "w-40",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
  className?: string;
}) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className={`h-9 bg-surface text-sm ${className}`} aria-label={label}>
        <SelectValue>{options.find((option) => option.value === value)?.label}</SelectValue>
      </SelectTrigger>
      <SelectContent>
        {options.map((option) => (
          <SelectItem key={option.value} value={option.value}>
            {option.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
