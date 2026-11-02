"use client";

import { useState, type ComponentProps } from "react";

import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

import { paiseToRupeesInput, rupeesToPaise } from "../../lib/money";

type InputPassthrough = Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type" | "inputMode" | "defaultValue">;

/**
 * Rupee text input bound to integer paise (the only unit the API accepts).
 *
 * `onChange` receives:
 * - integer paise for a valid amount (up to 2 decimals, commas allowed),
 * - `null` when the text is empty (nullable fields; make the schema `.nullable()` or reject null for required),
 * - `NaN` while the text is not a valid amount, so `z.number()` rejects it and the stale amount is never submitted.
 *
 * External changes (for example `form.reset`) re-sync the text unless it already shows that amount.
 *
 * `<AdminMoneyInput {...control} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />`
 */
export function AdminMoneyInput({
  value,
  onChange,
  className,
  placeholder = "0.00",
  ...props
}: InputPassthrough & {
  value: number | null | undefined;
  onChange: (paise: number | null) => void;
}) {
  const [text, setText] = useState(() => paiseToRupeesInput(value));
  const [syncedValue, setSyncedValue] = useState(value);
  if (!Object.is(value, syncedValue)) {
    // Derived-state sync during render (React's recommended pattern): only overwrite text that means something else.
    setSyncedValue(value);
    const current = text.trim() ? rupeesToPaise(text) : null;
    const incoming = value === undefined ? null : value;
    if (!(Number.isNaN(incoming) || Object.is(current, incoming))) setText(paiseToRupeesInput(incoming));
  }
  const invalid = text.trim() !== "" && rupeesToPaise(text) === null;

  return (
    <div className={cn("relative", className)}>
      <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground" aria-hidden="true">
        ₹
      </span>
      <Input
        {...props}
        type="text"
        inputMode="decimal"
        autoComplete="off"
        placeholder={placeholder}
        className="pl-7 tabular-nums"
        value={text}
        aria-invalid={props["aria-invalid"] ?? (invalid || undefined)}
        onChange={(event) => {
          const next = event.target.value;
          setText(next);
          const paise = next.trim() ? (rupeesToPaise(next) ?? Number.NaN) : null;
          setSyncedValue(paise);
          onChange(paise);
        }}
      />
    </div>
  );
}
