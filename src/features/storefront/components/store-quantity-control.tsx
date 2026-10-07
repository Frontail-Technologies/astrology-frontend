"use client";

import { Minus, Plus } from "lucide-react";

import { cn } from "@/lib/utils";

export function StoreQuantityControl({
  value,
  onChange,
  min = 1,
  max,
  label = "Quantity",
  disabled = false,
  compact = false,
  className,
}: {
  value: number;
  onChange: (next: number) => void;
  min?: number;
  max?: number;
  label?: string;
  disabled?: boolean;
  compact?: boolean;
  className?: string;
}) {
  const atMin = value <= min;
  const atMax = max !== undefined && value >= max;
  const button = cn(
    "grid place-items-center text-foreground transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-40",
    compact ? "size-8" : "size-11",
  );

  return (
    <div
      role="group"
      aria-label={label}
      className={cn("inline-flex items-center overflow-hidden rounded-md border border-border bg-surface", className)}
    >
      <button type="button" className={button} onClick={() => onChange(value - 1)} disabled={disabled || atMin} aria-label={`Decrease ${label.toLowerCase()}`}>
        <Minus className="size-4" aria-hidden="true" />
      </button>
      <output
        aria-live="polite"
        className={cn("grid place-items-center text-center text-sm font-semibold tabular-nums text-foreground", compact ? "w-8" : "w-12")}
      >
        {value}
      </output>
      <button type="button" className={button} onClick={() => onChange(value + 1)} disabled={disabled || atMax} aria-label={`Increase ${label.toLowerCase()}`}>
        <Plus className="size-4" aria-hidden="true" />
      </button>
    </div>
  );
}
