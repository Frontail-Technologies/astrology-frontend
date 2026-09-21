"use client";

import { SearchX } from "lucide-react";

import { Button } from "@/components/ui/button";

export function AstrologersEmptyState({ onClear }: { onClear: () => void }) {
  return (
    <div className="flex min-h-[280px] flex-col items-center justify-center rounded-2xl border border-slate-300/70 bg-white px-6 py-10 text-center shadow-[0_2px_8px_rgba(23,32,51,0.05)] dark:border-gold-400/18 dark:bg-midnight-900 dark:shadow-none">
      <div className="grid size-12 place-items-center rounded-full border border-gold-500/25 bg-gold-300/16 text-gold-500 dark:text-gold-300">
        <SearchX className="size-5" aria-hidden="true" />
      </div>
      <h2 className="mt-4 font-sans text-lg font-semibold text-foreground">
        No astrologers match these filters.
      </h2>
      <p className="mt-2 max-w-sm text-sm leading-6 text-muted-foreground">
        Try changing expertise, language or availability.
      </p>
      <Button
        type="button"
        variant="outline"
        onClick={onClear}
        className="mt-5"
      >
        Clear Filters
      </Button>
    </div>
  );
}
