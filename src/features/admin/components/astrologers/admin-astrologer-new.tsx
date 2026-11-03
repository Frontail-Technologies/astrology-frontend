"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAdminForm } from "@/features/admin/data/use-admin-form";
import { ASTROLOGER_IDENTITY_HINTS } from "@/features/astrologers/constants/astrologer-status";
import { useAstrologerCountryOptions, useProvisionAstrologer } from "@/features/astrologers/hooks/use-astrologer-admin";
import {
  emptyProvisionAstrologerForm,
  provisionAstrologerFormSchema,
  provisionAstrologerFormToInput,
  type ProvisionAstrologerFormValues,
} from "@/features/astrologers/lib/astrologer-provision-form";
import type { ManagedAstrologer, ProvisionAstrologerInput } from "@/features/astrologers/types/astrologer-admin";
import { AdminCombobox } from "../shared/admin-combobox";
import { AdminFormError, AdminFormField, AdminFormSection, fieldError } from "../shared/admin-form-section";
import { AdminPageHeader } from "../shared/admin-page-header";

/** `/admin/astrologers/new`: creates the astrologer's phone sign-in account with a pending, draft profile. */
export function AdminAstrologerNew() {
  const router = useRouter();
  const provision = useProvisionAstrologer();
  const countries = useAstrologerCountryOptions();
  const countryOptions = useMemo(() => (countries.data ?? []).map((item) => ({ value: item.name, label: item.name })), [countries.data]);
  const { form, submit, formError, pending } = useAdminForm<ProvisionAstrologerFormValues, ProvisionAstrologerFormValues, ProvisionAstrologerInput, ManagedAstrologer>({
    schema: provisionAstrologerFormSchema,
    defaultValues: emptyProvisionAstrologerForm,
    mutation: provision,
    toInput: provisionAstrologerFormToInput,
    onSuccess: (created) => router.push(`/admin/astrologers/${created.id}`),
  });
  const errors = form.formState.errors;
  const conflictHint = provision.error?.code ? ASTROLOGER_IDENTITY_HINTS[provision.error.code] : undefined;
  const saveButton = (
    <Button type="submit" variant="conversion" size="sm" disabled={pending}>
      {pending ? "Creating…" : "Create account"}
    </Button>
  );
  const cancelButton = (
    <Button asChild variant="outline" size="sm" className="bg-surface">
      <Link href="/admin/astrologers">Cancel</Link>
    </Button>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <AdminPageHeader
        title="New astrologer"
        description="Create the account an astrologer signs in to the app with. Complete and verify the profile, then they can sign in."
        backHref="/admin/astrologers"
        backLabel="Astrologers"
        actions={cancelButton}
        primaryAction={saveButton}
      />
      <AdminFormError message={conflictHint ?? formError} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <AdminFormSection title="Account">
            <div className="grid gap-4 sm:grid-cols-2">
              <AdminFormField label="Mobile number" required description="They sign in with a code sent to this number." error={fieldError(errors, "phone")}>
                {(control) => <Input {...control} {...form.register("phone")} type="tel" inputMode="tel" autoComplete="off" placeholder="98765 43210" className="tabular-nums" />}
              </AdminFormField>
              <AdminFormField label="Display name" required description="Shown to customers. They can change it later." error={fieldError(errors, "displayName")}>
                {(control) => <Input {...control} {...form.register("displayName")} maxLength={160} placeholder="Acharya Raghav Shastri" />}
              </AdminFormField>
              <Controller
                name="country"
                control={form.control}
                render={({ field }) => (
                  <AdminFormField label="Country" required error={fieldError(errors, "country")}>
                    {(control) => (
                      <AdminCombobox
                        control={control}
                        value={field.value || null}
                        onValueChange={(next) => field.onChange(next ?? "")}
                        options={countryOptions}
                        loading={countries.isPending}
                        placeholder="Choose a country"
                        searchPlaceholder="Search countries…"
                        emptyText={countries.error ? "Could not load countries. Type a name to use it." : "No matching countries."}
                        allowCustom={{ validate: (value) => value.trim().length >= 2, maxLength: 120 }}
                      />
                    )}
                  </AdminFormField>
                )}
              />
              <AdminFormField label="Email" description="Optional. Used for contact only, not for signing in." error={fieldError(errors, "email")}>
                {(control) => <Input {...control} {...form.register("email")} type="email" autoComplete="off" placeholder="name@example.com" />}
              </AdminFormField>
            </div>
          </AdminFormSection>
        </div>
        <aside className="min-w-0 space-y-5">
          <AdminFormSection title="What happens next">
            <ol className="space-y-3 text-sm text-muted-foreground">
              <li>The profile starts as <span className="font-medium text-foreground">Pending review</span> and <span className="font-medium text-foreground">Draft</span>, so customers cannot see it.</li>
              <li>Fill in the bio, languages and prices from the astrologer&apos;s page, then verify the profile.</li>
              <li className="flex gap-2.5">
                <Smartphone className="mt-0.5 size-4 shrink-0 text-foreground/60" aria-hidden="true" />
                <span>Once verified, they sign in to the app with a code sent to this number. Publish the profile when they are ready to take consultations.</span>
              </li>
            </ol>
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
