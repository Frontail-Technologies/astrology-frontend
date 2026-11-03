"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminForm } from "@/features/admin/data/use-admin-form";
import { FAQ_LIMITS, faqCategoryLabels } from "@/features/faqs/constants/faq-status";
import { faqDeleteOptions, useCreateFaq, useFaqDetail, useUpdateFaq } from "@/features/faqs/hooks/use-faq-admin";
import { emptyFaqForm, faqFormSchema, faqFormToInput, faqToFormValues, type FaqFormValues } from "@/features/faqs/lib/faq-form";
import type { FaqCategory, FaqInput, ManagedFaq } from "@/features/faqs/types/faq-admin";
import { formatDateLong } from "../../lib/format";
import { AdminDeleteAction } from "../shared/admin-delete-action";
import { AdminFormError, AdminFormField, AdminFormSection, fieldError } from "../shared/admin-form-section";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSelectField } from "../shared/admin-select-field";
import { AdminDetailFrame } from "../shared/admin-server-list";

/** `/admin/faqs/new` (no id) or `/admin/faqs/[id]/edit`. FAQs have no separate detail page: the list links here. */
export function AdminFaqEditor({ id }: { id?: string }) {
  const detail = useFaqDetail(id ?? "");
  if (!id) return <FaqForm />;
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="FAQ">
      {() => <FaqForm key={detail.data!.id} faq={detail.data!} />}
    </AdminDetailFrame>
  );
}

function FaqForm({ faq }: { faq?: ManagedFaq }) {
  const router = useRouter();
  const create = useCreateFaq();
  const update = useUpdateFaq(faq?.id ?? "");
  const { form, submit, formError, pending } = useAdminForm<FaqFormValues, FaqFormValues, FaqInput, ManagedFaq>({
    schema: faqFormSchema,
    defaultValues: faq ? faqToFormValues(faq) : emptyFaqForm,
    mutation: faq ? update : create,
    toInput: faqFormToInput,
    onSuccess: () => router.push("/admin/faqs"),
  });
  const errors = form.formState.errors;
  const answer = form.watch("answer");
  const saveButton = (
    <Button type="submit" variant="conversion" size="sm" disabled={pending || (Boolean(faq) && !form.formState.isDirty)}>
      {pending ? "Saving…" : faq ? "Save changes" : "Create FAQ"}
    </Button>
  );
  const cancelButton = (
    <Button asChild variant="outline" size="sm" className="bg-surface">
      <Link href="/admin/faqs">Cancel</Link>
    </Button>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <AdminPageHeader
        title={faq ? "Edit FAQ" : "New FAQ"}
        description={faq ? `Last updated ${formatDateLong(faq.updatedAt)}` : "Write a question customers ask and a short, plain answer."}
        backHref="/admin/faqs"
        backLabel="FAQs"
        actions={
          <>
            {faq ? (
              <AdminDeleteAction
                id={faq.id}
                entityLabel="FAQ"
                description="The answer disappears from the customer app. This cannot be undone."
                redirectTo="/admin/faqs"
                triggerClassName="bg-surface text-destructive hover:text-destructive"
                {...faqDeleteOptions}
              />
            ) : null}
            {cancelButton}
          </>
        }
        primaryAction={saveButton}
      />
      <AdminFormError message={formError} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <AdminFormSection title="Question and answer">
            <AdminFormField label="Question" required error={fieldError(errors, "question")}>
              {(control) => <Input {...control} {...form.register("question")} maxLength={FAQ_LIMITS.question[1]} placeholder="How do I add money to my wallet?" />}
            </AdminFormField>
            <AdminFormField label="Answer" required description={`${answer.length.toLocaleString("en-IN")} / ${FAQ_LIMITS.answer[1].toLocaleString("en-IN")} characters`} error={fieldError(errors, "answer")}>
              {(control) => <Textarea {...control} {...form.register("answer")} className="min-h-40 resize-y leading-6" maxLength={FAQ_LIMITS.answer[1]} />}
            </AdminFormField>
          </AdminFormSection>
        </div>
        <aside className="min-w-0 space-y-5">
          <AdminFormSection title="Placement">
            <Controller
              name="category"
              control={form.control}
              render={({ field }) => (
                <AdminFormField label="Help section" required error={fieldError(errors, "category")}>
                  {(control) => (
                    <AdminSelectField
                      control={control}
                      value={field.value}
                      onValueChange={(value) => field.onChange((value ?? "") as FaqCategory | "")}
                      onBlur={field.onBlur}
                      options={faqCategoryLabels}
                      placeholder="Choose a section"
                      disabled={pending}
                    />
                  )}
                </AdminFormField>
              )}
            />
            <AdminFormField label="Order" description="Lower numbers show first within the section." error={fieldError(errors, "sortOrder")}>
              {(control) => <Input {...control} {...form.register("sortOrder")} inputMode="numeric" className="tabular-nums" />}
            </AdminFormField>
            <Controller
              name="active"
              control={form.control}
              render={({ field }) => (
                <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
                  <div>
                    <Label htmlFor="faq-active">Show in the app</Label>
                    <p className="text-xs text-muted-foreground">Hidden FAQs stay here but customers do not see them.</p>
                  </div>
                  <Switch id="faq-active" checked={field.value} onCheckedChange={field.onChange} disabled={pending} />
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
