"use client";

import { useId, type ReactNode } from "react";
import { get, type FieldErrors, type FieldValues } from "react-hook-form";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

import { AdminSectionCard } from "./admin-section-card";

/**
 * Titled editor section (same card styling as detail screens). `id` makes it a scroll-spy / section-nav target.
 *
 * `<AdminFormSection title="Identity" description="Shown on the public page.">…fields…</AdminFormSection>`
 */
export function AdminFormSection({
  title,
  description,
  actions,
  id,
  children,
  className,
}: {
  title: ReactNode;
  description?: ReactNode;
  actions?: ReactNode;
  id?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <section id={id} className={cn("scroll-mt-20", className)} aria-label={typeof title === "string" ? title : undefined}>
      <AdminSectionCard title={title} actions={actions} contentClassName="grid gap-4">
        {description ? <p className="-mt-2 text-sm text-muted-foreground">{description}</p> : null}
        {children}
      </AdminSectionCard>
    </section>
  );
}

export type AdminFieldControlProps = {
  id: string;
  "aria-describedby"?: string;
  "aria-invalid"?: true;
};

/**
 * Label + control + description + error with the ids and aria wiring done for you. `children` is a render prop
 * receiving the props to spread on the control (shadcn `Input`, `Textarea`, `SelectTrigger`, `Switch`, …).
 *
 * ```tsx
 * <AdminFormField label="Name" required error={fieldError(form.formState.errors, "name")}>
 *   {(control) => <Input {...control} {...form.register("name")} />}
 * </AdminFormField>
 * ```
 */
export function AdminFormField({
  label,
  description,
  error,
  required = false,
  id,
  className,
  children,
}: {
  label: ReactNode;
  description?: ReactNode;
  error?: string;
  required?: boolean;
  /** Control id (default generated). */
  id?: string;
  className?: string;
  children: (control: AdminFieldControlProps) => ReactNode;
}) {
  const generatedId = useId();
  const controlId = id ?? generatedId;
  const descriptionId = description ? `${controlId}-description` : undefined;
  const errorId = error ? `${controlId}-error` : undefined;
  const describedBy = [descriptionId, errorId].filter(Boolean).join(" ") || undefined;
  return (
    <div className={cn("grid gap-1.5", className)}>
      <Label htmlFor={controlId}>
        {label}
        {required ? (
          <span className="ml-0.5 text-destructive" aria-hidden="true">
            *
          </span>
        ) : null}
      </Label>
      {children({ id: controlId, ...(describedBy ? { "aria-describedby": describedBy } : {}), ...(error ? { "aria-invalid": true } : {}) })}
      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={errorId} className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

/** Form-level error (server messages that did not map to a field). Renders nothing for an empty message. */
export function AdminFormError({ message, className }: { message: string | null | undefined; className?: string }) {
  if (!message) return null;
  return (
    <p role="alert" className={cn("rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive", className)}>
      {message}
    </p>
  );
}

/** Error message at a (nested) field path, for example `fieldError(errors, "content.overview.0")`. */
export function fieldError<T extends FieldValues>(errors: FieldErrors<T>, name: string): string | undefined {
  const entry = get(errors, name) as { message?: unknown } | undefined;
  return typeof entry?.message === "string" ? entry.message : undefined;
}
