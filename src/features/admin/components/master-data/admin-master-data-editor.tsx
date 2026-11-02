"use client";

import { useRouter } from "next/navigation";
import { useMemo } from "react";
import { Controller, useWatch } from "react-hook-form";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useAdminForm } from "@/features/admin/data/use-admin-form";
import {
  MASTER_DATA_ERROR_HINTS,
  consultationModeLabel,
  masterDataKey,
  masterDataMeta,
  masterDataParent,
  textDirectionLabels,
} from "@/features/master-data/constants/master-data-entities";
import {
  useCreateMasterData,
  useMasterDataDeleteProps,
  useMasterDataDetail,
  useMasterDataOptions,
  usePublicStates,
  useUpdateMasterData,
} from "@/features/master-data/hooks/use-master-data-admin";
import {
  emptyMasterDataForm,
  hasMasterDataField,
  masterDataFormFromRecord,
  masterDataSlug,
  missingConsultationModes,
  toMasterDataCreatePayload,
  toMasterDataUpdatePayload,
  type MasterDataFormValues,
} from "@/features/master-data/lib/master-data-payload";
import type { AdminMasterDataRecord, MasterDataEntity } from "@/features/master-data/types/master-data-admin";
import { formatDateTime } from "../../lib/format";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDeleteAction } from "../shared/admin-delete-action";
import { AdminFormError, AdminFormField, AdminFormSection, fieldError } from "../shared/admin-form-section";
import { AdminImageField } from "../shared/admin-image-field";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminCombobox } from "../shared/admin-combobox";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminSelectField } from "../shared/admin-select-field";
import { MasterDataStatusBadge } from "./admin-master-data-directory";
import { masterDataEditorSchema } from "./master-data-editor-schema";
import { MasterDataStatusToggle } from "./master-data-status-toggle";

type EditorProps = {
  entity: MasterDataEntity;
  record: AdminMasterDataRecord | null;
  defaults: MasterDataFormValues;
  /** Consultation modes that can still be created (create mode only). */
  allowedModes: readonly string[];
  /** Current state of a city (shown even when inactive, which the public cascade omits). */
  currentState: AdminMasterDataRecord | null;
};

function MasterDataForm({ entity, record, defaults, allowedModes, currentState }: EditorProps) {
  const router = useRouter();
  const meta = masterDataMeta[entity];
  const isEdit = record !== null;
  const recordKey = record ? masterDataKey(entity, record) : "";
  const listHref = `/admin/master-data/${entity}`;
  const create = useCreateMasterData(entity, meta.singular);
  const update = useUpdateMasterData(entity, recordKey, meta.singular);
  const deleteProps = useMasterDataDeleteProps(entity);
  const schema = useMemo(() => masterDataEditorSchema(entity, isEdit ? "edit" : "create", allowedModes), [allowedModes, entity, isEdit]);
  const has = (field: Parameters<typeof hasMasterDataField>[1]) => hasMasterDataField(entity, field);

  const { form, submit, formError, pending, canSubmit } = useAdminForm<MasterDataFormValues, MasterDataFormValues, ReturnType<typeof toMasterDataCreatePayload>, AdminMasterDataRecord>({
    schema,
    defaultValues: defaults,
    mutation: isEdit ? update : create,
    toInput: (values) => (isEdit ? toMasterDataUpdatePayload(entity, values) : toMasterDataCreatePayload(entity, values)),
    onSuccess: (result, values, current) => {
      if (isEdit) {
        current.reset(masterDataFormFromRecord(result, values.countryId));
        return;
      }
      const parent = masterDataParent[entity];
      const parentId = parent ? values[parent.param] : "";
      router.push(parent && parentId ? `${listHref}?${parent.param}=${parentId}` : listHref);
    },
  });
  const { errors, dirtyFields } = form.formState;
  const countryId = useWatch({ control: form.control, name: "countryId" });
  const countries = useMasterDataOptions("countries", entity === "states" || entity === "cities");
  const states = usePublicStates(entity === "cities" ? countryId : "");
  const stateOptions = useMemo(() => {
    const options = (states.data ?? []).map((state) => ({ id: state.id ?? "", name: state.name }));
    if (currentState?.id && currentState.countryId === countryId && !options.some((option) => option.id === currentState.id)) {
      options.unshift({ id: currentState.id, name: `${currentState.name} (inactive)` });
    }
    return options;
  }, [countryId, currentState, states.data]);
  const errorCode = (isEdit ? update : create).error?.code;
  const hint = formError && errorCode ? MASTER_DATA_ERROR_HINTS[errorCode] : undefined;

  const nameField = form.register("name", {
    onChange: (event: { target: { value: string } }) => {
      if (!isEdit && has("slug") && !dirtyFields.slug) form.setValue("slug", masterDataSlug(event.target.value), { shouldValidate: form.formState.isSubmitted });
    },
  });

  const submitLabel = pending ? "Saving…" : isEdit ? "Save changes" : `Create ${meta.singular.toLowerCase()}`;
  const submitDisabled = pending || (isEdit && !canSubmit);
  const cancelButton = (
    <Button type="button" variant="outline" size="sm" className="bg-surface" onClick={() => router.push(listHref)} disabled={pending}>
      Cancel
    </Button>
  );
  const saveButton = (
    <Button type="submit" variant="conversion" size="sm" disabled={submitDisabled} aria-busy={pending || undefined}>
      {submitLabel}
    </Button>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <AdminPageHeader
        title={isEdit ? record.name : `New ${meta.singular.toLowerCase()}`}
        description={meta.description}
        backHref={listHref}
        backLabel={meta.plural}
        meta={isEdit ? <MasterDataStatusBadge active={record.active} /> : undefined}
        actions={cancelButton}
        primaryAction={saveButton}
      />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <AdminFormSection title="Details">
            {entity === "consultation-modes" ? (
              isEdit ? (
                <AdminFormField label="Mode" description="The mode itself cannot be changed. Rename it below.">
                  {(control) => <Input {...control} value={consultationModeLabel(record.code)} readOnly disabled />}
                </AdminFormField>
              ) : (
                <AdminFormField label="Mode" required error={fieldError(errors, "code")}>
                  {(control) => (
                    <Controller
                      name="code"
                      control={form.control}
                      render={({ field }) => (
                        <AdminSelectField
                          control={control}
                          value={field.value}
                          onValueChange={(value) => field.onChange(value ?? "")}
                          onBlur={field.onBlur}
                          options={allowedModes.map((code) => ({ value: code, label: consultationModeLabel(code) }))}
                          placeholder="Choose a mode"
                        />
                      )}
                    />
                  )}
                </AdminFormField>
              )
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <AdminFormField label="Name" required error={fieldError(errors, "name")}>
                {(control) => <Input {...control} {...nameField} maxLength={120} autoComplete="off" />}
              </AdminFormField>
              {has("slug") ? (
                <AdminFormField label="Slug" required error={fieldError(errors, "slug")} description={isEdit ? "Changing the slug can break existing links." : "Generated from the name; edit if needed."}>
                  {(control) => <Input {...control} {...form.register("slug")} maxLength={140} autoComplete="off" className="font-mono" />}
                </AdminFormField>
              ) : null}
              {entity === "languages" ? (
                <AdminFormField label="Native name" error={fieldError(errors, "nativeName")} description="For example हिन्दी.">
                  {(control) => <Input {...control} {...form.register("nativeName")} maxLength={120} />}
                </AdminFormField>
              ) : null}
              {has("code") && entity !== "consultation-modes" ? (
                <AdminFormField
                  label={entity === "languages" ? "Language code" : entity === "countries" ? "ISO code" : "Code"}
                  required={entity !== "states"}
                  error={fieldError(errors, "code")}
                  description={entity === "languages" ? "Stored lowercase, for example hi." : entity === "countries" ? "Stored uppercase, for example IN." : "Optional. Stored uppercase, for example MH."}
                >
                  {(control) => <Input {...control} {...form.register("code")} maxLength={entity === "countries" ? 3 : 16} autoComplete="off" className="font-mono" />}
                </AdminFormField>
              ) : null}
              {has("direction") ? (
                <AdminFormField label="Text direction" error={fieldError(errors, "direction")}>
                  {(control) => (
                    <Controller
                      name="direction"
                      control={form.control}
                      render={({ field }) => (
                        <AdminSelectField
                          control={control}
                          value={field.value}
                          onValueChange={(value) => field.onChange((value ?? "ltr") as "ltr" | "rtl")}
                          onBlur={field.onBlur}
                          options={textDirectionLabels}
                        />
                      )}
                    />
                  )}
                </AdminFormField>
              ) : null}
              {has("phoneCode") ? (
                <AdminFormField label="Dialling code" error={fieldError(errors, "phoneCode")} description="Optional, for example +91.">
                  {(control) => <Input {...control} {...form.register("phoneCode")} maxLength={8} inputMode="tel" autoComplete="off" />}
                </AdminFormField>
              ) : null}
              {has("technicalKey") ? (
                <AdminFormField label="Technical key" error={fieldError(errors, "technicalKey")} description="Optional identifier used by integrations, for example graha_shanti.">
                  {(control) => <Input {...control} {...form.register("technicalKey")} maxLength={80} autoComplete="off" className="font-mono" />}
                </AdminFormField>
              ) : null}
            </div>
            {has("description") ? (
              <AdminFormField label="Description" error={fieldError(errors, "description")} description="Optional.">
                {(control) => <Textarea {...control} {...form.register("description")} maxLength={2000} rows={3} />}
              </AdminFormField>
            ) : null}
            {has("imageUrl") ? (
              <Controller
                name="imageUrl"
                control={form.control}
                render={({ field, fieldState }) => <AdminImageField label="Image" description="Optional. Shown with this expertise." value={field.value} onChange={field.onChange} error={fieldState.error?.message} aspect="square" />}
              />
            ) : null}
          </AdminFormSection>

          {entity === "states" || entity === "cities" ? (
            <AdminFormSection title="Location" description={entity === "cities" ? "Choose the country, then the state this city belongs to." : undefined}>
              <div className="grid gap-4 sm:grid-cols-2">
                <AdminFormField label="Country" required error={fieldError(errors, "countryId")} description={countries.truncated ? "Showing the first 100 countries." : undefined}>
                  {(control) => (
                    <Controller
                      name="countryId"
                      control={form.control}
                      render={({ field }) => (
                        <AdminCombobox
                          control={control}
                          value={field.value || null}
                          onValueChange={(value) => {
                            if (!value || value === field.value) return;
                            field.onChange(value);
                            if (entity === "cities") form.setValue("stateId", "", { shouldDirty: true });
                          }}
                          options={countries.items.map((country) => ({ value: country.id ?? "", label: country.name, description: country.active ? undefined : "Inactive" }))}
                          loading={!countries.ready}
                          placeholder={countries.ready ? "Choose a country" : "Loading countries…"}
                          searchPlaceholder="Search countries…"
                          emptyText="No countries match."
                          selectedLabel="Selected country"
                        />
                      )}
                    />
                  )}
                </AdminFormField>
                {entity === "cities" ? (
                  <AdminFormField
                    label="State"
                    required
                    error={fieldError(errors, "stateId")}
                    description={countryId && states.isSuccess && stateOptions.length === 0 ? "This country has no active states." : states.isError ? "Could not load states." : undefined}
                  >
                    {(control) => (
                      <Controller
                        name="stateId"
                        control={form.control}
                        render={({ field }) => (
                          <AdminCombobox
                            control={control}
                            value={field.value || null}
                            onValueChange={(value) => {
                              if (value) field.onChange(value);
                            }}
                            options={stateOptions.map((state) => ({ value: state.id, label: state.name }))}
                            loading={states.isLoading}
                            disabled={!countryId}
                            placeholder={!countryId ? "Choose a country first" : states.isLoading ? "Loading states…" : "Choose a state"}
                            searchPlaceholder="Search states…"
                            emptyText="No states match."
                            selectedLabel="Selected state"
                          />
                        )}
                      />
                    )}
                  </AdminFormField>
                ) : null}
              </div>
            </AdminFormSection>
          ) : null}
          <AdminFormError message={formError} />
          {hint ? <p className="rounded-[calc(var(--radius)-2px)] border border-warning/30 bg-warning/10 p-3 text-sm">{hint}</p> : null}
        </div>

        <AdminDetailStickyRail>
          <AdminFormSection title="Visibility">
            {isEdit ? (
              <div className="flex items-center justify-between gap-3">
                <MasterDataStatusBadge active={record.active} />
                <MasterDataStatusToggle entity={entity} recordKey={recordKey} name={record.name} active={record.active} variant="outline" />
              </div>
            ) : (
              <Controller
                name="active"
                control={form.control}
                render={({ field }) => (
                  <label className="flex items-center justify-between gap-3 text-sm">
                    <span>
                      <span className="font-medium">Active</span>
                      <span className="block text-xs text-muted-foreground">Inactive entries are hidden from pickers.</span>
                    </span>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </label>
                )}
              />
            )}
            <AdminFormField label="Sort order" error={fieldError(errors, "sortOrder")} description="Lower numbers are listed first.">
              {(control) => <Input {...control} type="number" min={0} step={1} inputMode="numeric" {...form.register("sortOrder", { valueAsNumber: true })} />}
            </AdminFormField>
            {has("isDefault") ? (
              <Controller
                name="isDefault"
                control={form.control}
                render={({ field }) => {
                  const lockedDefault = Boolean(record?.isDefault);
                  return (
                    <label className="flex items-start gap-2.5 text-sm">
                      <Checkbox checked={field.value} onCheckedChange={(value) => field.onChange(value === true)} disabled={lockedDefault} className="mt-0.5" />
                      <span>
                        <span className="font-medium">Default language</span>
                        <span className="block text-xs text-muted-foreground">
                          {lockedDefault ? "To change the default, make another language the default." : "Replaces the current default language."}
                        </span>
                      </span>
                    </label>
                  );
                }}
              />
            ) : null}
          </AdminFormSection>

          {isEdit ? (
            <AdminSectionCard title="Record">
              <div className="divide-y divide-border">
                {meta.usageNoun ? <DetailRow label="Used by" value={`${record.usageCount} ${meta.usageNoun}`} /> : null}
                <DetailRow label="Created" value={<span className="tabular-nums">{formatDateTime(record.createdAt)}</span>} />
                <DetailRow label="Updated" value={<span className="tabular-nums">{formatDateTime(record.updatedAt)}</span>} />
              </div>
              <div className="mt-4 border-t border-border pt-4">
                <AdminDeleteAction
                  id={recordKey}
                  entityLabel={meta.singular.toLowerCase()}
                  {...deleteProps}
                  redirectTo={listHref}
                  triggerClassName="w-full bg-surface text-destructive hover:text-destructive"
                  description={
                    record.usageCount > 0
                      ? `This ${meta.singular.toLowerCase()} is used by ${record.usageCount} ${meta.usageNoun ?? "records"}, so it cannot be deleted. Deactivate it instead.`
                      : `This permanently removes the ${meta.singular.toLowerCase()}. It cannot be undone.`
                  }
                />
              </div>
            </AdminSectionCard>
          ) : null}
        </AdminDetailStickyRail>
      </div>

      <div className="flex justify-end gap-2 border-t border-border pt-4 sm:hidden">
        {cancelButton}
        {saveButton}
      </div>
    </form>
  );
}

/**
 * Edit: loads the record (and, for a city, its state for the country -> state cascade) before mounting the form. The
 * form is not remounted on refetch (a status toggle must not discard unsaved edits); saving resets it from the response.
 */
function EditMasterData({ entity, recordKey }: { entity: MasterDataEntity; recordKey: string }) {
  const detail = useMasterDataDetail(entity, recordKey);
  const stateId = entity === "cities" ? (detail.data?.stateId ?? null) : null;
  const state = useMasterDataDetail("states", stateId);
  const waitingForState = Boolean(stateId) && !state.ready;
  return (
    <AdminDetailFrame ready={detail.ready && !waitingForState} error={detail.error} onRetry={detail.reload} noun={masterDataMeta[entity].singular.toLowerCase()}>
      {() => (
        <MasterDataForm
          entity={entity}
          record={detail.data!}
          defaults={masterDataFormFromRecord(detail.data!, state.data?.countryId ?? "")}
          allowedModes={[]}
          currentState={state.data}
        />
      )}
    </AdminDetailFrame>
  );
}

function CreateMasterData({ entity, prefill }: { entity: MasterDataEntity; prefill: { countryId?: string; stateId?: string } }) {
  const modes = useMasterDataOptions("consultation-modes", entity === "consultation-modes");
  const parentState = useMasterDataDetail("states", entity === "cities" && prefill.stateId ? prefill.stateId : null);
  const waitingForState = entity === "cities" && Boolean(prefill.stateId) && !parentState.ready;
  if (entity === "consultation-modes") {
    return (
      <AdminDetailFrame ready={modes.ready} error={modes.error} onRetry={modes.reload} noun="consultation modes">
        {() => {
          const allowed = missingConsultationModes(modes.items.map((item) => item.code));
          if (!allowed.length) {
            return (
              <AdminSectionCard title="Consultation modes">
                <p className="text-sm text-muted-foreground">Chat, voice and video all exist. Edit an existing mode instead.</p>
              </AdminSectionCard>
            );
          }
          return <MasterDataForm entity={entity} record={null} defaults={{ ...emptyMasterDataForm(), code: allowed[0] }} allowedModes={allowed} currentState={null} />;
        }}
      </AdminDetailFrame>
    );
  }
  if (waitingForState) return <AdminDetailFrame ready={false} error={null} onRetry={() => undefined} noun="form">{() => null}</AdminDetailFrame>;
  const defaults: MasterDataFormValues = {
    ...emptyMasterDataForm(),
    countryId: entity === "cities" ? (parentState.data?.countryId ?? "") : entity === "states" ? (prefill.countryId ?? "") : "",
    stateId: entity === "cities" && parentState.data ? (parentState.data.id ?? "") : "",
  };
  return <MasterDataForm entity={entity} record={null} defaults={defaults} allowedModes={[]} currentState={parentState.data} />;
}

/** Create (`recordKey` omitted) or edit one master-data entry. */
export function AdminMasterDataEditor({ entity, recordKey, prefill = {} }: { entity: MasterDataEntity; recordKey?: string; prefill?: { countryId?: string; stateId?: string } }) {
  return recordKey ? <EditMasterData entity={entity} recordKey={recordKey} /> : <CreateMasterData entity={entity} prefill={prefill} />;
}
