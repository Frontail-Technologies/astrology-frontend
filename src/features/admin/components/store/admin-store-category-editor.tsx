"use client";

import { useMemo } from "react";
import { Controller } from "react-hook-form";
import { useRouter } from "next/navigation";
import { FileText, HelpCircle, Sparkles, Tags } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminForm, type AdminFormMutation } from "@/features/admin/data/use-admin-form";
import { useCreateStoreCategory, useStoreCategoryDetail, useUpdateStoreCategory } from "@/features/store/hooks/use-store-admin";
import { categoryToFormValues, formToCategoryInput, formToCategoryUpdate, type StoreCategoryFormValues } from "@/features/store/lib/store-form";
import type { ManagedStoreCategory, StoreCategoryInput } from "@/features/store/types/store-admin";
import { CatalogEditorShell } from "../catalog/catalog-editor-shell";
import { PairRowsField, TextRowsField } from "../catalog/catalog-form-fields";
import { ActivePill } from "../catalog/catalog-pills";
import type { AdminEditorSection } from "../shared/admin-editor-section-nav";
import { AdminFormField, AdminFormSection, fieldError } from "../shared/admin-form-section";
import { AdminImageField } from "../shared/admin-image-field";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { storeCategoryEditorSchema } from "./store-category-editor-schema";

const sections: AdminEditorSection[] = [
  { id: "category", label: "Category", icon: Tags },
  { id: "about", label: "About", icon: FileText },
  { id: "highlights", label: "Highlights", icon: Sparkles },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

export function AdminStoreCategoryEditor({ categoryId }: { categoryId?: string }) {
  if (!categoryId) return <CreateCategoryForm />;
  return <EditCategoryLoader categoryId={categoryId} />;
}

function CreateCategoryForm() {
  const router = useRouter();
  const create = useCreateStoreCategory();
  return <CategoryEditorForm category={null} mutation={create} toInput={formToCategoryInput} onSaved={(category) => router.push(`/admin/store/categories/${category.id}`)} />;
}

function EditCategoryLoader({ categoryId }: { categoryId: string }) {
  const detail = useStoreCategoryDetail(categoryId);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="category">
      {() => <EditCategoryForm category={detail.data!} />}
    </AdminDetailFrame>
  );
}

function EditCategoryForm({ category }: { category: ManagedStoreCategory }) {
  const router = useRouter();
  const update = useUpdateStoreCategory(category.id);
  return <CategoryEditorForm category={category} mutation={update} toInput={formToCategoryUpdate} onSaved={() => router.push(`/admin/store/categories/${category.id}`)} />;
}

function CategoryEditorForm({
  category,
  mutation,
  toInput,
  onSaved,
}: {
  category: ManagedStoreCategory | null;
  mutation: AdminFormMutation<StoreCategoryInput, ManagedStoreCategory>;
  toInput: (values: StoreCategoryFormValues) => StoreCategoryInput;
  onSaved: (category: ManagedStoreCategory) => void;
}) {
  const isNew = !category;
  const defaultValues = useMemo(() => categoryToFormValues(category), [category]);
  const { form, submit, formError, pending } = useAdminForm({
    schema: storeCategoryEditorSchema,
    defaultValues,
    mutation,
    toInput,
    onSuccess: (result, values, current) => {
      current.reset(values);
      onSaved(result);
    },
  });
  const errors = form.formState.errors;

  return (
    <CatalogEditorShell
      title={isNew ? "New store category" : `Edit ${category.name}`}
      meta={isNew ? undefined : <ActivePill active={category.active} />}
      cancelHref={isNew ? "/admin/store/categories" : `/admin/store/categories/${category.id}`}
      backLabel={isNew ? "Store categories" : "Back to category"}
      sections={sections}
      submitLabel={isNew ? "Create category" : "Save changes"}
      pending={pending}
      dirty={form.formState.isDirty}
      formError={formError}
      onSubmit={submit}
    >
      <AdminFormSection id="category" title="Category">
        <AdminFormField label="Name" required error={fieldError(errors, "name")}>
          {(control) => <Input {...control} maxLength={120} {...form.register("name")} />}
        </AdminFormField>
        <AdminFormField label="Description" description="Short line shown on category cards." error={fieldError(errors, "description")}>
          {(control) => <Textarea {...control} rows={3} maxLength={2000} {...form.register("description")} />}
        </AdminFormField>
        <Controller
          name="imageUrl"
          control={form.control}
          render={({ field, fieldState }) => <AdminImageField label="Category image" value={field.value} onChange={field.onChange} error={fieldState.error?.message} aspect="wide" disabled={pending} />}
        />
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminFormField label="Sort order" description="Lower numbers are listed first." error={fieldError(errors, "sortOrder")}>
            {(control) => <Input {...control} inputMode="numeric" {...form.register("sortOrder")} />}
          </AdminFormField>
          {isNew ? (
            <Controller
              name="active"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center gap-2 self-center pt-5">
                  <Switch id="category-active" checked={field.value} onCheckedChange={field.onChange} disabled={pending} />
                  <Label htmlFor="category-active">Active on the storefront</Label>
                </div>
              )}
            />
          ) : (
            <p className="self-center text-[13px] text-muted-foreground">Activate or deactivate this category from its page.</p>
          )}
        </div>
      </AdminFormSection>
      <AdminFormSection id="about" title="About" description="Paragraphs for the category landing page.">
        <TextRowsField form={form} name="details.about" label="Paragraphs" itemLabel="About paragraph" addLabel="Add paragraph" multiline max={20} disabled={pending} />
      </AdminFormSection>
      <AdminFormSection id="highlights" title="Highlights">
        <TextRowsField form={form} name="details.highlights" label="Highlights" itemLabel="Highlight" addLabel="Add highlight" max={20} disabled={pending} />
      </AdminFormSection>
      <AdminFormSection id="faq" title="FAQ">
        <PairRowsField form={form} name="details.faq" label="Questions" itemLabel="Question" addLabel="Add question" keys={["question", "answer"]} labels={["Question", "Answer"]} secondMultiline max={20} disabled={pending} />
      </AdminFormSection>
    </CatalogEditorShell>
  );
}
