"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useMemo, useState, type FormEvent } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { paiseToRupeesInput, rupeesToPaise } from "@/features/admin/lib/money";
import { astrologerModeLabels, astrologerModes } from "@/features/astrologers/constants/astrologer-status";
import {
  useAstrologerCityOptions,
  useAstrologerCountryOptions,
  useAstrologerDetail,
  useAstrologerLanguageOptions,
  useAstrologerTaxonomy,
  useUpdateAstrologerProfile,
} from "@/features/astrologers/hooks/use-astrologer-admin";
import { LANGUAGE_MAX_LENGTH, LANGUAGE_MIN_LENGTH, addLanguage, hasLanguage, languageAddError, languageListError, removeLanguage } from "@/features/astrologers/lib/astrologer-languages";
import type { AstrologerMode, AstrologerProfileInput, ManagedAstrologer } from "@/features/astrologers/types/astrologer-admin";
import { usePublicStates } from "@/features/master-data/hooks/use-master-data-admin";
import { cn } from "@/lib/utils";
import { AdminCombobox } from "../shared/admin-combobox";
import { AdminImageField } from "../shared/admin-image-field";
import { AdminFormError, AdminFormField, AdminFormSection } from "../shared/admin-form-section";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminDetailFrame } from "../shared/admin-server-list";

type ModeDraft = { enabled: boolean; price: string; duration: string };

const LOCATION_MIN = 2;
const LOCATION_MAX = 120;
const validLocation = (value: string) => value.trim().length >= LOCATION_MIN && value.trim().length <= LOCATION_MAX;

/** Edit-only profile form; every field maps to `PATCH /admin/astrologers/:id` and is validated by the server. */
export function AdminAstrologerEditor({ astrologerId }: { astrologerId: string }) {
  const detail = useAstrologerDetail(astrologerId);
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="astrologer">
      {() => <EditorForm key={detail.data!.updatedAt} astrologer={detail.data!} />}
    </AdminDetailFrame>
  );
}

/** Language chips plus a searchable picker over master-data languages. Custom names are allowed (the API stores strings). */
function LanguagesField({ value, onChange, error }: { value: string[]; onChange: (next: string[]) => void; error?: string }) {
  const languages = useAstrologerLanguageOptions();
  const [addError, setAddError] = useState<string | null>(null);
  const options = useMemo(
    () => (languages.data ?? []).filter((language) => !hasLanguage(value, language.name)).map((language) => ({ value: language.name, label: language.name })),
    [languages.data, value],
  );

  return (
    <AdminFormField
      label="Languages"
      required
      description="Pick from the language list, or type a name and choose “Add” if it is missing."
      error={addError ?? error}
    >
      {(control) => (
        <div className="grid gap-2.5">
          {value.length ? (
            <ul className="flex flex-wrap gap-1.5" aria-label="Selected languages">
              {value.map((language) => (
                <li key={language} className="inline-flex h-7 items-center gap-1 rounded-full border border-border bg-muted pl-2.5 pr-1 text-[13px] font-medium">
                  {language}
                  <button
                    type="button"
                    onClick={() => {
                      setAddError(null);
                      onChange(removeLanguage(value, language));
                    }}
                    className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-background hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring"
                    aria-label={`Remove ${language}`}
                  >
                    <X className="size-3" aria-hidden="true" />
                  </button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-[13px] text-muted-foreground">No languages added yet.</p>
          )}
          <AdminCombobox
            control={control}
            value={null}
            onValueChange={(next) => {
              if (!next) return;
              const problem = languageAddError(value, next);
              setAddError(problem);
              if (!problem) onChange(addLanguage(value, next));
            }}
            options={options}
            loading={languages.isPending}
            placeholder="Add a language"
            searchPlaceholder="Search languages…"
            emptyText={languages.error ? "Could not load the language list. Type a name to add it." : "No matching languages."}
            allowCustom={{
              label: (query) => `Add “${query.trim()}”`,
              validate: (query) => query.trim().length >= LANGUAGE_MIN_LENGTH && !hasLanguage(value, query),
              maxLength: LANGUAGE_MAX_LENGTH,
            }}
          />
        </div>
      )}
    </AdminFormField>
  );
}

/**
 * Country (stored as a name), an optional state to narrow cities (not saved), and city (stored as a name).
 * Both stored fields accept names outside master data because the API stores free text.
 */
function LocationFields({
  country,
  city,
  onCountryChange,
  onCityChange,
  countryError,
  cityError,
}: {
  country: string;
  city: string;
  onCountryChange: (value: string) => void;
  onCityChange: (value: string) => void;
  countryError?: string;
  cityError?: string;
}) {
  const countries = useAstrologerCountryOptions();
  const countryId = useMemo(() => countries.data?.find((item) => item.name.toLowerCase() === country.trim().toLowerCase())?.id ?? null, [countries.data, country]);
  const states = usePublicStates(countryId ?? "");
  const [stateId, setStateId] = useState<string | null>(null);
  const activeStateId = stateId && states.data?.some((state) => state.id === stateId) ? stateId : null;
  const cities = useAstrologerCityOptions(activeStateId);

  const countryOptions = useMemo(() => (countries.data ?? []).map((item) => ({ value: item.name, label: item.name })), [countries.data]);
  const stateOptions = useMemo(() => (states.data ?? []).filter((state) => state.id).map((state) => ({ value: state.id as string, label: state.name })), [states.data]);
  const cityOptions = useMemo(() => (cities.data ?? []).map((item) => ({ value: item.name, label: item.name })), [cities.data]);

  return (
    <>
      <AdminFormField label="Country" required error={countryError}>
        {(control) => (
          <AdminCombobox
            control={control}
            value={country || null}
            onValueChange={(next) => {
              onCountryChange(next ?? "");
              setStateId(null);
            }}
            options={countryOptions}
            loading={countries.isPending}
            placeholder="Choose a country"
            searchPlaceholder="Search countries…"
            emptyText={countries.error ? "Could not load countries. Type a name to use it." : "No matching countries."}
            allowCustom={{ validate: validLocation, maxLength: LOCATION_MAX }}
          />
        )}
      </AdminFormField>
      {stateOptions.length ? (
        <AdminFormField label="State" description="Only narrows the city list. It is not saved on the profile.">
          {(control) => (
            <AdminCombobox
              control={control}
              value={activeStateId}
              onValueChange={setStateId}
              options={stateOptions}
              placeholder="Any state"
              searchPlaceholder="Search states…"
              clearable
            />
          )}
        </AdminFormField>
      ) : null}
      <AdminFormField
        label="City"
        description={activeStateId ? undefined : stateOptions.length ? "Choose a state to see its cities, or type the city name." : "Type the city name."}
        error={cityError}
      >
        {(control) => (
          <AdminCombobox
            control={control}
            value={city || null}
            onValueChange={(next) => onCityChange(next ?? "")}
            options={cityOptions}
            loading={cities.isFetching}
            placeholder="Not set"
            searchPlaceholder={activeStateId ? "Search cities…" : "Type a city name…"}
            emptyText={activeStateId ? "No matching cities." : "Type at least 2 characters."}
            allowCustom={{ validate: validLocation, maxLength: LOCATION_MAX }}
            clearable
          />
        )}
      </AdminFormField>
    </>
  );
}

function EditorForm({ astrologer }: { astrologer: ManagedAstrologer }) {
  const router = useRouter();
  const mutation = useUpdateAstrologerProfile(astrologer.id);
  const expertiseOptions = useAstrologerTaxonomy("expertise");
  const specialtyOptions = useAstrologerTaxonomy("specialties");
  const detailHref = `/admin/astrologers/${astrologer.id}`;

  const [displayName, setDisplayName] = useState(astrologer.displayName);
  const [bio, setBio] = useState(astrologer.bio);
  const [imageUrl, setImageUrl] = useState(astrologer.profileImageUrl ?? "");
  const [experience, setExperience] = useState(String(astrologer.experienceYears));
  const [city, setCity] = useState(astrologer.city ?? "");
  const [country, setCountry] = useState(astrologer.country);
  const [languages, setLanguages] = useState<string[]>(astrologer.languages);
  const [expertiseIds, setExpertiseIds] = useState(astrologer.expertise.map((item) => item.id));
  const [specialtyIds, setSpecialtyIds] = useState(astrologer.specialties.map((item) => item.id));
  const [performsPoojas, setPerformsPoojas] = useState(astrologer.performsPoojas ?? false);
  const [modes, setModes] = useState<Record<AstrologerMode, ModeDraft>>(() => {
    const drafts = {} as Record<AstrologerMode, ModeDraft>;
    for (const mode of astrologerModes) {
      const current = astrologer.consultationModes.find((item) => item.mode === mode);
      drafts[mode] = { enabled: current?.enabled ?? false, price: paiseToRupeesInput(current?.pricePaise ?? 0), duration: current?.durationMinutes ? String(current.durationMinutes) : "" };
    }
    return drafts;
  });
  const [localError, setLocalError] = useState<string | null>(null);
  const [languagesError, setLanguagesError] = useState<string | null>(null);

  const fieldError = (path: string) => mutation.error?.fieldErrors.find((field) => field.path === path || field.path.startsWith(`${path}.`))?.message;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    setLocalError(null);
    const listProblem = languageListError(languages);
    setLanguagesError(listProblem);
    if (listProblem) return setLocalError("Fix the highlighted fields and save again.");
    const consultationModes = [];
    for (const mode of astrologerModes) {
      const draft = modes[mode];
      const label = astrologerModeLabels[mode].toLowerCase();
      const pricePaise = rupeesToPaise(draft.price || "0");
      if (pricePaise === null) return setLocalError(`Enter a valid ${label} price in rupees (up to 2 decimals).`);
      const duration = draft.duration.trim() ? Number(draft.duration) : null;
      if (duration !== null && !Number.isInteger(duration)) return setLocalError(`Enter a whole number of minutes for ${label}.`);
      consultationModes.push({ mode, enabled: draft.enabled, pricePaise, durationMinutes: duration });
    }
    const experienceYears = Number(experience);
    if (!Number.isInteger(experienceYears)) return setLocalError("Experience must be a whole number of years.");
    const input: AstrologerProfileInput = {
      displayName: displayName.trim(),
      bio: bio.trim(),
      profileImageUrl: imageUrl.trim() || null,
      experienceYears,
      city: city.trim() || null,
      country: country.trim(),
      languages,
      consultationModes,
      expertiseIds,
      specialtyIds,
      performsPoojas,
    };
    mutation.mutate(input, { onSuccess: () => router.push(detailHref) });
  };

  const toggle = (list: string[], id: string, checked: boolean) => (checked ? [...list, id] : list.filter((value) => value !== id));
  const formError = localError ?? (mutation.error ? (mutation.error.fieldErrors.length ? "Fix the highlighted fields and save again." : mutation.error.message) : null);
  const saveLabel = mutation.isPending ? "Saving…" : "Save changes";

  return (
    <form className="space-y-5" onSubmit={submit} noValidate>
      <AdminPageHeader
        title={`Edit ${astrologer.displayName}`}
        description="Changes are visible on the public profile once saved."
        backHref={detailHref}
        backLabel="Back to profile"
        actions={
          <Button variant="outline" size="sm" className="bg-surface" asChild>
            <Link href={detailHref}>Cancel</Link>
          </Button>
        }
        primaryAction={
          <Button type="submit" variant="conversion" size="sm" disabled={mutation.isPending}>
            {saveLabel}
          </Button>
        }
      />
      <AdminFormError message={formError} />

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <AdminFormSection title="Profile" description="Name, introduction and photo shown to customers.">
            <AdminFormField label="Display name" required error={fieldError("displayName")}>
              {(control) => <Input {...control} value={displayName} onChange={(event) => setDisplayName(event.target.value)} maxLength={160} />}
            </AdminFormField>
            <AdminFormField label="Bio" description="A few short paragraphs about their practice and approach." error={fieldError("bio")}>
              {(control) => <Textarea {...control} rows={6} value={bio} onChange={(event) => setBio(event.target.value)} maxLength={5000} />}
            </AdminFormField>
            <AdminImageField
              label="Profile photo"
              description="A clear, front-facing photo. JPEG, PNG or WebP; it is cropped to a square on cards."
              value={imageUrl.trim() || null}
              onChange={(value) => setImageUrl(value ?? "")}
              error={fieldError("profileImageUrl")}
              aspect="square"
              allowUrl
            />
            <div className="grid gap-4 sm:grid-cols-[12rem]">
              <AdminFormField label="Experience (years)" required error={fieldError("experienceYears")}>
                {(control) => <Input {...control} inputMode="numeric" className="tabular-nums" value={experience} onChange={(event) => setExperience(event.target.value)} />}
              </AdminFormField>
            </div>
            <LanguagesField
              value={languages}
              onChange={(next) => {
                setLanguages(next);
                setLanguagesError(null);
              }}
              error={languagesError ?? fieldError("languages")}
            />
          </AdminFormSection>

          <AdminFormSection title="Poojas" description="Astrologers can also turn this on themselves in the app.">
            <div className="flex items-center justify-between gap-4 rounded-[calc(var(--radius)-2px)] border border-border p-3">
              <div>
                <Label htmlFor="astrologer-performs-poojas">Performs poojas</Label>
                <p className="text-xs text-muted-foreground">Customers can choose this astrologer as their pandit when booking a pooja. The request goes to them to accept within 24 hours.</p>
              </div>
              <Switch id="astrologer-performs-poojas" checked={performsPoojas} onCheckedChange={setPerformsPoojas} />
            </div>
          </AdminFormSection>

          <AdminFormSection title="Consultation modes and pricing" description="Turn on the modes they offer. Prices are in rupees.">
            <div className="divide-y divide-border rounded-[calc(var(--radius)-2px)] border border-border">
              {astrologerModes.map((mode) => {
                const draft = modes[mode];
                const update = (patch: Partial<ModeDraft>) => setModes((current) => ({ ...current, [mode]: { ...current[mode], ...patch } }));
                return (
                  <div key={mode} className="grid items-end gap-3 p-4 sm:grid-cols-[10rem_1fr_1fr]">
                    <label className="flex items-center gap-2.5 self-center text-sm font-medium">
                      <Switch checked={draft.enabled} onCheckedChange={(checked) => update({ enabled: checked })} aria-label={`Offer ${astrologerModeLabels[mode].toLowerCase()}`} />
                      {astrologerModeLabels[mode]}
                    </label>
                    <AdminFormField label="Price">
                      {(control) => (
                        <div className="relative">
                          <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground" aria-hidden="true">
                            ₹
                          </span>
                          <Input {...control} inputMode="decimal" className={cn("pl-7 tabular-nums", !draft.enabled && "text-muted-foreground")} value={draft.price} onChange={(event) => update({ price: event.target.value })} />
                        </div>
                      )}
                    </AdminFormField>
                    <AdminFormField label="Session length (minutes)">
                      {(control) => <Input {...control} inputMode="numeric" className="tabular-nums" placeholder="Optional" value={draft.duration} onChange={(event) => update({ duration: event.target.value })} />}
                    </AdminFormField>
                  </div>
                );
              })}
            </div>
            {fieldError("consultationModes") ? <p className="text-xs text-destructive">{fieldError("consultationModes")}</p> : null}
          </AdminFormSection>

          <AdminFormSection title="Expertise and specialties" description="Choose from the lists managed in Master data.">
            <div className="grid gap-5 sm:grid-cols-2">
              {[
                { title: "Expertise", query: expertiseOptions, selected: expertiseIds, set: setExpertiseIds, path: "expertiseIds" },
                { title: "Specialties", query: specialtyOptions, selected: specialtyIds, set: setSpecialtyIds, path: "specialtyIds" },
              ].map((group) => (
                <fieldset key={group.title} className="space-y-2.5">
                  <legend className="mb-2.5 text-sm font-medium">
                    {group.title}
                    {group.selected.length ? <span className="ml-1.5 text-xs font-normal tabular-nums text-muted-foreground">{group.selected.length} selected</span> : null}
                  </legend>
                  {group.query.isPending ? (
                    <p className="text-[13px] text-muted-foreground">Loading…</p>
                  ) : group.query.error ? (
                    <p className="text-[13px] text-destructive">Could not load options; the current selection is kept.</p>
                  ) : group.query.data?.length ? (
                    group.query.data.map((option) => (
                      <label key={option.id} className="flex items-center gap-2.5 text-sm">
                        <Checkbox checked={group.selected.includes(option.id)} onCheckedChange={(checked) => group.set(toggle(group.selected, option.id, checked === true))} />
                        {option.name}
                      </label>
                    ))
                  ) : (
                    <p className="text-[13px] text-muted-foreground">No active options yet. Add them in Master data.</p>
                  )}
                  {fieldError(group.path) ? <p className="text-xs text-destructive">{fieldError(group.path)}</p> : null}
                </fieldset>
              ))}
            </div>
          </AdminFormSection>
        </div>

        <aside className="min-w-0 space-y-5">
          <AdminFormSection title="Location" description="Where they practise from.">
            <LocationFields country={country} city={city} onCountryChange={setCountry} onCityChange={setCity} countryError={fieldError("country")} cityError={fieldError("city")} />
          </AdminFormSection>
        </aside>
      </div>

      <div className="flex flex-col-reverse gap-2 border-t border-border pt-4 sm:flex-row sm:justify-end xl:hidden">
        <Button variant="outline" className="bg-surface" asChild>
          <Link href={detailHref}>Cancel</Link>
        </Button>
        <Button type="submit" variant="conversion" disabled={mutation.isPending}>
          {saveLabel}
        </Button>
      </div>
    </form>
  );
}
