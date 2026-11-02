"use client";

import { useState, type KeyboardEvent } from "react";
import { X } from "lucide-react";

import { CALCULATOR_LIMITS } from "@/features/calculators/constants/calculator-status";
import { parseKeywords } from "@/features/calculators/lib/calculator-form";
import { cn } from "@/lib/utils";
import type { AdminFieldControlProps } from "../shared/admin-form-section";

/**
 * Chip input for calculator search keywords. The form keeps the comma-separated text the schema validates; this
 * control shows it as removable chips. Enter or comma adds the typed keyword (duplicates are ignored, case-insensitively),
 * Backspace on an empty input removes the last one, and pasted comma lists are split.
 */
export function CalculatorKeywordInput({
  value,
  onChange,
  onBlur,
  control,
  disabled = false,
}: {
  value: string;
  onChange: (value: string) => void;
  onBlur?: () => void;
  control?: AdminFieldControlProps;
  disabled?: boolean;
}) {
  const keywords = parseKeywords(value);
  const [draft, setDraft] = useState("");
  const full = keywords.length >= CALCULATOR_LIMITS.keywords;

  const commit = (text: string) => {
    if (!text.trim()) return;
    onChange(parseKeywords([...keywords, text].join(",")).join(", "));
    setDraft("");
  };
  const remove = (keyword: string) => onChange(keywords.filter((item) => item !== keyword).join(", "));

  const onKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter" || event.key === ",") {
      event.preventDefault();
      commit(draft);
    } else if (event.key === "Backspace" && draft === "" && keywords.length) {
      remove(keywords[keywords.length - 1]!);
    }
  };

  return (
    <div
      className={cn(
        "flex min-h-11 w-full flex-wrap items-center gap-1.5 rounded-[calc(var(--radius)-2px)] border border-input bg-surface px-2 py-1.5 focus-within:ring-2 focus-within:ring-ring md:min-h-9",
        control?.["aria-invalid"] && "border-destructive",
        disabled && "opacity-60",
      )}
    >
      {keywords.map((keyword) => (
        <span key={keyword} className="inline-flex h-6 max-w-full items-center gap-1 rounded-full bg-muted pl-2.5 pr-1 text-xs font-medium text-foreground">
          <span className="truncate">{keyword}</span>
          <button
            type="button"
            onClick={() => remove(keyword)}
            disabled={disabled}
            className="grid size-4 place-items-center rounded-full text-muted-foreground hover:bg-surface hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
            aria-label={`Remove keyword ${keyword}`}
          >
            <X className="size-3" aria-hidden="true" />
          </button>
        </span>
      ))}
      <input
        {...control}
        data-admin-bare-input
        value={draft}
        onChange={(event) => {
          const text = event.target.value;
          if (text.includes(",")) commit(text);
          else setDraft(text);
        }}
        onKeyDown={onKeyDown}
        onBlur={() => {
          commit(draft);
          onBlur?.();
        }}
        disabled={disabled || full}
        maxLength={CALCULATOR_LIMITS.keyword}
        placeholder={full ? "Keyword limit reached" : keywords.length ? "Add another…" : "Type a keyword and press Enter"}
        className="h-7 min-w-32 flex-1 bg-transparent px-1 text-sm outline-none placeholder:text-muted-foreground"
      />
    </div>
  );
}
