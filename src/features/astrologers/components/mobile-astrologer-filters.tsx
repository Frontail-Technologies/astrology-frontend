"use client";

import { useEffect, useState } from "react";
import { SlidersHorizontal } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { FilterOption } from "../types/astrologer";

export type AstrologerFilters = {
  expertise: string;
  language: string;
  availability: string;
};

type MobileAstrologerFiltersProps = {
  filters: AstrologerFilters;
  expertiseOptions: FilterOption[];
  languageOptions: FilterOption[];
  availabilityOptions: FilterOption[];
  onApply: (filters: AstrologerFilters) => void;
  onClear: () => void;
};

function FilterSelect({
  label,
  value,
  options,
  onValueChange,
}: {
  label: string;
  value: string;
  options: FilterOption[];
  onValueChange: (value: string) => void;
}) {
  return (
    <label className="grid gap-2">
      <span className="text-sm font-medium text-foreground">{label}</span>
      <Select value={value} onValueChange={onValueChange}>
        <SelectTrigger aria-label={label}>
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {options.map((option) => (
            <SelectItem key={option.value} value={option.value}>
              {option.label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </label>
  );
}

export function MobileAstrologerFilters({
  filters,
  expertiseOptions,
  languageOptions,
  availabilityOptions,
  onApply,
  onClear,
}: MobileAstrologerFiltersProps) {
  const [open, setOpen] = useState(false);
  const [draftFilters, setDraftFilters] = useState(filters);

  useEffect(() => {
    if (open) {
      setDraftFilters(filters);
    }
  }, [filters, open]);

  function clearDraft() {
    setDraftFilters({
      expertise: "all",
      language: "all",
      availability: "all",
    });
  }

  function applyDraft() {
    onApply(draftFilters);
    setOpen(false);
  }

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          type="button"
          variant="outline"
          className="h-11 flex-1 justify-center"
        >
          <SlidersHorizontal aria-hidden="true" />
          Filters
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[88vw] max-w-sm bg-background p-0" side="right">
        <SheetHeader className="border-b border-border p-5 text-left">
          <SheetTitle className="font-sans text-lg text-foreground">
            Filters
          </SheetTitle>
          <SheetDescription>
            Narrow astrologers by expertise, language and availability.
          </SheetDescription>
        </SheetHeader>
        <div className="grid gap-5 p-5">
          <FilterSelect
            label="Expertise"
            value={draftFilters.expertise}
            options={expertiseOptions}
            onValueChange={(expertise) =>
              setDraftFilters((current) => ({ ...current, expertise }))
            }
          />
          <FilterSelect
            label="Language"
            value={draftFilters.language}
            options={languageOptions}
            onValueChange={(language) =>
              setDraftFilters((current) => ({ ...current, language }))
            }
          />
          <FilterSelect
            label="Availability"
            value={draftFilters.availability}
            options={availabilityOptions}
            onValueChange={(availability) =>
              setDraftFilters((current) => ({ ...current, availability }))
            }
          />
        </div>
        <SheetFooter className="border-t border-border bg-surface-muted p-4">
          <div className="flex gap-3">
            <Button
              type="button"
              variant="outline"
              className="flex-1"
              onClick={() => {
                clearDraft();
                onClear();
                setOpen(false);
              }}
            >
              Clear
            </Button>
            <Button type="button" variant="default" className="flex-1" onClick={applyDraft}>
              Apply Filters
            </Button>
          </div>
        </SheetFooter>
      </SheetContent>
    </Sheet>
  );
}
