"use client";

import { useMemo } from "react";
import { Controller, useFieldArray, useWatch, type UseFormReturn } from "react-hook-form";
import { useRouter } from "next/navigation";
import { ArrowDown, ArrowUp, CheckSquare, CircleDollarSign, FileText, Flame, Link2, ListChecks, Plus, ScrollText, Sparkles, Star, Tags, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import type { AdminFormMutation } from "@/features/admin/data/use-admin-form";
import { useAdminForm } from "@/features/admin/data/use-admin-form";
import { POOJA_LIMITS, poojaStatusDescriptions, poojaStatusLabels, poojaStatusVariants } from "@/features/poojas/constants/pooja-status";
import { useCreatePooja, usePoojaCategories, usePoojaDetail, usePoojaOptions, useUpdatePooja } from "@/features/poojas/hooks/use-pooja-admin";
import {
  formValuesToPoojaInput,
  formValuesToPoojaUpdate,
  makePrimaryCategory,
  moveCategory,
  poojaToFormValues,
  toggleCategoryId,
  type PoojaFormValues,
} from "@/features/poojas/lib/pooja-form";
import type { ManagedPooja, PoojaCategoryRef, PoojaInput, PoojaStatus } from "@/features/poojas/types/pooja-admin";
import { CatalogEditorShell } from "../catalog/catalog-editor-shell";
import { PairRowsField, TextRowsField } from "../catalog/catalog-form-fields";
import { MarkerPill } from "../catalog/catalog-pills";
import { AdminCombobox } from "../shared/admin-combobox";
import type { AdminEditorSection } from "../shared/admin-editor-section-nav";
import { AdminFormField, AdminFormSection, fieldError } from "../shared/admin-form-section";
import { AdminImageField } from "../shared/admin-image-field";
import { AdminMoneyInput } from "../shared/admin-money-input";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminSelectField } from "../shared/admin-select-field";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { poojaEditorSchema } from "./pooja-editor-schema";

const sections: AdminEditorSection[] = [
  { id: "identity", label: "Identity", icon: Flame },
  { id: "categories", label: "Categories", icon: Tags },
  { id: "service", label: "Service & pricing", icon: CircleDollarSign },
  { id: "overview", label: "Overview", icon: FileText },
  { id: "quick-facts", label: "Quick facts", icon: ListChecks },
  { id: "ritual", label: "Ritual process", icon: ScrollText },
  { id: "required", label: "Required details", icon: CheckSquare },
  { id: "preparation", label: "Preparation", icon: Sparkles },
  { id: "related", label: "Related poojas", icon: Link2 },
  { id: "optional", label: "Optional section", icon: Plus },
];

/** Create (`poojaId` omitted) or edit an existing pooja. */
export function AdminPoojaEditor({ poojaId }: { poojaId?: string }) {
  if (!poojaId) return <CreatePoojaForm />;
  return <EditPoojaLoader poojaId={poojaId} />;
}

function CreatePoojaForm() {
  const router = useRouter();
  const create = useCreatePooja();
  return (
    <PoojaEditorForm
      pooja={null}
      mutation={create}
      toInput={formValuesToPoojaInput}
      onSaved={(pooja) => router.push(`/admin/poojas/${pooja.id}`)}
    />
  );
}

function EditPoojaLoader({ poojaId }: { poojaId: string }) {
  const detail = usePoojaDetail(poojaId);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="pooja">
      {() => <EditPoojaForm pooja={detail.data!} />}
    </AdminDetailFrame>
  );
}

function EditPoojaForm({ pooja }: { pooja: ManagedPooja }) {
  const router = useRouter();
  const update = useUpdatePooja(pooja.id);
  return <PoojaEditorForm pooja={pooja} mutation={update} toInput={formValuesToPoojaUpdate} onSaved={() => router.push(`/admin/poojas/${pooja.id}`)} />;
}

function PoojaEditorForm({
  pooja,
  mutation,
  toInput,
  onSaved,
}: {
  pooja: ManagedPooja | null;
  mutation: AdminFormMutation<PoojaInput, ManagedPooja>;
  toInput: (values: PoojaFormValues) => PoojaInput;
  onSaved: (pooja: ManagedPooja) => void;
}) {
  const isNew = !pooja;
  const defaultValues = useMemo(() => poojaToFormValues(pooja), [pooja]);
  const { form, submit, formError, pending } = useAdminForm({
    schema: poojaEditorSchema,
    defaultValues,
    mutation,
    toInput,
    onSuccess: (result, values, current) => {
      current.reset(values);
      onSaved(result);
    },
  });
  const errors = form.formState.errors;
  const optionalEnabled = useWatch({ control: form.control, name: "content.optionalSectionEnabled" });

  return (
    <CatalogEditorShell
      title={isNew ? "New pooja" : `Edit ${pooja.name}`}
      description={isNew ? "New poojas start as drafts unless you publish them here." : undefined}
      meta={isNew ? undefined : <AdminStatusBadge status={pooja.status} labels={poojaStatusLabels} variants={poojaStatusVariants} />}
      cancelHref={isNew ? "/admin/poojas" : `/admin/poojas/${pooja.id}`}
      backLabel={isNew ? "Poojas" : "Back to pooja"}
      sections={sections}
      submitLabel={isNew ? "Create pooja" : "Save changes"}
      pending={pending}
      dirty={form.formState.isDirty}
      formError={formError}
      onSubmit={submit}
    >
      <AdminFormSection id="identity" title="Identity" description="Shown on the pooja listing and detail page. Describe the ritual; avoid promising outcomes.">
        <AdminFormField label="Name" required error={fieldError(errors, "name")}>
          {(control) => <Input {...control} maxLength={180} {...form.register("name")} />}
        </AdminFormField>
        <AdminFormField label="Short description" required description="One or two sentences for cards and search results." error={fieldError(errors, "shortDescription")}>
          {(control) => <Textarea {...control} rows={2} maxLength={500} {...form.register("shortDescription")} />}
        </AdminFormField>
        <AdminFormField label="Description" required error={fieldError(errors, "description")}>
          {(control) => <Textarea {...control} rows={6} {...form.register("description")} />}
        </AdminFormField>
        <Controller
          name="imageUrl"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminImageField label="Cover image" value={field.value} onChange={field.onChange} error={fieldState.error?.message} aspect="video" disabled={pending} />
          )}
        />
      </AdminFormSection>

      <AdminFormSection id="categories" title="Categories" description={`Choose up to ${POOJA_LIMITS.maxCategories}. The first category is the primary one shown on cards and used for the public category page.`}>
        <Controller
          name="categoryIds"
          control={form.control}
          render={({ field, fieldState }) => (
            <PoojaCategoryPicker value={field.value} onChange={field.onChange} known={pooja?.categories ?? []} error={fieldState.error?.message} disabled={pending} />
          )}
        />
      </AdminFormSection>

      <AdminFormSection id="service" title="Service & pricing">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="pricePaise"
            control={form.control}
            render={({ field, fieldState }) => (
              <AdminFormField label="Price" description="Leave empty for “price on request”." error={fieldState.error?.message}>
                {(control) => <AdminMoneyInput {...control} value={field.value} onChange={field.onChange} onBlur={field.onBlur} disabled={pending} />}
              </AdminFormField>
            )}
          />
          <AdminFormField label="Duration (minutes)" description={`1–${POOJA_LIMITS.maxDurationMinutes}; leave empty if it varies.`} error={fieldError(errors, "durationMinutes")}>
            {(control) => <Input {...control} inputMode="numeric" placeholder="e.g. 90" {...form.register("durationMinutes")} />}
          </AdminFormField>
        </div>
        <Controller
          name="featured"
          control={form.control}
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <Label htmlFor="pooja-featured" className="flex items-center gap-1.5">
                  <Star className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  Featured
                </Label>
                <p className="text-xs text-muted-foreground">Highlighted first in the public pooja listing.</p>
              </div>
              <Switch id="pooja-featured" checked={field.value} onCheckedChange={field.onChange} disabled={pending} />
            </div>
          )}
        />
        {isNew ? (
          <Controller
            name="status"
            control={form.control}
            render={({ field }) => (
              <AdminFormField label="Initial status" description={poojaStatusDescriptions[field.value]}>
                {(control) => (
                  <AdminSelectField
                    control={control}
                    value={field.value}
                    onValueChange={(value) => field.onChange((value ?? "draft") as PoojaStatus)}
                    onBlur={field.onBlur}
                    options={poojaStatusLabels}
                    disabled={pending}
                  />
                )}
              </AdminFormField>
            )}
          />
        ) : (
          <p className="text-[13px] text-muted-foreground">Publish, suspend or move back to draft from the pooja’s page (currently {poojaStatusLabels[pooja.status].toLowerCase()}).</p>
        )}
      </AdminFormSection>

      <AdminFormSection id="overview" title="Overview" description="Optional eyebrow and paragraphs shown under the hero.">
        <AdminFormField label="Eyebrow" description="A short line above the title, for example “Home ritual”." error={fieldError(errors, "content.eyebrow")}>
          {(control) => <Input {...control} maxLength={120} {...form.register("content.eyebrow")} />}
        </AdminFormField>
        <TextRowsField form={form} name="content.overview" label="Overview paragraphs" itemLabel="Overview paragraph" addLabel="Add paragraph" multiline disabled={pending} />
      </AdminFormSection>

      <AdminFormSection id="quick-facts" title="Quick facts">
        <PairRowsField form={form} name="content.quickFacts" label="Facts" itemLabel="Quick fact" addLabel="Add quick fact" keys={["label", "value"]} labels={["Label", "Value"]} disabled={pending} />
      </AdminFormSection>

      <AdminFormSection id="ritual" title="Ritual process">
        <PairRowsField form={form} name="content.ritualSteps" label="Steps (in order)" itemLabel="Ritual step" addLabel="Add step" keys={["title", "description"]} labels={["Step title", "What happens"]} secondMultiline disabled={pending} />
      </AdminFormSection>

      <AdminFormSection id="required" title="Required details" description="What the customer is asked to share when requesting this pooja.">
        <TextRowsField form={form} name="content.requiredDetails" label="Details" itemLabel="Required detail" addLabel="Add detail" disabled={pending} />
      </AdminFormSection>

      <AdminFormSection id="preparation" title="Preparation">
        <TextRowsField form={form} name="content.preparationNotes" label="Preparation notes" itemLabel="Preparation note" addLabel="Add note" multiline disabled={pending} />
      </AdminFormSection>

      <AdminFormSection id="related" title="Related poojas" description="Other poojas suggested at the bottom of this page, in this order.">
        <RelatedPoojasField form={form} currentSlug={pooja?.slug} disabled={pending} />
      </AdminFormSection>

      <AdminFormSection id="optional" title="Optional section" description="An extra titled block, for example significance or variations.">
        <Controller
          name="content.optionalSectionEnabled"
          control={form.control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch id="pooja-optional" checked={field.value} onCheckedChange={field.onChange} disabled={pending} />
              <Label htmlFor="pooja-optional">Include this section</Label>
            </div>
          )}
        />
        {optionalEnabled ? (
          <>
            <AdminFormField label="Section title" required error={fieldError(errors, "content.optionalSection.title")}>
              {(control) => <Input {...control} maxLength={160} {...form.register("content.optionalSection.title")} />}
            </AdminFormField>
            <TextRowsField form={form} name="content.optionalSection.body" label="Paragraphs" itemLabel="Section paragraph" addLabel="Add paragraph" multiline disabled={pending} />
          </>
        ) : null}
      </AdminFormSection>
    </CatalogEditorShell>
  );
}

/** Ordered multi-select over the active pooja categories; index 0 is primary. */
function PoojaCategoryPicker({
  value,
  onChange,
  known,
  error,
  disabled,
}: {
  value: string[];
  onChange: (ids: string[]) => void;
  /** Categories already linked to the pooja (names for ids that are no longer active). */
  known: PoojaCategoryRef[];
  error?: string;
  disabled?: boolean;
}) {
  const categories = usePoojaCategories();
  const options = useMemo(() => categories.data ?? [], [categories.data]);
  const names = useMemo(() => new Map([...known, ...options].map((category) => [category.id, category.name])), [known, options]);
  const activeIds = useMemo(() => new Set(options.map((category) => category.id)), [options]);
  const full = value.length >= POOJA_LIMITS.maxCategories;

  return (
    <div className="grid gap-4">
      {value.length ? (
        <ol className="grid gap-1.5" aria-label="Selected categories">
          {value.map((id, index) => (
            <li key={id} className="flex items-center gap-2 rounded-[calc(var(--radius)-2px)] border border-border bg-surface px-3 py-1.5 text-sm">
              <span className="min-w-0 flex-1 truncate font-medium">{names.get(id) ?? "Unknown category"}</span>
              {index === 0 ? <MarkerPill>Primary</MarkerPill> : null}
              {categories.isSuccess && !activeIds.has(id) ? <MarkerPill>Inactive</MarkerPill> : null}
              {index > 0 ? (
                <Button type="button" variant="ghost" size="xs" disabled={disabled} onClick={() => onChange(makePrimaryCategory(value, id))}>
                  Make primary
                </Button>
              ) : null}
              <Button type="button" variant="ghost" size="sm" className="size-8 p-0" aria-label={`Move ${names.get(id) ?? "category"} up`} disabled={disabled || index === 0} onClick={() => onChange(moveCategory(value, index, -1))}>
                <ArrowUp aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="sm" className="size-8 p-0" aria-label={`Move ${names.get(id) ?? "category"} down`} disabled={disabled || index === value.length - 1} onClick={() => onChange(moveCategory(value, index, 1))}>
                <ArrowDown aria-hidden="true" />
              </Button>
              <Button type="button" variant="ghost" size="sm" className="size-8 p-0 hover:text-destructive" aria-label={`Remove ${names.get(id) ?? "category"}`} disabled={disabled} onClick={() => onChange(toggleCategoryId(value, id))}>
                <X aria-hidden="true" />
              </Button>
            </li>
          ))}
        </ol>
      ) : null}
      {categories.isPending ? (
        <p className="text-sm text-muted-foreground" role="status">Loading categories…</p>
      ) : categories.isError ? (
        <div className="flex items-center gap-3 text-sm text-destructive">
          Could not load categories.
          <Button type="button" variant="outline" size="xs" onClick={() => void categories.refetch()}>
            Retry
          </Button>
        </div>
      ) : options.length === 0 ? (
        <p className="text-sm text-muted-foreground">No active pooja categories. Add one under Master data → Pooja categories.</p>
      ) : (
        <fieldset className="grid gap-2 sm:grid-cols-2" disabled={disabled}>
          <legend className="sr-only">Available categories</legend>
          {options.map((category) => {
            const id = `pooja-category-${category.id}`;
            const checked = value.includes(category.id);
            return (
              <div key={category.id} className="flex items-center gap-2">
                <Checkbox id={id} checked={checked} disabled={!checked && full} onCheckedChange={() => onChange(toggleCategoryId(value, category.id))} />
                <Label htmlFor={id} className="font-normal">
                  {category.name}
                </Label>
              </div>
            );
          })}
        </fieldset>
      )}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}

/**
 * Related poojas as an ordered list plus a searchable picker over the admin poojas list (first 100). The API stores
 * slugs, so the picked pooja's slug is saved; a slug can still be typed for a pooja outside the first 100.
 */
function RelatedPoojasField({ form, currentSlug, disabled }: { form: UseFormReturn<PoojaFormValues>; currentSlug?: string; disabled?: boolean }) {
  const rows = useFieldArray({ control: form.control, name: "content.relatedSlugs" });
  const watched = useWatch({ control: form.control, name: "content.relatedSlugs" });
  const poojas = usePoojaOptions();
  const bySlug = useMemo(() => new Map((poojas.data ?? []).map((item) => [item.slug, item.name])), [poojas.data]);
  const chosen = useMemo(() => new Set((watched ?? []).map((row) => row.text.trim()).filter(Boolean)), [watched]);
  const options = useMemo(
    () =>
      (poojas.data ?? [])
        .filter((item) => item.slug !== currentSlug)
        .map((item) => ({ value: item.slug, label: item.name, description: poojaStatusLabels[item.status], disabled: chosen.has(item.slug) })),
    [poojas.data, currentSlug, chosen],
  );
  const full = rows.fields.length >= POOJA_LIMITS.maxRelatedSlugs;
  const listError = fieldError(form.formState.errors, "content.relatedSlugs");

  return (
    <div className="grid gap-3">
      {rows.fields.length ? (
        <ol className="grid gap-1.5" aria-label="Related poojas">
          {rows.fields.map((field, index) => {
            const slug = watched?.[index]?.text ?? "";
            const name = bySlug.get(slug);
            const label = name ?? slug;
            const error = fieldError(form.formState.errors, `content.relatedSlugs.${index}.text`) ?? fieldError(form.formState.errors, `content.relatedSlugs.${index}`);
            return (
              <li key={field.id} className="grid gap-1">
                <div className="flex items-center gap-2 rounded-[calc(var(--radius)-2px)] border border-border bg-surface px-3 py-1.5 text-sm">
                  <span className="min-w-0 flex-1 truncate">
                    <span className="font-medium">{label}</span>
                    {!name && poojas.isSuccess ? <span className="ml-2 text-xs text-muted-foreground">Not in the pooja list</span> : null}
                  </span>
                  <Button type="button" variant="ghost" size="sm" className="size-8 p-0" aria-label={`Move ${label} up`} disabled={disabled || index === 0} onClick={() => rows.move(index, index - 1)}>
                    <ArrowUp aria-hidden="true" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="size-8 p-0" aria-label={`Move ${label} down`} disabled={disabled || index === rows.fields.length - 1} onClick={() => rows.move(index, index + 1)}>
                    <ArrowDown aria-hidden="true" />
                  </Button>
                  <Button type="button" variant="ghost" size="sm" className="size-8 p-0 hover:text-destructive" aria-label={`Remove ${label}`} disabled={disabled} onClick={() => rows.remove(index)}>
                    <X aria-hidden="true" />
                  </Button>
                </div>
                {error ? <p className="text-xs text-destructive">{error}</p> : null}
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="text-sm text-muted-foreground">No related poojas yet.</p>
      )}
      <AdminFormField
        label="Add a related pooja"
        description={full ? `You can link up to ${POOJA_LIMITS.maxRelatedSlugs} poojas.` : poojas.isError ? "Could not load poojas. You can still type a pooja’s web address (slug)." : undefined}
      >
        {(control) => (
          <AdminCombobox
            control={control}
            value={null}
            onValueChange={(slug) => {
              if (slug && !chosen.has(slug)) rows.append({ text: slug });
            }}
            options={options}
            loading={poojas.isPending}
            placeholder="Choose a pooja"
            searchPlaceholder="Search poojas…"
            emptyText="No poojas match."
            allowCustom={{ label: (query) => `Use web address “${query}”`, validate: (query) => /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(query) && !chosen.has(query), maxLength: 140 }}
            disabled={disabled || full}
          />
        )}
      </AdminFormField>
      {listError ? <p className="text-xs text-destructive">{listError}</p> : null}
    </div>
  );
}
