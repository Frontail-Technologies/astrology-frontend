"use client";

import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";
import { useFieldArray, type ArrayPath, type FieldArray, type FieldValues, type Path, type UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { fieldError } from "../shared/admin-form-section";

/**
 * Repeating-row editors shared by the catalog editors (poojas, store categories, store products). Rows are
 * objects (react-hook-form field arrays); blank rows are dropped by each domain's payload mapper.
 */

// eslint-disable-next-line @typescript-eslint/no-explicit-any -- the form's output type is irrelevant to these fields
type AnyForm<T extends FieldValues> = UseFormReturn<T, unknown, any>;

function RowButtons({ index, count, label, onMove, onRemove, disabled }: { index: number; count: number; label: string; onMove: (from: number, to: number) => void; onRemove: () => void; disabled?: boolean }) {
  return (
    <div className="flex shrink-0 items-start gap-0.5">
      <Button type="button" variant="ghost" size="sm" className="size-9 p-0 text-muted-foreground" aria-label={`Move ${label} up`} disabled={disabled || index === 0} onClick={() => onMove(index, index - 1)}>
        <ArrowUp aria-hidden="true" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className="size-9 p-0 text-muted-foreground" aria-label={`Move ${label} down`} disabled={disabled || index === count - 1} onClick={() => onMove(index, index + 1)}>
        <ArrowDown aria-hidden="true" />
      </Button>
      <Button type="button" variant="ghost" size="sm" className="size-9 p-0 text-muted-foreground hover:text-destructive" aria-label={`Remove ${label}`} disabled={disabled} onClick={onRemove}>
        <Trash2 aria-hidden="true" />
      </Button>
    </div>
  );
}

/** Error for a row (`a.0.text`), falling back to the row itself (`a.0`, where server errors for string lists land). */
function rowError<T extends FieldValues>(form: AnyForm<T>, path: string, key?: string) {
  const errors = form.formState.errors;
  return (key ? fieldError(errors, `${path}.${key}`) : undefined) ?? fieldError(errors, path);
}

/** Ordered list of `{ text }` rows (paragraphs, bullet points, slugs). */
export function TextRowsField<T extends FieldValues>({
  form,
  name,
  label,
  itemLabel,
  addLabel,
  description,
  multiline = false,
  max = 30,
  placeholder,
  disabled,
}: {
  form: AnyForm<T>;
  name: ArrayPath<T>;
  label: string;
  /** Singular noun for accessible names ("paragraph"). */
  itemLabel: string;
  addLabel: string;
  description?: string;
  multiline?: boolean;
  max?: number;
  placeholder?: string;
  disabled?: boolean;
}) {
  const rows = useFieldArray({ control: form.control, name });
  const listError = fieldError(form.formState.errors, name) ?? fieldError(form.formState.errors, `${name}.root`);
  return (
    <fieldset className="grid gap-2" disabled={disabled}>
      <legend className="mb-1 text-sm font-medium text-foreground">{label}</legend>
      {description ? <p className="-mt-1 text-xs text-muted-foreground">{description}</p> : null}
      {rows.fields.length === 0 ? <p className="text-sm text-muted-foreground">None added.</p> : null}
      {rows.fields.map((field, index) => {
        const path = `${name}.${index}`;
        const error = rowError(form, path, "text");
        const props = {
          "aria-label": `${itemLabel} ${index + 1}`,
          "aria-invalid": error ? (true as const) : undefined,
          placeholder,
          ...form.register(`${path}.text` as Path<T>),
        };
        return (
          <div key={field.id} className="grid gap-1">
            <div className="flex gap-2">
              {multiline ? <Textarea rows={3} {...props} /> : <Input {...props} />}
              <RowButtons index={index} count={rows.fields.length} label={`${itemLabel} ${index + 1}`} onMove={rows.move} onRemove={() => rows.remove(index)} />
            </div>
            {error ? <p className="text-xs text-destructive">{error}</p> : null}
          </div>
        );
      })}
      {listError ? <p className="text-xs text-destructive">{listError}</p> : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        disabled={rows.fields.length >= max}
        onClick={() => rows.append({ text: "" } as FieldArray<T, ArrayPath<T>>)}
      >
        <Plus aria-hidden="true" />
        {addLabel}
      </Button>
    </fieldset>
  );
}

/** Ordered list of two-field rows (`{ label, value }`, `{ question, answer }`, `{ title, description }`). */
export function PairRowsField<T extends FieldValues>({
  form,
  name,
  label,
  itemLabel,
  addLabel,
  keys,
  labels,
  secondMultiline = false,
  max = 30,
  description,
  disabled,
}: {
  form: AnyForm<T>;
  name: ArrayPath<T>;
  label: string;
  itemLabel: string;
  addLabel: string;
  keys: [string, string];
  labels: [string, string];
  secondMultiline?: boolean;
  max?: number;
  description?: string;
  disabled?: boolean;
}) {
  const rows = useFieldArray({ control: form.control, name });
  const [first, second] = keys;
  const listError = fieldError(form.formState.errors, name) ?? fieldError(form.formState.errors, `${name}.root`);
  return (
    <fieldset className="grid gap-3" disabled={disabled}>
      <legend className="mb-1 text-sm font-medium text-foreground">{label}</legend>
      {description ? <p className="-mt-2 text-xs text-muted-foreground">{description}</p> : null}
      {rows.fields.length === 0 ? <p className="text-sm text-muted-foreground">None added.</p> : null}
      {rows.fields.map((field, index) => {
        const path = `${name}.${index}`;
        const firstError = rowError(form, path, first);
        const secondError = fieldError(form.formState.errors, `${path}.${second}`);
        const SecondControl = secondMultiline ? Textarea : Input;
        return (
          <div key={field.id} className="grid gap-2 border-b border-border pb-3 last:border-b-0">
            <div className="flex items-start gap-2">
              <div className={secondMultiline ? "grid flex-1 gap-2" : "grid flex-1 gap-2 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)]"}>
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor={`${path}.${first}`}>{`${itemLabel} ${index + 1} ${labels[0]}`}</Label>
                  <Input id={`${path}.${first}`} placeholder={labels[0]} aria-invalid={firstError ? true : undefined} {...form.register(`${path}.${first}` as Path<T>)} />
                  {firstError ? <p className="text-xs text-destructive">{firstError}</p> : null}
                </div>
                <div className="grid gap-1">
                  <Label className="sr-only" htmlFor={`${path}.${second}`}>{`${itemLabel} ${index + 1} ${labels[1]}`}</Label>
                  <SecondControl id={`${path}.${second}`} placeholder={labels[1]} aria-invalid={secondError ? true : undefined} {...form.register(`${path}.${second}` as Path<T>)} />
                  {secondError ? <p className="text-xs text-destructive">{secondError}</p> : null}
                </div>
              </div>
              <RowButtons index={index} count={rows.fields.length} label={`${itemLabel} ${index + 1}`} onMove={rows.move} onRemove={() => rows.remove(index)} />
            </div>
          </div>
        );
      })}
      {listError ? <p className="text-xs text-destructive">{listError}</p> : null}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-fit"
        disabled={rows.fields.length >= max}
        onClick={() => rows.append({ [first]: "", [second]: "" } as FieldArray<T, ArrayPath<T>>)}
      >
        <Plus aria-hidden="true" />
        {addLabel}
      </Button>
    </fieldset>
  );
}
