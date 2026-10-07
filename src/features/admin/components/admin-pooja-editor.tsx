"use client";

import { useSessionImagePreview } from "../hooks/use-session-image-preview";
import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { BookOpen, CheckSquare, CircleDollarSign, FileText, ImageOff, ImageUp, ListChecks, Plus, ScrollText, Sparkles, Tags, Trash2, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { poojaCategories, getPoojaCategoryLabel, getPoojaStatusLabel } from "@/features/pooja/data/poojas";
import { formatPoojaDuration, formatPoojaPrice, getPoojaContentCompleteness, getPoojaManagementStatusLabel } from "@/features/pooja/selectors/pooja-domain";
import type { PoojaDefinition } from "@/features/pooja/types/pooja";
import { poojaServiceStatusValues } from "@/features/pooja/types/pooja";
import { useAdminScrollSpy } from "../hooks/use-admin-scroll-spy";
import { AdminEditorSectionNav, type AdminEditorSection } from "./shared/admin-editor-section-nav";
import { AdminDetailStickyRail } from "./shared/admin-detail-sticky-rail";
import { getPoojaEditorDefaults, poojaEditorSchema, poojaManagementStatusFormValues, toPoojaEditorPayload, type PoojaEditorValues } from "./pooja-editor-schema";

const sections: AdminEditorSection[] = [
  { id: "identity", label: "Identity", icon: ImageUp },
  { id: "classification", label: "Classification", icon: Tags },
  { id: "overview", label: "Overview", icon: FileText },
  { id: "quick-facts", label: "Quick facts", icon: ListChecks },
  { id: "ritual-process", label: "Ritual process", icon: ScrollText },
  { id: "required-details", label: "Required details", icon: CheckSquare },
  { id: "preparation", label: "Preparation", icon: Sparkles },
  { id: "optional-content", label: "Optional content", icon: Plus },
  { id: "service-pricing", label: "Service & pricing", icon: CircleDollarSign },
  { id: "review", label: "Review", icon: BookOpen },
];
const sectionIds = sections.map((section) => section.id);

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <Card id={id} className="scroll-mt-6 shadow-sm"><CardHeader className="px-4 pb-0 pt-4"><CardTitle className="font-sans text-[15px]">{title}</CardTitle></CardHeader><CardContent className="space-y-3 p-4">{children}</CardContent></Card>;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs font-medium text-destructive">{message}</p> : null;
}

function RemoveButton({ label, onClick }: { label: string; onClick: () => void }) {
  return <Button type="button" variant="ghost" size="sm" className="size-9 shrink-0 p-0 text-muted-foreground hover:text-destructive" aria-label={label} onClick={onClick}><Trash2 aria-hidden="true" /></Button>;
}

export function AdminPoojaEditor({ pooja }: { pooja: PoojaDefinition }) {
  const router = useRouter();
  const image = useSessionImagePreview();
  const [failedSrc, setFailedSrc] = useState<string | undefined>();
  const [showDiscard, setShowDiscard] = useState(false);
  const [apiBoundaryMessage, setApiBoundaryMessage] = useState<string | null>(null);
  const form = useForm<PoojaEditorValues>({ resolver: zodResolver(poojaEditorSchema), defaultValues: getPoojaEditorDefaults(pooja), mode: "onChange" });
  const { control, formState: { errors, isDirty, isValid }, getValues, handleSubmit, register, setValue, watch } = form;
  const overview = useFieldArray({ control, name: "overview" });
  const quickFacts = useFieldArray({ control, name: "quickFacts" });
  const ritualSteps = useFieldArray({ control, name: "ritualSteps" });
  const requiredDetails = useFieldArray({ control, name: "requiredDetails" });
  const preparationNotes = useFieldArray({ control, name: "preparationNotes" });
  const optionalSectionBody = useFieldArray({ control, name: "optionalSectionBody" });
  const values = watch();
  const { activeId, scrollToSection } = useAdminScrollSpy(sectionIds);
  const hasUnsavedChanges = isDirty || image.hasLocalFile;
  const previewSrc = image.previewUrl ?? values.imageSrc;
  const previewFailed = failedSrc === previewSrc;

  const liveCompleteness = useMemo(() => getPoojaContentCompleteness({
    ...pooja,
    name: values.name,
    imageSrc: values.imageSrc,
    shortDescription: values.shortDescription,
    categories: values.categories as PoojaDefinition["categories"],
    featured: values.featured || undefined,
    status: values.status,
    detail: {
      ...pooja.detail,
      overview: values.overview.map((item) => item.text),
      quickFacts: values.quickFacts,
      ritualSteps: values.ritualSteps,
      requiredDetails: values.requiredDetails.map((item) => item.text),
      preparationNotes: values.preparationNotes.map((item) => item.text),
      optionalSection: values.optionalSectionEnabled ? { title: values.optionalSectionTitle, body: values.optionalSectionBody.map((item) => item.text) } : undefined,
    },
  }), [pooja, values]);

  function toggleCategory(category: PoojaDefinition["categories"][number]) {
    const current = getValues("categories");
    const categories = current.includes(category) ? current.filter((item) => item !== category) : [...current, category];
    setValue("categories", categories, { shouldDirty: true, shouldValidate: true });
  }

  function onSubmit(formValues: PoojaEditorValues) {
    toPoojaEditorPayload(pooja, formValues, image.file);
    setApiBoundaryMessage("Saving Pooja changes requires the Admin API.");
  }

  function cancel() {
    if (hasUnsavedChanges) setShowDiscard(true);
    else router.push(`/admin/poojas/${pooja.slug}`);
  }

  const selectedCategoryLabels = (values.categories as PoojaDefinition["categories"]).map(getPoojaCategoryLabel).join(", ") || "\u2014";
  const managementLabel = values.managementStatus === "not-configured" ? "\u2014" : getPoojaManagementStatusLabel(values.managementStatus);
  const reviewDuration = formatPoojaDuration(values.estimatedDurationMinutes === "" ? undefined : Number(values.estimatedDurationMinutes));
  const reviewPrice = formatPoojaPrice(values.priceInRupees === "" ? undefined : Math.round(Number(values.priceInRupees) * 100), values.priceInRupees === "" ? undefined : "INR");

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[1240px] space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3"><h1 className="truncate font-sans text-xl font-semibold tracking-tight text-foreground">Edit Pooja</h1></div>
        <div className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" onClick={cancel}>Cancel</Button><Button type="submit" size="sm" disabled={!hasUnsavedChanges || !isValid}>Save changes</Button></div>
      </header>

      {apiBoundaryMessage ? <Card className="border-warning/30 shadow-sm"><CardContent className="p-4 text-sm text-foreground">{apiBoundaryMessage}</CardContent></Card> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0 space-y-4">
          <Section id="identity" title="Identity">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative flex h-20 w-28 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--radius)-2px)] bg-muted text-muted-foreground">
                <ImageOff className="size-5" aria-hidden="true" />
                {previewSrc && !previewFailed ? <img src={previewSrc} alt={values.name || "Pooja preview"} className="absolute inset-0 size-full object-cover" onError={() => setFailedSrc(previewSrc)} /> : null}
              </div>
              <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="outline" size="sm" onClick={image.openPicker}><ImageUp aria-hidden="true" />Upload image</Button>{image.hasLocalFile ? <Button type="button" variant="ghost" size="sm" onClick={image.clear}><X aria-hidden="true" />Remove local image</Button> : null}</div>
              <input ref={image.inputRef} type="file" accept="image/*" aria-label="Upload Pooja image" className="sr-only" onChange={image.handleInputChange} />
            </div>
            <FieldError message={image.error ?? undefined} />
            <div className="grid gap-3 sm:grid-cols-2"><div className="grid gap-1 sm:col-span-2"><Label htmlFor="name">Name</Label><Input id="name" aria-invalid={Boolean(errors.name)} {...register("name")} /><FieldError message={errors.name?.message} /></div><div className="grid gap-1 sm:col-span-2"><Label htmlFor="imageSrc">Image URL</Label><Input id="imageSrc" aria-invalid={Boolean(errors.imageSrc)} {...register("imageSrc")} /><FieldError message={errors.imageSrc?.message} /></div><div className="grid gap-1 sm:col-span-2"><Label htmlFor="shortDescription">Short description</Label><Textarea id="shortDescription" aria-invalid={Boolean(errors.shortDescription)} {...register("shortDescription")} /><FieldError message={errors.shortDescription?.message} /></div><div className="grid gap-1"><Label>Slug</Label><Input value={pooja.slug} readOnly aria-label="Slug" /></div></div>
          </Section>

          <Section id="classification" title="Classification">
            <div className="grid gap-2"><Label>Categories</Label><div className="grid gap-2 sm:grid-cols-2">{poojaCategories.filter((option) => option.value !== "all").map((option) => { const category = option.value as PoojaDefinition["categories"][number]; const id = `category-${category}`; return <div key={category} className="flex items-center gap-2"><Checkbox id={id} checked={values.categories.includes(category)} onCheckedChange={() => toggleCategory(category)} /><Label htmlFor={id} className="font-normal leading-5">{option.label}</Label></div>; })}</div><FieldError message={errors.categories?.message} /></div>
            <div className="flex items-center gap-2"><Checkbox id="featured" checked={values.featured} onCheckedChange={(checked) => setValue("featured", checked === true, { shouldDirty: true, shouldValidate: true })} /><Label htmlFor="featured" className="font-normal">Featured catalog placement</Label></div>
            <div className="grid gap-1.5"><Label>Service status</Label><Select value={values.status} onValueChange={(value) => setValue("status", value as PoojaEditorValues["status"], { shouldDirty: true, shouldValidate: true })}><SelectTrigger aria-label="Service status"><SelectValue>{getPoojaStatusLabel(values.status)}</SelectValue></SelectTrigger><SelectContent>{poojaServiceStatusValues.map((status) => <SelectItem key={status} value={status}>{getPoojaStatusLabel(status)}</SelectItem>)}</SelectContent></Select><FieldError message={errors.status?.message} /></div>
          </Section>

          <Section id="overview" title="Overview"><p className="text-xs text-muted-foreground">Keep content descriptive and avoid guaranteed outcomes.</p>{overview.fields.map((field, index) => <div key={field.id} className="grid gap-1"><div className="flex gap-2"><Textarea aria-label={`Overview paragraph ${index + 1}`} {...register(`overview.${index}.text`)} /><RemoveButton label={`Remove overview paragraph ${index + 1}`} onClick={() => overview.remove(index)} /></div><FieldError message={errors.overview?.[index]?.text?.message} /></div>)}<Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => overview.append({ text: "" })}><Plus aria-hidden="true" />Add paragraph</Button></Section>

          <Section id="quick-facts" title="Quick facts">{quickFacts.fields.map((field, index) => <div key={field.id} className="grid gap-2 border-b border-border pb-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.4fr)_auto]"><Input aria-label={`Quick fact ${index + 1} label`} placeholder="Label" {...register(`quickFacts.${index}.label`)} /><Input aria-label={`Quick fact ${index + 1} value`} placeholder="Value" {...register(`quickFacts.${index}.value`)} /><RemoveButton label={`Remove quick fact ${index + 1}`} onClick={() => quickFacts.remove(index)} /><FieldError message={errors.quickFacts?.[index]?.label?.message ?? errors.quickFacts?.[index]?.value?.message} /></div>)}<Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => quickFacts.append({ label: "", value: "" })}><Plus aria-hidden="true" />Add quick fact</Button></Section>

          <Section id="ritual-process" title="Ritual process">{ritualSteps.fields.map((field, index) => <div key={field.id} className="grid gap-2 border-b border-border pb-3"><div className="flex gap-2"><Input aria-label={`Ritual step ${index + 1} title`} placeholder="Step title" {...register(`ritualSteps.${index}.title`)} /><RemoveButton label={`Remove ritual step ${index + 1}`} onClick={() => ritualSteps.remove(index)} /></div><Textarea aria-label={`Ritual step ${index + 1} description`} placeholder="Step description" {...register(`ritualSteps.${index}.description`)} /><FieldError message={errors.ritualSteps?.[index]?.title?.message ?? errors.ritualSteps?.[index]?.description?.message} /></div>)}<Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => ritualSteps.append({ title: "", description: "" })}><Plus aria-hidden="true" />Add ritual step</Button></Section>

          <Section id="required-details" title="Required details">{requiredDetails.fields.map((field, index) => <div key={field.id} className="grid gap-1"><div className="flex gap-2"><Input aria-label={`Required detail ${index + 1}`} {...register(`requiredDetails.${index}.text`)} /><RemoveButton label={`Remove required detail ${index + 1}`} onClick={() => requiredDetails.remove(index)} /></div><FieldError message={errors.requiredDetails?.[index]?.text?.message} /></div>)}<Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => requiredDetails.append({ text: "" })}><Plus aria-hidden="true" />Add required detail</Button></Section>

          <Section id="preparation" title="Preparation">{preparationNotes.fields.map((field, index) => <div key={field.id} className="grid gap-1"><div className="flex gap-2"><Textarea aria-label={`Preparation note ${index + 1}`} {...register(`preparationNotes.${index}.text`)} /><RemoveButton label={`Remove preparation note ${index + 1}`} onClick={() => preparationNotes.remove(index)} /></div><FieldError message={errors.preparationNotes?.[index]?.text?.message} /></div>)}<Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => preparationNotes.append({ text: "" })}><Plus aria-hidden="true" />Add preparation note</Button></Section>

          <Section id="optional-content" title="Optional content"><div className="flex items-center gap-2"><Checkbox id="optionalSectionEnabled" checked={values.optionalSectionEnabled} onCheckedChange={(checked) => setValue("optionalSectionEnabled", checked === true, { shouldDirty: true, shouldValidate: true })} /><Label htmlFor="optionalSectionEnabled" className="font-normal">Include optional section</Label></div>{values.optionalSectionEnabled ? <div className="space-y-3"><div className="grid gap-1"><Label htmlFor="optionalSectionTitle">Section title</Label><Input id="optionalSectionTitle" {...register("optionalSectionTitle")} /><FieldError message={errors.optionalSectionTitle?.message} /></div>{optionalSectionBody.fields.map((field, index) => <div key={field.id} className="flex gap-2"><Textarea aria-label={`Optional content paragraph ${index + 1}`} {...register(`optionalSectionBody.${index}.text`)} /><RemoveButton label={`Remove optional content paragraph ${index + 1}`} onClick={() => optionalSectionBody.remove(index)} /></div>)}<FieldError message={errors.optionalSectionBody?.message} /><Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => optionalSectionBody.append({ text: "" })}><Plus aria-hidden="true" />Add paragraph</Button></div> : <Button type="button" variant="outline" size="sm" onClick={() => setValue("optionalSectionEnabled", true, { shouldDirty: true, shouldValidate: true })}><Plus aria-hidden="true" />Add optional section</Button>}</Section>

          <Section id="service-pricing" title="Service & pricing"><div className="grid gap-3 sm:grid-cols-2"><div className="grid gap-1"><Label htmlFor="estimatedDurationMinutes">Estimated duration (minutes)</Label><Input id="estimatedDurationMinutes" inputMode="numeric" placeholder="Not configured" aria-invalid={Boolean(errors.estimatedDurationMinutes)} {...register("estimatedDurationMinutes")} /><FieldError message={errors.estimatedDurationMinutes?.message} /></div><div className="grid gap-1"><Label htmlFor="priceInRupees">Price (INR)</Label><Input id="priceInRupees" inputMode="decimal" placeholder="Not configured" aria-invalid={Boolean(errors.priceInRupees)} {...register("priceInRupees")} /><FieldError message={errors.priceInRupees?.message} /></div></div><div className="grid gap-1.5"><Label>Management status</Label><Select value={values.managementStatus} onValueChange={(value) => setValue("managementStatus", value as PoojaEditorValues["managementStatus"], { shouldDirty: true, shouldValidate: true })}><SelectTrigger aria-label="Management status"><SelectValue>{values.managementStatus === "not-configured" ? "Not configured" : getPoojaManagementStatusLabel(values.managementStatus)}</SelectValue></SelectTrigger><SelectContent>{poojaManagementStatusFormValues.map((status) => <SelectItem key={status} value={status}>{status === "not-configured" ? "Not configured" : getPoojaManagementStatusLabel(status)}</SelectItem>)}</SelectContent></Select></div></Section>

          <Section id="review" title="Review"><div className="grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2">{[["Name", values.name || "\u2014"], ["Categories", selectedCategoryLabels], ["Featured", values.featured ? "Yes" : "No"], ["Service status", getPoojaStatusLabel(values.status)], ["Management status", managementLabel], ["Content completeness", `${liveCompleteness.percentage}% (${liveCompleteness.completed}/${liveCompleteness.total})`], ["Overview paragraphs", values.overview.length], ["Quick facts", values.quickFacts.length], ["Ritual steps", values.ritualSteps.length], ["Required details", values.requiredDetails.length], ["Preparation notes", values.preparationNotes.length], ["Estimated duration", reviewDuration], ["Price", reviewPrice]].map(([label, value]) => <div key={String(label)}><p className="text-muted-foreground">{label}</p><p className="font-medium text-foreground">{value}</p></div>)}</div></Section>
        </div>
        <AdminDetailStickyRail className="order-first xl:order-none"><div className="xl:hidden"><Card className="shadow-sm"><CardContent className="p-2"><AdminEditorSectionNav sections={sections} activeId={activeId} onNavigate={scrollToSection} /></CardContent></Card></div><div className="hidden xl:block"><Card className="shadow-sm"><CardContent className="p-2"><AdminEditorSectionNav sections={sections} activeId={activeId} onNavigate={scrollToSection} /></CardContent></Card></div><Card className="shadow-sm"><CardContent className="space-y-1.5 p-3 text-sm"><p className="text-xs text-muted-foreground">Content completeness</p><p className="font-semibold text-foreground">{liveCompleteness.percentage}%</p><p className="text-xs text-muted-foreground">{liveCompleteness.completed} of {liveCompleteness.total} fields</p></CardContent></Card></AdminDetailStickyRail>
      </div>
      <AlertDialog open={showDiscard} onOpenChange={setShowDiscard}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle><AlertDialogDescription>Your local changes will be lost.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="whitespace-nowrap">Continue editing</AlertDialogCancel><AlertDialogAction className="whitespace-nowrap" onClick={() => router.push(`/admin/poojas/${pooja.slug}`)}>Discard changes</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </form>
  );
}
