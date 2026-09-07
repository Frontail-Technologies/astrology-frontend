"use client";

import { Search } from "lucide-react";

import { Input } from "@/components/ui/input";

type CalculatorSearchProps = {
  value: string;
  onValueChange: (value: string) => void;
};

export function CalculatorSearch({ value, onValueChange }: CalculatorSearchProps) {
  return (
    <label className="relative block">
      <span className="sr-only">Search calculators</span>
      <Search
        aria-hidden="true"
        className="pointer-events-none absolute left-3.5 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
      />
      <Input
        type="search"
        value={value}
        onChange={(event) => onValueChange(event.target.value)}
        placeholder="Search calculators e.g. Moon Sign, Mangal Dosha..."
        aria-label="Search calculators"
        className="h-12 border-gold-500/25 bg-white pl-10 text-[15px] text-foreground placeholder:text-muted-foreground focus-visible:ring-gold-500/30 dark:border-gold-400/22 dark:bg-espresso-800/70"
      />
    </label>
  );
}
