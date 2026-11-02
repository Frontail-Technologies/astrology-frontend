"use client";

import { useMemo, useState } from "react";

import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectSeparator, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { AdminFieldControlProps } from "./admin-form-section";
import { toAdminOptions, type AdminOptionsInput } from "./admin-options";

const NONE = "__admin_none__";
const OTHER = "__admin_other__";

/**
 * Select for a finite option set (enums, canonical keys, placements, periods, statuses…). Stores the machine
 * key, shows the label. Works inside `AdminFormField` (spread the render-prop `control`) and with
 * react-hook-form through `Controller`.
 *
 * - `clearable` adds an explicit "none" choice that maps to `null` (for optional fields).
 * - `other` adds an "Other…" escape with a free-text input. Use it **only** when the API accepts arbitrary
 *   strings (check the backend validation); the typed value is sent as-is.
 *
 * ```tsx
 * <AdminFormField label="Placement" required error={fieldError(errors, "placement")}>
 *   {(control) => (
 *     <Controller control={form.control} name="placement" render={({ field }) => (
 *       <AdminSelectField control={control} value={field.value} onValueChange={(v) => field.onChange(v ?? "")}
 *         options={bannerPlacementLabels} placeholder="Choose a placement" other={{ placeholder: "custom-placement-key" }} />
 *     )} />
 *   )}
 * </AdminFormField>
 * ```
 */
export function AdminSelectField({
  value,
  onValueChange,
  options,
  placeholder = "Choose…",
  clearable,
  other,
  control,
  disabled = false,
  className,
  onBlur,
}: {
  value: string | null | undefined;
  onValueChange: (value: string | null) => void;
  options: AdminOptionsInput;
  placeholder?: string;
  /** Adds a choice that clears the value (`null`). */
  clearable?: { label: string };
  /** Free-text escape; only when the API accepts arbitrary values. */
  other?: { label?: string; placeholder?: string; maxLength?: number; inputLabel?: string };
  /** Props from `AdminFormField`'s render prop (id + aria wiring). */
  control?: AdminFieldControlProps;
  disabled?: boolean;
  className?: string;
  onBlur?: () => void;
}) {
  const list = useMemo(() => toAdminOptions(options), [options]);
  const current = value ?? "";
  const known = list.some((option) => option.value === current);
  const [otherChosen, setOtherChosen] = useState(false);
  const otherActive = Boolean(other) && (otherChosen || (current !== "" && !known));
  const selectValue = otherActive ? OTHER : known ? current : "";
  const controlId = control?.id;

  return (
    <div className={cn("grid gap-2", className)}>
      <Select
        value={selectValue}
        disabled={disabled}
        onValueChange={(next) => {
          if (next === OTHER) {
            setOtherChosen(true);
            if (known) onValueChange("");
            return;
          }
          setOtherChosen(false);
          onValueChange(next === NONE ? null : next);
        }}
      >
        <SelectTrigger {...control} onBlur={onBlur} className="w-full bg-surface">
          <SelectValue placeholder={placeholder} />
        </SelectTrigger>
        <SelectContent>
          {clearable ? (
            <>
              <SelectItem value={NONE} className="text-muted-foreground">
                {clearable.label}
              </SelectItem>
              <SelectSeparator />
            </>
          ) : null}
          {list.map((option) => (
            <SelectItem key={option.value} value={option.value} disabled={option.disabled}>
              {option.description ? (
                <span className="grid">
                  <span>{option.label}</span>
                  <span className="text-xs text-muted-foreground">{option.description}</span>
                </span>
              ) : (
                option.label
              )}
            </SelectItem>
          ))}
          {other ? (
            <>
              <SelectSeparator />
              <SelectItem value={OTHER}>{other.label ?? "Other…"}</SelectItem>
            </>
          ) : null}
        </SelectContent>
      </Select>
      {otherActive && other ? (
        <Input
          id={controlId ? `${controlId}-other` : undefined}
          value={current}
          onChange={(event) => onValueChange(event.target.value)}
          onBlur={onBlur}
          placeholder={other.placeholder}
          maxLength={other.maxLength}
          disabled={disabled}
          aria-label={other.inputLabel ?? "Custom value"}
          aria-invalid={control?.["aria-invalid"]}
          aria-describedby={control?.["aria-describedby"]}
          autoFocus={otherChosen}
          className="bg-surface"
        />
      ) : null}
    </div>
  );
}
