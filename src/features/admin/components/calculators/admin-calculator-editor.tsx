"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller, useFieldArray } from "react-hook-form";
import { ArrowDown, ArrowUp, Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminForm } from "@/features/admin/data/use-admin-form";
import { CALCULATOR_LIMITS, calculatorCategoryLabels } from "@/features/calculators/constants/calculator-status";
import { useCalculatorDetail, useCreateCalculator, useUpdateCalculator } from "@/features/calculators/hooks/use-calculator-admin";
import { calculatorFormSchema, calculatorFormToInput, calculatorToFormValues, emptyCalculatorForm, type CalculatorFormValues } from "@/features/calculators/lib/calculator-form";
import type { CalculatorInput, ManagedCalculator } from "@/features/calculators/types/calculator-admin";
import { AdminFormError, AdminFormField, AdminFormSection, fieldError } from "../shared/admin-form-section";
import { AdminImageField } from "../shared/admin-image-field";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSelectField } from "../shared/admin-select-field";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { CalculatorKeywordInput } from "./calculator-keyword-input";

/** Server detail paths map onto the flat editor fields. */
const fieldAliases = { "detail.intro": "intro", "detail.howItWorks": "howItWorks", "detail.submitLabel": "submitLabel", "detail.privacyNote": "privacyNote" };

/** `/admin/calculators/new` (no id) or `/admin/calculators/[id]/edit`. */
export function AdminCalculatorEditor({ id }: { id?: string }) {
  const detail = useCalculatorDetail(id ?? "");
  if (!id) return <CalculatorForm />;
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="calculator">
      {() => <CalculatorForm key={detail.data!.id} calculator={detail.data!} />}
    </AdminDetailFrame>
  );
}

function CalculatorForm({ calculator }: { calculator?: ManagedCalculator }) {
  const router = useRouter();
  const create = useCreateCalculator();
  const update = useUpdateCalculator(calculator?.id ?? "");
  const previousDetail = calculator?.detail ?? null;
  const { form, submit, formError, pending } = useAdminForm<CalculatorFormValues, CalculatorFormValues, CalculatorInput, ManagedCalculator>({
    schema: calculatorFormSchema,
    defaultValues: calculator ? calculatorToFormValues(calculator) : emptyCalculatorForm,
    mutation: calculator ? update : create,
    toInput: (values) => calculatorFormToInput(values, previousDetail),
    onSuccess: (saved) => router.push(`/admin/calculators/${saved.id}`),
    fieldAliases,
  });
  const errors = form.formState.errors;
  const steps = useFieldArray({ control: form.control, name: "howItWorks" });
  const cancelHref = calculator ? `/admin/calculators/${calculator.id}` : "/admin/calculators";
  const saveButton = (
    <Button type="submit" variant="conversion" size="sm" disabled={pending || (Boolean(calculator) && !form.formState.isDirty)}>
      {pending ? "Saving…" : calculator ? "Save changes" : "Create calculator"}
    </Button>
  );
  const cancelButton = (
    <Button asChild variant="outline" size="sm" className="bg-surface">
      <Link href={cancelHref}>Cancel</Link>
    </Button>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <AdminPageHeader
        title={calculator ? `Edit ${calculator.name}` : "New calculator"}
        description={calculator ? undefined : "New calculators are listed as “Coming soon”. Change the status from the calculator page."}
        backHref={cancelHref}
        backLabel={calculator ? "Back to calculator" : "Calculators"}
        actions={cancelButton}
        primaryAction={saveButton}
      />
      <AdminFormError message={formError} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <AdminFormSection title="Catalog card">
            <AdminFormField label="Name" required error={fieldError(errors, "name")}>
              {(control) => <Input {...control} {...form.register("name")} maxLength={CALCULATOR_LIMITS.name[1]} />}
            </AdminFormField>
            <AdminFormField label="Short description" required error={fieldError(errors, "shortDescription")}>
              {(control) => <Textarea {...control} {...form.register("shortDescription")} rows={3} maxLength={CALCULATOR_LIMITS.shortDescription} />}
            </AdminFormField>
            <Controller
              name="keywords"
              control={form.control}
              render={({ field }) => (
                <AdminFormField
                  label="Keywords"
                  description={`Words people might search for. Press Enter after each one (up to ${CALCULATOR_LIMITS.keywords}).`}
                  error={fieldError(errors, "keywords")}
                >
                  {(control) => <CalculatorKeywordInput control={control} value={field.value} onChange={field.onChange} onBlur={field.onBlur} disabled={pending} />}
                </AdminFormField>
              )}
            />
            <Controller
              name="imageSrc"
              control={form.control}
              render={({ field, fieldState }) => (
                <AdminImageField label="Image (required)" value={field.value} onChange={(value) => field.onChange(value)} error={fieldState.error?.message} aspect="video" disabled={pending} />
              )}
            />
          </AdminFormSection>
          <AdminFormSection title="Detail page" description="Other detail settings (form component, input sections, result labels, related calculators) are kept as they are.">
            <AdminFormField label="Introduction" error={fieldError(errors, "intro")}>
              {(control) => <Textarea {...control} {...form.register("intro")} rows={3} maxLength={CALCULATOR_LIMITS.intro} />}
            </AdminFormField>
            <fieldset className="grid gap-2">
              <legend className="mb-1 text-sm font-medium">How it works</legend>
              {steps.fields.length === 0 ? <p className="text-xs text-muted-foreground">No steps yet.</p> : null}
              <ol className="grid gap-2">
                {steps.fields.map((step, index) => (
                  <li key={step.id} className="grid gap-1">
                    <div className="flex items-start gap-2">
                      <span className="mt-2.5 w-5 shrink-0 text-right text-xs tabular-nums text-muted-foreground">{index + 1}.</span>
                      <Textarea
                        {...form.register(`howItWorks.${index}.text`)}
                        aria-label={`Step ${index + 1}`}
                        aria-invalid={fieldError(errors, `howItWorks.${index}.text`) ? true : undefined}
                        rows={2}
                        maxLength={CALCULATOR_LIMITS.howItWorksItem}
                        className="min-h-0 flex-1"
                      />
                      <div className="flex shrink-0 flex-col">
                        <Button type="button" variant="ghost" size="xs" aria-label={`Move step ${index + 1} up`} disabled={index === 0} onClick={() => steps.move(index, index - 1)}>
                          <ArrowUp aria-hidden="true" />
                        </Button>
                        <Button type="button" variant="ghost" size="xs" aria-label={`Move step ${index + 1} down`} disabled={index === steps.fields.length - 1} onClick={() => steps.move(index, index + 1)}>
                          <ArrowDown aria-hidden="true" />
                        </Button>
                      </div>
                      <Button type="button" variant="ghost" size="xs" aria-label={`Remove step ${index + 1}`} onClick={() => steps.remove(index)}>
                        <Trash2 aria-hidden="true" />
                      </Button>
                    </div>
                    {fieldError(errors, `howItWorks.${index}.text`) ? <p className="pl-7 text-xs text-destructive">{fieldError(errors, `howItWorks.${index}.text`)}</p> : null}
                  </li>
                ))}
              </ol>
              {fieldError(errors, "howItWorks") ? <p className="text-xs text-destructive">{fieldError(errors, "howItWorks")}</p> : null}
              <div>
                <Button type="button" variant="outline" size="sm" disabled={steps.fields.length >= CALCULATOR_LIMITS.howItWorks} onClick={() => steps.append({ text: "" })}>
                  <Plus aria-hidden="true" />
                  Add step
                </Button>
              </div>
            </fieldset>
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminFormField label="Submit button label" error={fieldError(errors, "submitLabel")}>
                {(control) => <Input {...control} {...form.register("submitLabel")} maxLength={CALCULATOR_LIMITS.submitLabel} />}
              </AdminFormField>
              <AdminFormField label="Privacy note" error={fieldError(errors, "privacyNote")}>
                {(control) => <Input {...control} {...form.register("privacyNote")} maxLength={CALCULATOR_LIMITS.privacyNote} />}
              </AdminFormField>
            </div>
          </AdminFormSection>
        </div>
        <aside className="min-w-0 space-y-5">
          <AdminFormSection title="Catalog">
            <Controller
              name="category"
              control={form.control}
              render={({ field }) => (
                <AdminFormField label="Category" required error={fieldError(errors, "category")}>
                  {(control) => (
                    <AdminSelectField
                      control={control}
                      value={field.value}
                      onValueChange={(value) => field.onChange((value ?? "") as CalculatorFormValues["category"])}
                      onBlur={field.onBlur}
                      options={calculatorCategoryLabels}
                      placeholder="Choose a category"
                      disabled={pending}
                    />
                  )}
                </AdminFormField>
              )}
            />
            <AdminFormField label="Sort order" description="Lower numbers show first." error={fieldError(errors, "sortOrder")}>
              {(control) => <Input {...control} {...form.register("sortOrder")} inputMode="numeric" />}
            </AdminFormField>
            <Controller
              name="featured"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center justify-between gap-3">
                  <Label htmlFor="calculator-featured" className="font-normal">
                    Featured on the calculators page
                  </Label>
                  <Switch id="calculator-featured" checked={field.value} onCheckedChange={field.onChange} />
                </div>
              )}
            />
          </AdminFormSection>
        </aside>
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-4 md:hidden">
        {cancelButton}
        {saveButton}
      </div>
    </form>
  );
}
