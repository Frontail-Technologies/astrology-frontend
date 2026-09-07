"use client";

import { cn } from "@/lib/utils";
import { poojaCategories } from "../data/poojas";
import type { PoojaCategoryValue } from "../types/pooja";

type PoojaPurposeFilterProps = {
  value: PoojaCategoryValue;
  onValueChange: (value: PoojaCategoryValue) => void;
};

export function PoojaPurposeFilter({
  value,
  onValueChange,
}: PoojaPurposeFilterProps) {
  return (
    <div
      role="group"
      aria-label="Filter poojas by purpose"
      className="flex gap-2 overflow-x-auto no-scrollbar px-0.5 py-1 sm:flex-wrap sm:overflow-visible sm:p-0"
    >
      {poojaCategories.map((option) => {
        const selected = value === option.value;

        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={selected}
            onClick={() => onValueChange(option.value)}
            className={cn(
              "inline-flex shrink-0 items-center rounded-lg border px-3.5 py-2 text-[13px] font-semibold outline-none transition-colors duration-200",
              "focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              selected
                ? "border-conversion-500 bg-conversion-500 text-midnight-950 hover:bg-conversion-600"
                : "border-gold-500/20 bg-white text-foreground/70 hover:border-gold-500/40 hover:bg-gold-300/10 hover:text-foreground dark:border-gold-400/18 dark:bg-espresso-900 dark:text-ivory-50/70 dark:hover:border-gold-400/40 dark:hover:bg-espresso-700 dark:hover:text-ivory-50",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
