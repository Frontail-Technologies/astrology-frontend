"use client";

import { cn } from "@/lib/utils";

/** Multi-select as toggle chips (aria-pressed). Used for a pooja's auspicious tithis and nakshatras. */
export function PanchangChoiceField({ label, options, value, onChange, disabled }: { label: string; options: readonly string[]; value: string[]; onChange: (next: string[]) => void; disabled?: boolean }) {
  const toggle = (option: string) => onChange(value.includes(option) ? value.filter((item) => item !== option) : options.filter((item) => item === option || value.includes(item)));
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1.5">
      {options.map((option) => {
        const on = value.includes(option);
        return (
          <button
            key={option}
            type="button"
            aria-pressed={on}
            disabled={disabled}
            onClick={() => toggle(option)}
            className={cn(
              "inline-flex h-8 items-center rounded-full border px-3 text-[13px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50",
              on ? "border-primary bg-primary text-primary-foreground" : "border-border bg-surface hover:bg-muted",
            )}
          >
            {option}
          </button>
        );
      })}
    </div>
  );
}
