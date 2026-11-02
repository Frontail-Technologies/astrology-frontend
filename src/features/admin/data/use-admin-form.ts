"use client";

import { useCallback, useState, type FormEvent } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, type DefaultValues, type FieldValues, type Mode, type Path, type UseFormReturn } from "react-hook-form";
import type { z } from "zod";

import type { AdminError } from "./admin-errors";
import { hasValuePath, mapAdminFieldErrors } from "./admin-field-errors";

/** The part of a `useAdminMutation` result that `useAdminForm` needs. */
export type AdminFormMutation<TInput, TResult> = {
  mutate: (input: TInput, options?: { onSuccess?: (result: TResult) => void; onError?: (error: AdminError) => void }) => void;
  isPending: boolean;
  reset: () => void;
};

/**
 * Applies a normalized server error to a react-hook-form instance: field errors (`name`, `content.overview.0`,
 * `body.items[0].alt`) go to the deepest matching form field via `setError` (focusing the first), the rest is
 * returned as a form-level message. A path matches when it exists in the form's current values, so give every
 * field a default (`null`/`""`/`[]`, not `undefined`). Returns `null` when every message landed on a field.
 */
export function applyAdminFieldErrors<TFieldValues extends FieldValues>(
  form: Pick<UseFormReturn<TFieldValues>, "getValues" | "setError">,
  error: AdminError,
  fieldAliases?: Record<string, string>,
): string | null {
  const values = form.getValues();
  const mapped = mapAdminFieldErrors(error.fieldErrors, { isField: (path) => hasValuePath(values, path), fieldAliases });
  mapped.fields.forEach(({ name, message }, index) =>
    form.setError(name as Path<TFieldValues>, { type: "server", message }, { shouldFocus: index === 0 }),
  );
  if (mapped.formMessages.length) return mapped.formMessages.join(" ");
  return mapped.fields.length ? null : error.message;
}

/**
 * react-hook-form + zod for Admin editors, submitting through a `useAdminMutation` result.
 *
 * - Client validation uses `schema` (input type = form values, output type = what `toInput` receives).
 * - On submit, `toInput(values)` (or the parsed values themselves when `toInput` is omitted, in which case the
 *   mutation input must be the schema output) is sent with `mutation.mutate`.
 * - Server field errors are mapped onto fields (`fieldAliases` renames server paths, for example
 *   `{ categoryIds: "categories" }`); anything else becomes `formError`. Create the mutation with
 *   `toastErrors: false` so errors only render inline (render `formError` with `AdminFormError`).
 * - `onSuccess(result, values, form)` runs after the server confirms (for example `form.reset(values)` or a redirect).
 *
 * ```tsx
 * const save = useUpdateBanner(id); // useAdminMutation({ ..., toastErrors: false, successMessage: "Banner saved" })
 * const { form, submit, formError, pending } = useAdminForm({ schema: bannerSchema, defaultValues, mutation: save, toInput: toBannerPayload });
 * <form onSubmit={submit} noValidate>…<AdminFormError message={formError} /></form>
 * ```
 */
export function useAdminForm<TFieldValues extends FieldValues, TOutput = TFieldValues, TInput = TOutput, TResult = unknown>({
  schema,
  defaultValues,
  mutation,
  toInput,
  onSuccess,
  fieldAliases,
  mode = "onTouched",
}: {
  schema: z.ZodType<TOutput, TFieldValues>;
  defaultValues: DefaultValues<TFieldValues>;
  mutation: AdminFormMutation<TInput, TResult>;
  toInput?: (values: TOutput) => TInput;
  onSuccess?: (result: TResult, values: TOutput, form: UseFormReturn<TFieldValues, unknown, TOutput>) => void;
  fieldAliases?: Record<string, string>;
  mode?: Mode;
}) {
  const form = useForm<TFieldValues, unknown, TOutput>({
    resolver: zodResolver(schema),
    defaultValues,
    mode,
  });
  const [formError, setFormError] = useState<string | null>(null);
  const { mutate } = mutation;

  const onValid = useCallback(
    (values: TOutput) => {
      setFormError(null);
      const input = toInput ? toInput(values) : (values as unknown as TInput);
      mutate(input, {
        onSuccess: (result) => onSuccess?.(result, values, form),
        onError: (error) => setFormError(applyAdminFieldErrors(form, error, fieldAliases)),
      });
    },
    [fieldAliases, form, mutate, onSuccess, toInput],
  );

  const submit = useCallback(
    (event?: FormEvent<HTMLFormElement>) => form.handleSubmit(onValid)(event),
    [form, onValid],
  );

  return {
    form,
    /** Pass to `<form onSubmit={submit}>` (or call directly from a button). */
    submit,
    /** Server message that did not map to a field (or the generic error message). */
    formError,
    setFormError,
    pending: mutation.isPending,
    /** Disable Save while pending or untouched. */
    canSubmit: !mutation.isPending && form.formState.isDirty,
  };
}
