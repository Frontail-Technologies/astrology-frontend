"use client";

import { useState, type ComponentProps } from "react";

import { Input } from "@/components/ui/input";

import { isoToLocalInput, localInputToIso, sameInstant } from "../../data/admin-datetime";

type InputPassthrough = Omit<ComponentProps<typeof Input>, "value" | "onChange" | "type" | "defaultValue" | "min" | "max">;

/**
 * `datetime-local` input bound to an ISO 8601 string with the browser's offset (`2026-11-01T09:30:00.000+05:30`).
 * `onChange` receives the ISO string, or `null` when cleared/incomplete. `min`/`max` take ISO strings too.
 *
 * `<AdminDateTimeInput {...control} value={field.value} onChange={field.onChange} onBlur={field.onBlur} />`
 */
export function AdminDateTimeInput({
  value,
  onChange,
  min,
  max,
  ...props
}: InputPassthrough & {
  value: string | null | undefined;
  onChange: (iso: string | null) => void;
  min?: string | null;
  max?: string | null;
}) {
  const [text, setText] = useState(() => isoToLocalInput(value));
  const [syncedValue, setSyncedValue] = useState(value);
  if (value !== syncedValue) {
    setSyncedValue(value);
    if (!sameInstant(localInputToIso(text), value)) setText(isoToLocalInput(value));
  }

  return (
    <Input
      {...props}
      type="datetime-local"
      value={text}
      min={min ? isoToLocalInput(min) || undefined : undefined}
      max={max ? isoToLocalInput(max) || undefined : undefined}
      onChange={(event) => {
        const next = event.target.value;
        const iso = localInputToIso(next);
        setText(next);
        setSyncedValue(iso);
        onChange(iso);
      }}
    />
  );
}
