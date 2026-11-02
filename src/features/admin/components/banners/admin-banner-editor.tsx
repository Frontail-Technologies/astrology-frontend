"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminForm } from "@/features/admin/data/use-admin-form";
import { BANNER_LIMITS, bannerLinkTypeLabels, bannerPlacementLabels } from "@/features/banners/constants/banner-status";
import { useBannerDetail, useCreateBanner, useUpdateBanner } from "@/features/banners/hooks/use-banner-admin";
import { bannerFormSchema, bannerFormToInput, bannerToFormValues, emptyBannerForm, type BannerFormValues } from "@/features/banners/lib/banner-form";
import type { BannerInput, BannerLinkType, ManagedBanner } from "@/features/banners/types/banner-admin";
import { AdminDateTimeInput } from "../shared/admin-datetime-input";
import { AdminFormError, AdminFormField, AdminFormSection, fieldError } from "../shared/admin-form-section";
import { AdminImageField } from "../shared/admin-image-field";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSelectField } from "../shared/admin-select-field";
import { AdminDetailFrame } from "../shared/admin-server-list";

/** `/admin/banners/new` (no id) or `/admin/banners/[id]/edit`. */
export function AdminBannerEditor({ id }: { id?: string }) {
  const detail = useBannerDetail(id ?? "");
  if (!id) return <BannerForm />;
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="banner">
      {() => <BannerForm key={detail.data!.id} banner={detail.data!} />}
    </AdminDetailFrame>
  );
}

const linkPlaceholders: Record<BannerLinkType, string> = { none: "", internal: "/pooja", external: "https://example.com/offer" };

function BannerForm({ banner }: { banner?: ManagedBanner }) {
  const router = useRouter();
  const create = useCreateBanner();
  const update = useUpdateBanner(banner?.id ?? "");
  const { form, submit, formError, pending } = useAdminForm<BannerFormValues, BannerFormValues, BannerInput, ManagedBanner>({
    schema: bannerFormSchema,
    defaultValues: banner ? bannerToFormValues(banner) : emptyBannerForm,
    mutation: banner ? update : create,
    toInput: bannerFormToInput,
    onSuccess: (saved) => router.push(`/admin/banners/${saved.id}`),
  });
  const errors = form.formState.errors;
  const linkType = form.watch("linkType");
  const startsAt = form.watch("startsAt");
  const cancelHref = banner ? `/admin/banners/${banner.id}` : "/admin/banners";
  const saveButton = (
    <Button type="submit" variant="conversion" size="sm" disabled={pending || (Boolean(banner) && !form.formState.isDirty)}>
      {pending ? "Saving…" : banner ? "Save changes" : "Create draft"}
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
        title={banner ? `Edit ${banner.title}` : "New banner"}
        description={banner ? undefined : "New banners are saved as drafts. Publish them from the banner page."}
        backHref={cancelHref}
        backLabel={banner ? "Back to banner" : "Banners"}
        actions={cancelButton}
        primaryAction={saveButton}
      />
      <AdminFormError message={formError} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <AdminFormSection title="Content">
            <AdminFormField label="Title" required error={fieldError(errors, "title")}>
              {(control) => <Input {...control} {...form.register("title")} maxLength={BANNER_LIMITS.title} />}
            </AdminFormField>
            <AdminFormField label="Subtitle" error={fieldError(errors, "subtitle")}>
              {(control) => <Textarea {...control} {...form.register("subtitle")} rows={2} maxLength={BANNER_LIMITS.subtitle} />}
            </AdminFormField>
            <AdminFormField label="Alt text" description="Describes the image for screen readers." error={fieldError(errors, "altText")}>
              {(control) => <Input {...control} {...form.register("altText")} maxLength={BANNER_LIMITS.altText} />}
            </AdminFormField>
          </AdminFormSection>
          <AdminFormSection title="Images">
            <Controller
              name="imageUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <AdminImageField label="Desktop image (required)" value={field.value} onChange={(value) => field.onChange(value)} error={fieldState.error?.message} aspect="wide" disabled={pending} />
              )}
            />
            <Controller
              name="mobileImageUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <AdminImageField
                  label="Mobile image"
                  description="Optional. The desktop image is used when empty."
                  value={field.value}
                  onChange={(value) => field.onChange(value)}
                  error={fieldState.error?.message}
                  aspect="portrait"
                  disabled={pending}
                />
              )}
            />
          </AdminFormSection>
          <AdminFormSection title="Link">
            <Controller
              name="linkType"
              control={form.control}
              render={({ field }) => (
                <AdminFormField label="Link type" error={fieldError(errors, "linkType")}>
                  {(control) => (
                    <AdminSelectField
                      control={control}
                      value={field.value}
                      onBlur={field.onBlur}
                      options={bannerLinkTypeLabels}
                      onValueChange={(value) => {
                        const next = (value ?? "none") as BannerLinkType;
                        field.onChange(next);
                        if (next === "none") form.setValue("linkValue", "", { shouldDirty: true });
                        if (form.formState.touchedFields.linkValue) void form.trigger("linkValue");
                      }}
                    />
                  )}
                </AdminFormField>
              )}
            />
            {linkType !== "none" ? (
              <AdminFormField
                label={linkType === "internal" ? "Site path" : "URL"}
                required
                description={linkType === "internal" ? "A path on this site, starting with /." : "A full http(s) address."}
                error={fieldError(errors, "linkValue")}
              >
                {(control) => <Input {...control} {...form.register("linkValue")} placeholder={linkPlaceholders[linkType]} maxLength={BANNER_LIMITS.link} />}
              </AdminFormField>
            ) : null}
          </AdminFormSection>
        </div>
        <aside className="min-w-0 space-y-5">
          <AdminFormSection title="Placement">
            <Controller
              name="placement"
              control={form.control}
              render={({ field }) => (
                <AdminFormField
                  label="Placement"
                  required
                  description={
                    Object.hasOwn(bannerPlacementLabels, field.value) || field.value === ""
                      ? "Where the site shows this banner."
                      : "Custom key: lower-case letters, digits and underscores, starting with a letter."
                  }
                  error={fieldError(errors, "placement")}
                >
                  {(control) => (
                    <AdminSelectField
                      control={control}
                      value={field.value}
                      onValueChange={(value) => field.onChange((value ?? "").toLowerCase())}
                      onBlur={field.onBlur}
                      options={bannerPlacementLabels}
                      placeholder="Choose where it shows"
                      other={{ label: "Other placement…", placeholder: "custom_placement", maxLength: BANNER_LIMITS.placement[1], inputLabel: "Custom placement key" }}
                      disabled={pending}
                    />
                  )}
                </AdminFormField>
              )}
            />
            <AdminFormField label="Sort order" description="Lower numbers show first." error={fieldError(errors, "sortOrder")}>
              {(control) => <Input {...control} {...form.register("sortOrder")} inputMode="numeric" />}
            </AdminFormField>
          </AdminFormSection>
          <AdminFormSection title="Schedule" description="Leave empty to show whenever the banner is published.">
            <Controller
              name="startsAt"
              control={form.control}
              render={({ field }) => (
                <AdminFormField label="Starts" error={fieldError(errors, "startsAt")}>
                  {(control) => (
                    <AdminDateTimeInput
                      {...control}
                      value={field.value}
                      onChange={(value) => {
                        field.onChange(value);
                        if (form.getValues("endsAt")) void form.trigger("endsAt");
                      }}
                      onBlur={field.onBlur}
                    />
                  )}
                </AdminFormField>
              )}
            />
            <Controller
              name="endsAt"
              control={form.control}
              render={({ field }) => (
                <AdminFormField label="Ends" error={fieldError(errors, "endsAt")}>
                  {(control) => <AdminDateTimeInput {...control} value={field.value} onChange={field.onChange} onBlur={field.onBlur} min={startsAt} />}
                </AdminFormField>
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
