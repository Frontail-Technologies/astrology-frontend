"use client";

import Link from "next/link";
import { useMemo, type FormEvent } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAdminForm } from "@/features/admin/data/use-admin-form";
import {
  HOROSCOPE_DUPLICATE,
  HOROSCOPE_LIMITS,
  horoscopePeriodLabels,
  horoscopeStatusLabels,
  horoscopeStatusVariants,
  zodiacSignImage,
  zodiacSignLabels,
} from "@/features/horoscopes/constants/horoscope-status";
import { horoscopeDeleteOptions, useCreateHoroscope, useHoroscopeEntry, useHoroscopeStatusUpdate, useUpdateHoroscope } from "@/features/horoscopes/hooks/use-horoscope-admin";
import {
  emptyHoroscopeForm,
  horoscopeFormSchema,
  horoscopeToFormValues,
  toHoroscopeCreateInput,
  toHoroscopeUpdateInput,
  type HoroscopeEntryKey,
  type HoroscopeFormValues,
} from "@/features/horoscopes/lib/horoscope-form";
import type { HoroscopeCreateInput, HoroscopeStatus, HoroscopeUpdateInput, ManagedHoroscope } from "@/features/horoscopes/types/horoscope-admin";
import { formatDateLong, formatOptionalDateTime } from "../../lib/format";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminDeleteAction } from "../shared/admin-delete-action";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminFormError, AdminFormField, AdminFormSection, fieldError } from "../shared/admin-form-section";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminSelectField } from "../shared/admin-select-field";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";
import { useConfirmAction } from "../shared/use-confirm-action";

const periodDate = (key: HoroscopeEntryKey) =>
  key.period === "monthly"
    ? new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(`${key.date}T00:00:00`))
    : formatDateLong(`${key.date}T00:00:00`);

/** Editor for one period/sign/start date: creates the entry when none exists, otherwise edits it by id. */
export function AdminHoroscopeEditor(key: HoroscopeEntryKey) {
  const entry = useHoroscopeEntry(key.period, key.sign, key.date);
  return (
    <AdminDetailFrame ready={entry.ready} error={entry.error} onRetry={entry.reload} noun="horoscope">
      {() => (entry.data ? <EditHoroscopeForm key={entry.data.id} entryKey={key} entry={entry.data} /> : <CreateHoroscopeForm entryKey={key} onReload={entry.reload} />)}
    </AdminDetailFrame>
  );
}

const fieldAliases = { guidance: "overview", "sections.love": "love", "sections.career": "career", "sections.health": "health" };

function CreateHoroscopeForm({ entryKey, onReload }: { entryKey: HoroscopeEntryKey; onReload: () => void }) {
  const create = useCreateHoroscope();
  const schema = useMemo(() => horoscopeFormSchema(entryKey.date), [entryKey.date]);
  const editor = useAdminForm<HoroscopeFormValues, HoroscopeFormValues, HoroscopeCreateInput, ManagedHoroscope>({
    schema,
    defaultValues: emptyHoroscopeForm,
    mutation: create,
    toInput: (values) => toHoroscopeCreateInput(values, entryKey),
    fieldAliases,
  });
  return <HoroscopeForm entryKey={entryKey} entry={null} editor={editor} duplicate={create.error?.code === HOROSCOPE_DUPLICATE} onReload={onReload} />;
}

function EditHoroscopeForm({ entryKey, entry }: { entryKey: HoroscopeEntryKey; entry: ManagedHoroscope }) {
  const update = useUpdateHoroscope(entry.id);
  const schema = useMemo(() => horoscopeFormSchema(entryKey.date), [entryKey.date]);
  const editor = useAdminForm<HoroscopeFormValues, HoroscopeFormValues, HoroscopeUpdateInput, ManagedHoroscope>({
    schema,
    defaultValues: horoscopeToFormValues(entry),
    mutation: update,
    toInput: toHoroscopeUpdateInput,
    onSuccess: (saved, _values, form) => form.reset(horoscopeToFormValues(saved)),
    fieldAliases,
  });
  return <HoroscopeForm entryKey={entryKey} entry={entry} editor={editor} duplicate={false} />;
}

type HoroscopeEditor = {
  form: UseFormReturn<HoroscopeFormValues, unknown, HoroscopeFormValues>;
  submit: (event?: FormEvent<HTMLFormElement>) => Promise<void>;
  formError: string | null;
  pending: boolean;
};

function HoroscopeForm({
  entryKey,
  entry,
  editor,
  duplicate,
  onReload,
}: {
  entryKey: HoroscopeEntryKey;
  entry: ManagedHoroscope | null;
  editor: HoroscopeEditor;
  duplicate: boolean;
  onReload?: () => void;
}) {
  const { form, submit, formError, pending } = editor;
  const gridHref = `/admin/horoscopes?period=${entryKey.period}&date=${encodeURIComponent(entryKey.date)}`;
  const errors = form.formState.errors;
  const overview = form.watch("overview");
  const signLabel = zodiacSignLabels[entryKey.sign];
  const saveButton = (
    <Button type="submit" variant="conversion" size="sm" disabled={pending || (Boolean(entry) && !form.formState.isDirty)}>
      {pending ? "Saving…" : entry ? "Save changes" : "Create horoscope"}
    </Button>
  );
  const cancelButton = (
    <Button asChild variant="outline" size="sm" className="bg-surface">
      <Link href={gridHref}>Cancel</Link>
    </Button>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <AdminPageHeader
        title={
          <span className="inline-flex items-center gap-3">
            <span className="size-10 shrink-0 overflow-hidden rounded-lg bg-muted">
              {/* eslint-disable-next-line @next/next/no-img-element -- bundled zodiac artwork */}
              <img src={zodiacSignImage(entryKey.sign)} alt="" className="size-full object-cover" />
            </span>
            <span>
              {signLabel} · {horoscopePeriodLabels[entryKey.period]} horoscope
            </span>
          </span>
        }
        backHref={gridHref}
        backLabel="Horoscopes"
        meta={
          <>
            {entry ? (
              <AdminStatusBadge status={entry.status} labels={horoscopeStatusLabels} variants={horoscopeStatusVariants} />
            ) : (
              <AdminStatusPill tone="neutral">Not written</AdminStatusPill>
            )}
            <span className="tabular-nums">
              {entryKey.period === "weekly" ? "Week starting " : ""}
              {periodDate(entryKey)}
            </span>
          </>
        }
        actions={
          <>
            {entry ? (
              <AdminDeleteAction
                id={entry.id}
                entityLabel="horoscope"
                {...horoscopeDeleteOptions}
                redirectTo={gridHref}
                triggerClassName="bg-surface text-destructive hover:text-destructive"
              />
            ) : null}
            {cancelButton}
          </>
        }
        primaryAction={saveButton}
      />
      {duplicate ? (
        <div role="alert" className="flex flex-wrap items-center justify-between gap-2 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive">
          <span>A {horoscopePeriodLabels[entryKey.period].toLowerCase()} horoscope for {signLabel} on this date already exists.</span>
          <Button type="button" variant="outline" size="sm" onClick={onReload}>
            Load the existing entry
          </Button>
        </div>
      ) : (
        <AdminFormError message={formError} />
      )}
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <AdminFormSection title="Guidance" description="Reflective, non-fatalistic guidance. Avoid guaranteed outcomes and fear-based wording.">
          <AdminFormField label="Overview" required error={fieldError(errors, "overview")}>
            {(control) => <Textarea {...control} {...form.register("overview")} className="min-h-40 resize-y leading-6" maxLength={HOROSCOPE_LIMITS.guidance} />}
          </AdminFormField>
          <div className="grid gap-4 md:grid-cols-2">
            <AdminFormField label="Love" description="Optional." error={fieldError(errors, "love")}>
              {(control) => <Textarea {...control} {...form.register("love")} className="min-h-28 resize-y" maxLength={HOROSCOPE_LIMITS.section} />}
            </AdminFormField>
            <AdminFormField label="Career" description="Optional." error={fieldError(errors, "career")}>
              {(control) => <Textarea {...control} {...form.register("career")} className="min-h-28 resize-y" maxLength={HOROSCOPE_LIMITS.section} />}
            </AdminFormField>
          </div>
          <AdminFormField label="Health" description="Optional. General wellbeing only, never medical advice." error={fieldError(errors, "health")}>
            {(control) => <Textarea {...control} {...form.register("health")} className="min-h-28 resize-y" maxLength={HOROSCOPE_LIMITS.section} />}
          </AdminFormField>
        </AdminFormSection>
        <aside className="min-w-0 space-y-5 xl:sticky xl:top-6">
          {entry ? (
            <HoroscopeStatusCard entry={entry} />
          ) : (
            <AdminFormSection title="Publishing">
              <Controller
                name="status"
                control={form.control}
                render={({ field }) => (
                  <AdminFormField label="Initial status" error={fieldError(errors, "status")}>
                    {(control) => (
                      <AdminSelectField
                        control={control}
                        value={field.value}
                        onBlur={field.onBlur}
                        options={horoscopeStatusLabels}
                        onValueChange={(value) => {
                          if (value) field.onChange(value as HoroscopeStatus);
                        }}
                        disabled={pending}
                      />
                    )}
                  </AdminFormField>
                )}
              />
            </AdminFormSection>
          )}
          <AdminFormSection title="Period">
            <div className="divide-y divide-border">
              <DetailRow label="Sign" value={signLabel} />
              <DetailRow label="Period" value={horoscopePeriodLabels[entryKey.period]} />
              <DetailRow label="Starts" value={periodDate(entryKey)} />
            </div>
            <AdminFormField label="Ends" description="Optional last day this guidance covers." error={fieldError(errors, "periodEnd")}>
              {(control) => <Input {...control} type="date" min={entryKey.date} {...form.register("periodEnd")} className="bg-surface" />}
            </AdminFormField>
          </AdminFormSection>
          <AdminSectionCard title="Preview">
            <p className="line-clamp-6 text-sm leading-6">{overview.trim() || <span className="text-muted-foreground">The overview will appear here.</span>}</p>
          </AdminSectionCard>
        </aside>
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-4 md:hidden">
        {cancelButton}
        {saveButton}
      </div>
    </form>
  );
}

function HoroscopeStatusCard({ entry }: { entry: ManagedHoroscope }) {
  const update = useHoroscopeStatusUpdate(entry.id);
  const confirm = useConfirmAction<HoroscopeStatus>(update);
  const target: HoroscopeStatus = entry.status === "published" ? "draft" : "published";
  return (
    <AdminSectionCard title="Publishing" actions={<AdminStatusBadge status={entry.status} labels={horoscopeStatusLabels} variants={horoscopeStatusVariants} />}>
      <div className="divide-y divide-border">
        <DetailRow label="Published" value={formatOptionalDateTime(entry.publishedAt)} />
        <DetailRow label="Updated" value={formatOptionalDateTime(entry.updatedAt)} />
      </div>
      <Button type="button" size="sm" variant={target === "published" ? "default" : "outline"} className={target === "published" ? "mt-3" : "mt-3 bg-surface"} disabled={update.isPending} onClick={() => confirm.open(target)}>
        {target === "published" ? "Publish" : "Move to draft"}
      </Button>
      <AdminConfirmDialog
        {...confirm.dialogProps}
        title={target === "published" ? "Publish this horoscope?" : "Move this horoscope to draft?"}
        description={target === "published" ? "It becomes visible on the public horoscope page for this period." : "It is removed from the public horoscope page."}
        confirmLabel={target === "published" ? "Publish" : "Move to draft"}
        onConfirm={() => update.mutate(target, { onSuccess: confirm.close })}
      />
    </AdminSectionCard>
  );
}
