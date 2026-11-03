"use client";

import { useMemo, useState } from "react";
import { Controller, useWatch } from "react-hook-form";
import { useRouter } from "next/navigation";
import { CalendarRange, Check, Percent, Shapes, Ticket, Users } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminForm, type AdminFormMutation } from "@/features/admin/data/use-admin-form";
import {
  COUPON_ERROR_HINTS,
  couponColorPalette,
  couponDiscountTypeLabels,
  couponScopeDescriptions,
  couponScopeLabels,
  couponScopes,
} from "@/features/coupons/constants/coupon-status";
import { useCouponDetail, useCreateCoupon, useUpdateCoupon } from "@/features/coupons/hooks/use-coupon-admin";
import { couponToFormValues, formToCouponInput, generateCouponCode, normalizeCouponCode } from "@/features/coupons/lib/coupon-form";
import type { CouponDiscountType, CouponInput, CouponScope, ManagedCoupon } from "@/features/coupons/types/coupon-admin";
import { formatINR } from "../../lib/format";
import { CatalogEditorShell } from "../catalog/catalog-editor-shell";
import { AdminDateTimeInput } from "../shared/admin-datetime-input";
import type { AdminEditorSection } from "../shared/admin-editor-section-nav";
import { AdminFormField, AdminFormSection, fieldError } from "../shared/admin-form-section";
import { AdminMoneyInput } from "../shared/admin-money-input";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminSelectField } from "../shared/admin-select-field";
import { CouponStateBadge } from "./coupon-display";
import { CouponCategoryPicker, CouponProductPicker } from "./coupon-scope-pickers";
import { couponEditorSchema } from "./coupon-editor-schema";

const sections: AdminEditorSection[] = [
  { id: "coupon", label: "Coupon", icon: Ticket },
  { id: "discount", label: "Discount", icon: Percent },
  { id: "scope", label: "Applies to", icon: Shapes },
  { id: "limits", label: "Usage limits", icon: Users },
  { id: "validity", label: "Validity", icon: CalendarRange },
];

export function AdminCouponEditor({ couponId }: { couponId?: string }) {
  if (!couponId) return <CreateCouponForm />;
  return <EditCouponLoader couponId={couponId} />;
}

function CreateCouponForm() {
  const router = useRouter();
  const create = useCreateCoupon();
  return <CouponEditorForm coupon={null} mutation={create} onSaved={(coupon) => router.push(`/admin/coupons/${coupon.id}`)} />;
}

function EditCouponLoader({ couponId }: { couponId: string }) {
  const detail = useCouponDetail(couponId);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="coupon">
      {() => <EditCouponForm coupon={detail.data!} />}
    </AdminDetailFrame>
  );
}

function EditCouponForm({ coupon }: { coupon: ManagedCoupon }) {
  const router = useRouter();
  const update = useUpdateCoupon(coupon.id);
  return <CouponEditorForm coupon={coupon} mutation={update} onSaved={() => router.push(`/admin/coupons/${coupon.id}`)} />;
}

/** Whole-percent text input bound to a number (`null` when empty, `NaN` while invalid). */
function PercentInput({ value, onChange, ...props }: Omit<React.ComponentProps<typeof Input>, "value" | "onChange"> & { value: number | null; onChange: (value: number | null) => void }) {
  const [text, setText] = useState(value === null || Number.isNaN(value) ? "" : String(value));
  const [synced, setSynced] = useState(value);
  if (!Object.is(synced, value)) {
    setSynced(value);
    if (!Number.isNaN(value) && String(value ?? "") !== text.trim()) setText(value === null ? "" : String(value));
  }
  return (
    <div className="relative">
      <Input
        {...props}
        inputMode="numeric"
        autoComplete="off"
        className="pr-8 tabular-nums"
        value={text}
        onChange={(event) => {
          const next = event.target.value;
          const trimmed = next.trim();
          const parsed = trimmed === "" ? null : /^\d+$/.test(trimmed) ? Number(trimmed) : Number.NaN;
          setText(next);
          setSynced(parsed);
          onChange(parsed);
        }}
      />
      <span className="pointer-events-none absolute inset-y-0 right-3 flex items-center text-sm text-muted-foreground" aria-hidden="true">
        %
      </span>
    </div>
  );
}

function CouponPreview({ code, name, color, discountType, discountValue }: { code: string; name: string; color: string; discountType: CouponDiscountType; discountValue: number | null }) {
  const valid = discountValue !== null && Number.isFinite(discountValue) && discountValue > 0;
  const offer = !valid ? "Discount" : discountType === "percentage" ? `${discountValue}% off` : `${formatINR(discountValue)} off`;
  const accent = color || undefined;
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
        <p className="mb-2 text-[13px] font-medium text-muted-foreground">Preview</p>
        <div className="rounded-md border border-dashed border-border px-3 py-2.5" style={accent ? { borderLeft: `4px solid ${accent}` } : undefined}>
          <p className="font-mono text-xs font-semibold tracking-wide">{normalizeCouponCode(code) || "CODE"}</p>
          <p className="mt-1.5 text-lg font-semibold" style={accent ? { color: accent } : undefined}>
            {offer}
          </p>
          <p className="truncate text-xs text-muted-foreground">{name || "Coupon name"}</p>
        </div>
    </div>
  );
}

function CouponEditorForm({
  coupon,
  mutation,
  onSaved,
}: {
  coupon: ManagedCoupon | null;
  mutation: AdminFormMutation<CouponInput, ManagedCoupon> & { error: { code?: string } | null };
  onSaved: (coupon: ManagedCoupon) => void;
}) {
  const isNew = !coupon;
  const defaultValues = useMemo(() => couponToFormValues(coupon), [coupon]);
  const { form, submit, formError, pending } = useAdminForm({
    schema: couponEditorSchema,
    defaultValues,
    mutation,
    toInput: formToCouponInput,
    onSuccess: (result, values, current) => {
      current.reset(values);
      onSaved(result);
    },
  });
  const errors = form.formState.errors;
  const [discountType, scope, startsAt, code, name, color, discountValue] = useWatch({
    control: form.control,
    name: ["discountType", "scope", "startsAt", "code", "name", "color", "discountValue"],
  });
  // Field-less 409s (code taken, scope references) get an actionable hint next to the server message.
  const hint = mutation.error?.code ? COUPON_ERROR_HINTS[mutation.error.code] : undefined;

  return (
    <CatalogEditorShell
      title={isNew ? "New coupon" : `Edit ${coupon.code}`}
      description={isNew ? undefined : coupon.name}
      meta={isNew ? undefined : <CouponStateBadge coupon={coupon} />}
      cancelHref={isNew ? "/admin/coupons" : `/admin/coupons/${coupon.id}`}
      backLabel={isNew ? "Coupons" : "Back to coupon"}
      sections={sections}
      submitLabel={isNew ? "Create coupon" : "Save changes"}
      pending={pending}
      dirty={form.formState.isDirty}
      formError={formError && hint ? `${formError} ${hint}` : formError}
      onSubmit={submit}
      rail={<CouponPreview code={code} name={name} color={color} discountType={discountType} discountValue={discountValue} />}
    >
      <AdminFormSection id="coupon" title="Coupon">
        <Controller
          name="code"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminFormField label="Code" required description="Letters, numbers, - and _. Saved in upper case." error={fieldState.error?.message}>
              {(control) => (
                <div className="flex gap-2">
                  <Input
                    {...control}
                    className="font-mono uppercase"
                    maxLength={64}
                    value={field.value}
                    onChange={(event) => field.onChange(normalizeCouponCode(event.target.value))}
                    onBlur={field.onBlur}
                    ref={field.ref}
                  />
                  <Button type="button" variant="outline" size="sm" className="h-11 shrink-0" disabled={pending} onClick={() => form.setValue("code", generateCouponCode(), { shouldDirty: true, shouldValidate: true })}>
                    Generate
                  </Button>
                </div>
              )}
            </AdminFormField>
          )}
        />
        <AdminFormField label="Name" required description="Internal and customer-facing title, for example “Diwali store offer”." error={fieldError(errors, "name")}>
          {(control) => <Input {...control} maxLength={180} {...form.register("name")} />}
        </AdminFormField>
        <AdminFormField label="Description" error={fieldError(errors, "description")}>
          {(control) => <Textarea {...control} rows={3} maxLength={5000} {...form.register("description")} />}
        </AdminFormField>
        <Controller
          name="color"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminFormField label="Accent colour" description="Used on the coupon card." error={fieldState.error?.message}>
              {(control) => (
                <div className="flex flex-wrap items-center gap-2">
                  {couponColorPalette.map((swatch) => {
                    const selected = field.value.toUpperCase() === swatch.value;
                    return (
                      <button
                        key={swatch.value}
                        type="button"
                        aria-label={swatch.name}
                        aria-pressed={selected}
                        title={swatch.name}
                        disabled={pending}
                        onClick={() => field.onChange(swatch.value)}
                        className="grid size-7 place-items-center rounded-full ring-offset-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                        style={{ backgroundColor: swatch.value, boxShadow: selected ? `0 0 0 2px var(--background), 0 0 0 4px ${swatch.value}` : undefined }}
                      >
                        {selected ? <Check className="size-3.5 text-white" aria-hidden="true" /> : null}
                      </button>
                    );
                  })}
                  <input
                    type="color"
                    aria-label="Custom colour"
                    className="size-8 cursor-pointer rounded border border-border bg-transparent p-0.5"
                    value={/^#[0-9a-fA-F]{6}$/.test(field.value) ? field.value : "#C76A35"}
                    disabled={pending}
                    onChange={(event) => field.onChange(event.target.value.toUpperCase())}
                  />
                  <Input {...control} className="w-28 font-mono uppercase" placeholder="#RRGGBB" maxLength={7} value={field.value} onChange={(event) => field.onChange(event.target.value.toUpperCase())} onBlur={field.onBlur} />
                  {field.value ? (
                    <Button type="button" variant="ghost" size="xs" disabled={pending} onClick={() => field.onChange("")}>
                      No colour
                    </Button>
                  ) : null}
                </div>
              )}
            </AdminFormField>
          )}
        />
        <Controller
          name="active"
          control={form.control}
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <Label htmlFor="coupon-active">Active</Label>
                <p className="text-xs text-muted-foreground">Inactive coupons cannot be redeemed, even inside their validity window.</p>
              </div>
              <Switch id="coupon-active" checked={field.value} onCheckedChange={field.onChange} disabled={pending} />
            </div>
          )}
        />
        <Controller
          name="listed"
          control={form.control}
          render={({ field }) => (
            <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
              <div>
                <Label htmlFor="coupon-listed">Show in the app</Label>
                <p className="text-xs text-muted-foreground">Listed on the offers screen of the customer app. Unlisted codes still work when a customer types them.</p>
              </div>
              <Switch id="coupon-listed" checked={field.value} onCheckedChange={field.onChange} disabled={pending} />
            </div>
          )}
        />
      </AdminFormSection>

      <AdminFormSection id="discount" title="Discount">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="discountType"
            control={form.control}
            render={({ field }) => (
              <AdminFormField label="Type">
                {(control) => (
                  <AdminSelectField
                    control={control}
                    value={field.value}
                    onValueChange={(value) => {
                      if (!value || value === field.value) return;
                      field.onChange(value as CouponDiscountType);
                      // A rupee amount is not a percentage (and vice versa): start the value over.
                      form.setValue("discountValue", null, { shouldDirty: true });
                    }}
                    onBlur={field.onBlur}
                    options={couponDiscountTypeLabels}
                    disabled={pending}
                  />
                )}
              </AdminFormField>
            )}
          />
          <Controller
            name="discountValue"
            control={form.control}
            render={({ field, fieldState }) => (
              <AdminFormField label={discountType === "percentage" ? "Percentage off" : "Amount off"} required error={fieldState.error?.message}>
                {(control) =>
                  discountType === "percentage" ? (
                    <PercentInput {...control} key="percentage" value={field.value} onChange={field.onChange} onBlur={field.onBlur} disabled={pending} placeholder="1–100" />
                  ) : (
                    <AdminMoneyInput {...control} key="fixed" value={field.value} onChange={field.onChange} onBlur={field.onBlur} disabled={pending} />
                  )
                }
              </AdminFormField>
            )}
          />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {discountType === "percentage" ? (
            <Controller
              name="maxDiscountPaise"
              control={form.control}
              render={({ field, fieldState }) => (
                <AdminFormField label="Maximum discount" description="Caps the percentage discount. Leave empty for no cap." error={fieldState.error?.message}>
                  {(control) => <AdminMoneyInput {...control} value={field.value} onChange={field.onChange} onBlur={field.onBlur} disabled={pending} placeholder="No cap" />}
                </AdminFormField>
              )}
            />
          ) : null}
          <Controller
            name="minOrderPaise"
            control={form.control}
            render={({ field, fieldState }) => (
              <AdminFormField label="Minimum order" description="Leave empty for no minimum." error={fieldState.error?.message}>
                {(control) => <AdminMoneyInput {...control} value={field.value} onChange={field.onChange} onBlur={field.onBlur} disabled={pending} placeholder="No minimum" />}
              </AdminFormField>
            )}
          />
        </div>
      </AdminFormSection>

      <AdminFormSection id="scope" title="Applies to">
        <Controller
          name="scope"
          control={form.control}
          render={({ field, fieldState }) => (
            <AdminFormField label="Scope" description={couponScopeDescriptions[field.value]} error={fieldState.error?.message}>
              {(control) => (
                <AdminSelectField
                  control={control}
                  value={field.value}
                  onValueChange={(value) => {
                    if (value) field.onChange(value as CouponScope);
                  }}
                  onBlur={field.onBlur}
                  options={couponScopes.map((option) => ({ value: option, label: couponScopeLabels[option] }))}
                  disabled={pending}
                  className="sm:max-w-sm"
                />
              )}
            </AdminFormField>
          )}
        />
        {scope === "selected_categories" ? (
          <Controller
            name="categoryIds"
            control={form.control}
            render={({ field, fieldState }) => <CouponCategoryPicker value={field.value} onChange={field.onChange} error={fieldState.error?.message} disabled={pending} />}
          />
        ) : null}
        {scope === "selected_products" ? (
          <Controller
            name="productIds"
            control={form.control}
            render={({ field, fieldState }) => <CouponProductPicker value={field.value} onChange={field.onChange} error={fieldState.error?.message} disabled={pending} />}
          />
        ) : null}
        {scope === "consultations" ? <p className="text-[13px] text-muted-foreground">Consultation coupons do not need products or categories.</p> : null}
      </AdminFormSection>

      <AdminFormSection id="limits" title="Usage limits">
        <div className="grid gap-4 sm:grid-cols-2">
          <AdminFormField label="Total redemptions" description="Leave empty for no limit." error={fieldError(errors, "usageLimit")}>
            {(control) => <Input {...control} inputMode="numeric" placeholder="No limit" {...form.register("usageLimit")} />}
          </AdminFormField>
          <AdminFormField label="Per customer" description="Leave empty for no limit." error={fieldError(errors, "perCustomerLimit")}>
            {(control) => <Input {...control} inputMode="numeric" placeholder="No limit" {...form.register("perCustomerLimit")} />}
          </AdminFormField>
        </div>
        {coupon ? <p className="text-[13px] text-muted-foreground tabular-nums">Redeemed {coupon.usageCount} {coupon.usageCount === 1 ? "time" : "times"} so far.</p> : null}
      </AdminFormSection>

      <AdminFormSection id="validity" title="Validity" description="Leave empty for no start or end date.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Controller
            name="startsAt"
            control={form.control}
            render={({ field, fieldState }) => (
              <AdminFormField label="Starts" error={fieldState.error?.message}>
                {(control) => <AdminDateTimeInput {...control} value={field.value} onChange={field.onChange} onBlur={field.onBlur} disabled={pending} />}
              </AdminFormField>
            )}
          />
          <Controller
            name="endsAt"
            control={form.control}
            render={({ field, fieldState }) => (
              <AdminFormField label="Ends" error={fieldState.error?.message}>
                {(control) => <AdminDateTimeInput {...control} value={field.value} onChange={field.onChange} onBlur={field.onBlur} min={startsAt} disabled={pending} />}
              </AdminFormField>
            )}
          />
        </div>
      </AdminFormSection>
    </CatalogEditorShell>
  );
}
