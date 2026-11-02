"use client";

import { useMemo } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { Boxes, CircleDollarSign, FileText, HelpCircle, ImageIcon, ListChecks, Package, Sparkles, Star } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminForm, type AdminFormMutation } from "@/features/admin/data/use-admin-form";
import { STORE_LIMITS, catalogStatusDescriptions, catalogStatusLabels, catalogStatusVariants } from "@/features/store/constants/store-status";
import { useCreateStoreProduct, useStoreCategoryOptions, useStoreProductDetail, useUpdateStoreProduct } from "@/features/store/hooks/use-store-admin";
import { formToProductInput, productToFormValues, type StoreProductFormValues } from "@/features/store/lib/store-form";
import type { CatalogStatus, ManagedStoreProduct, StoreProductInput } from "@/features/store/types/store-admin";
import { CatalogEditorShell } from "../catalog/catalog-editor-shell";
import { PairRowsField, TextRowsField } from "../catalog/catalog-form-fields";
import type { AdminEditorSection } from "../shared/admin-editor-section-nav";
import { AdminFormField, AdminFormSection, fieldError } from "../shared/admin-form-section";
import { AdminImageGalleryField } from "../shared/admin-image-gallery-field";
import { AdminMoneyInput } from "../shared/admin-money-input";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminCombobox } from "../shared/admin-combobox";
import { AdminSelectField } from "../shared/admin-select-field";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { storeProductEditorSchema } from "./store-product-editor-schema";

const sections: AdminEditorSection[] = [
  { id: "product", label: "Product", icon: Package },
  { id: "media", label: "Images", icon: ImageIcon },
  { id: "pricing", label: "Pricing & stock", icon: CircleDollarSign },
  { id: "overview", label: "Overview", icon: FileText },
  { id: "highlights", label: "Highlights", icon: Sparkles },
  { id: "specifications", label: "Specifications", icon: ListChecks },
  { id: "care", label: "Care", icon: Boxes },
  { id: "faq", label: "FAQ", icon: HelpCircle },
];

export function AdminStoreProductEditor({ productId }: { productId?: string }) {
  if (!productId) return <CreateProductForm />;
  return <EditProductLoader productId={productId} />;
}

function CreateProductForm() {
  const router = useRouter();
  const create = useCreateStoreProduct();
  return <ProductEditorForm product={null} mutation={create} onSaved={(product) => router.push(`/admin/store/products/${product.id}`)} />;
}

function EditProductLoader({ productId }: { productId: string }) {
  const detail = useStoreProductDetail(productId);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="product">
      {() => <EditProductForm product={detail.data!} />}
    </AdminDetailFrame>
  );
}

function EditProductForm({ product }: { product: ManagedStoreProduct }) {
  const router = useRouter();
  const update = useUpdateStoreProduct(product.id);
  return <ProductEditorForm product={product} mutation={update} onSaved={() => router.push(`/admin/store/products/${product.id}`)} />;
}

function ProductEditorForm({
  product,
  mutation,
  onSaved,
}: {
  product: ManagedStoreProduct | null;
  mutation: AdminFormMutation<StoreProductInput, ManagedStoreProduct>;
  onSaved: (product: ManagedStoreProduct) => void;
}) {
  const isNew = !product;
  const defaultValues = useMemo(() => productToFormValues(product), [product]);
  const existingMedia = product?.media;
  const toInput = useMemo(() => (values: StoreProductFormValues) => formToProductInput(values, existingMedia ?? []), [existingMedia]);
  const { form, submit, formError, pending } = useAdminForm({
    schema: storeProductEditorSchema,
    defaultValues,
    mutation,
    toInput,
    onSuccess: (result, values, current) => {
      current.reset(values);
      onSaved(result);
    },
  });
  const errors = form.formState.errors;
  const tracked = useWatch({ control: form.control, name: "inventoryTracked" });
  const categories = useStoreCategoryOptions();

  return (
    <CatalogEditorShell
      title={isNew ? "New product" : `Edit ${product.name}`}
      meta={isNew ? undefined : <AdminStatusBadge status={product.catalogStatus} labels={catalogStatusLabels} variants={catalogStatusVariants} />}
      cancelHref={isNew ? "/admin/store/products" : `/admin/store/products/${product.id}`}
      backLabel={isNew ? "Products" : "Back to product"}
      sections={sections}
      submitLabel={isNew ? "Create product" : "Save changes"}
      pending={pending}
      dirty={form.formState.isDirty}
      formError={formError}
      onSubmit={submit}
    >
      <AdminFormSection id="product" title="Product">
        <AdminFormField label="Name" required error={fieldError(errors, "name")}>
          {(control) => <Input {...control} maxLength={180} {...form.register("name")} />}
        </AdminFormField>
        <AdminFormField label="Short description" description="Shown on product cards." error={fieldError(errors, "shortDescription")}>
          {(control) => <Textarea {...control} rows={2} maxLength={500} {...form.register("shortDescription")} />}
        </AdminFormField>
        <AdminFormField label="Description" error={fieldError(errors, "description")}>
          {(control) => <Textarea {...control} rows={6} maxLength={10_000} {...form.register("description")} />}
        </AdminFormField>
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="categoryId"
            control={form.control}
            render={({ field, fieldState }) => (
              <AdminFormField
                label="Category"
                error={fieldState.error?.message}
                description={categories.isError ? "Could not load categories." : "Leave empty to keep the product uncategorized."}
              >
                {(control) => (
                  <AdminCombobox
                    control={control}
                    value={field.value || null}
                    onValueChange={(value) => field.onChange(value ?? "")}
                    options={(categories.data ?? []).map((category) => ({ value: category.id, label: category.name, description: category.active ? undefined : "Inactive" }))}
                    selectedLabel={product?.category && product.category.id === field.value ? product.category.name : "Selected category"}
                    loading={categories.isPending}
                    placeholder="Uncategorized"
                    searchPlaceholder="Search categories…"
                    emptyText="No categories match."
                    clearable
                    disabled={pending}
                  />
                )}
              </AdminFormField>
            )}
          />
          <Controller
            name="catalogStatus"
            control={form.control}
            render={({ field }) => (
              <AdminFormField label="Catalog status" description={catalogStatusDescriptions[field.value]}>
                {(control) => (
                  <AdminSelectField
                    control={control}
                    value={field.value}
                    onValueChange={(value) => field.onChange((value ?? "draft") as CatalogStatus)}
                    onBlur={field.onBlur}
                    options={catalogStatusLabels}
                    disabled={pending}
                  />
                )}
              </AdminFormField>
            )}
          />
        </div>
        <Controller
          name="featured"
          control={form.control}
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <Label htmlFor="product-featured" className="flex items-center gap-1.5">
                  <Star className="size-3.5 text-muted-foreground" aria-hidden="true" />
                  Featured
                </Label>
                <p className="text-xs text-muted-foreground">Highlighted on the storefront.</p>
              </div>
              <Switch id="product-featured" checked={field.value} onCheckedChange={field.onChange} disabled={pending} />
            </div>
          )}
        />
      </AdminFormSection>

      <AdminFormSection id="media" title="Images" description="The primary image is used on cards. Set the order with the arrow buttons.">
        <Controller
          name="media"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminImageGalleryField label="Product images" value={field.value} onChange={field.onChange} max={STORE_LIMITS.maxMedia} error={fieldState.error?.message ?? fieldError(errors, "media.root")} disabled={pending} defaultAlt={form.getValues("name") || undefined} />
          )}
        />
      </AdminFormSection>

      <AdminFormSection id="pricing" title="Pricing & stock" description="A product is purchasable only when published, priced above zero and (if tracked) in stock.">
        <Controller
          name="pricePaise"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminFormField label="Price" description="Leave empty while the price is not set." error={fieldState.error?.message}>
              {(control) => <AdminMoneyInput {...control} value={field.value} onChange={field.onChange} onBlur={field.onBlur} disabled={pending} className="sm:max-w-xs" />}
            </AdminFormField>
          )}
        />
        <Controller
          name="inventoryTracked"
          control={form.control}
          render={({ field }) => (
            <div className="flex items-center gap-2">
              <Switch id="product-tracked" checked={field.value} onCheckedChange={field.onChange} disabled={pending} />
              <Label htmlFor="product-tracked">Track inventory</Label>
            </div>
          )}
        />
        {tracked ? (
          <AdminFormField label="Units in stock" required error={fieldError(errors, "inventoryQuantity")} className="sm:max-w-xs">
            {(control) => <Input {...control} inputMode="numeric" {...form.register("inventoryQuantity")} />}
          </AdminFormField>
        ) : null}
      </AdminFormSection>

      <AdminFormSection id="overview" title="Overview">
        <TextRowsField form={form} name="details.overview" label="Paragraphs" itemLabel="Overview paragraph" addLabel="Add paragraph" multiline max={STORE_LIMITS.maxListItems} disabled={pending} />
      </AdminFormSection>
      <AdminFormSection id="highlights" title="Highlights">
        <TextRowsField form={form} name="details.highlights" label="Highlights" itemLabel="Highlight" addLabel="Add highlight" max={STORE_LIMITS.maxListItems} disabled={pending} />
      </AdminFormSection>
      <AdminFormSection id="specifications" title="Specifications">
        <PairRowsField form={form} name="details.specifications" label="Specifications" itemLabel="Specification" addLabel="Add specification" keys={["label", "value"]} labels={["Label", "Value"]} max={STORE_LIMITS.maxSpecifications} disabled={pending} />
      </AdminFormSection>
      <AdminFormSection id="care" title="Care instructions">
        <TextRowsField form={form} name="details.careInstructions" label="Instructions" itemLabel="Care instruction" addLabel="Add instruction" max={STORE_LIMITS.maxListItems} disabled={pending} />
      </AdminFormSection>
      <AdminFormSection id="faq" title="FAQ">
        <PairRowsField form={form} name="details.faq" label="Questions" itemLabel="Question" addLabel="Add question" keys={["question", "answer"]} labels={["Question", "Answer"]} secondMultiline max={STORE_LIMITS.maxListItems} disabled={pending} />
      </AdminFormSection>
    </CatalogEditorShell>
  );
}
