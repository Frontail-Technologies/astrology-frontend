"use client";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { RangePreset, RangeState } from "../../insights/date-range";

const presetLabels: Record<RangePreset, string> = {
  "7d": "Last 7 days",
  "30d": "Last 30 days",
  "90d": "Last 90 days",
  custom: "Custom range",
};

export function ReportRangeControl({
  value,
  onChange,
}: {
  value: RangeState;
  onChange: (next: RangeState) => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <Select value={value.preset} onValueChange={(preset) => onChange({ ...value, preset: preset as RangePreset })}>
        <SelectTrigger className="h-9 w-40" aria-label="Date range">
          <SelectValue>{presetLabels[value.preset]}</SelectValue>
        </SelectTrigger>
        <SelectContent>
          {(Object.keys(presetLabels) as RangePreset[]).map((preset) => (
            <SelectItem key={preset} value={preset}>
              {presetLabels[preset]}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {value.preset === "custom" ? (
        <>
          <Input
            type="date"
            className="h-9 w-36"
            aria-label="From date"
            value={value.customFrom}
            max={value.customTo || undefined}
            onChange={(event) => onChange({ ...value, customFrom: event.target.value })}
          />
          <span className="text-xs text-muted-foreground">to</span>
          <Input
            type="date"
            className="h-9 w-36"
            aria-label="To date"
            value={value.customTo}
            min={value.customFrom || undefined}
            onChange={(event) => onChange({ ...value, customTo: event.target.value })}
          />
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
      <SelectTrigger className={`h-9 ${className}`} aria-label={label}>
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
