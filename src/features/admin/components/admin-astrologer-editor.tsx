"use client";

import { useSessionImagePreview } from "../hooks/use-session-image-preview";
import { useEffect, useMemo, useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useFieldArray, useForm } from "react-hook-form";
import { BookOpen, BriefcaseBusiness, FileText, ImageUp, Languages, ListChecks, Plus, Sparkles, Trash2, UserRound, X } from "lucide-react";
import { useRouter } from "next/navigation";

import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from "@/components/ui/alert-dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { availabilityOptions, expertiseOptions, languageOptions } from "@/features/astrologers/data/astrologers";
import { formatAstrologerExperience, getAstrologerProfileCompleteness } from "@/features/astrologers/selectors/astrologer-domain";
import type { AstrologerListItem, ConsultationMode } from "@/features/astrologers/types/astrologer";
import { useAdminScrollSpy } from "../hooks/use-admin-scroll-spy";
import { AdminEditorSectionNav, type AdminEditorSection } from "./shared/admin-editor-section-nav";
import { AdminDetailStickyRail } from "./shared/admin-detail-sticky-rail";
import { astrologerEditorSchema, consultationModes, getAstrologerEditorDefaults, managementStatusFormValues, managementStatusValues, toAstrologerEditorPayload, type AstrologerEditorValues } from "./astrologer-editor-schema";

const sections: AdminEditorSection[] = [
  { id: "identity", label: "Identity", icon: UserRound },
  { id: "expertise", label: "Expertise", icon: Sparkles },
  { id: "profile-content", label: "Profile content", icon: FileText },
  { id: "languages-consultation", label: "Languages & consultation", icon: Languages },
  { id: "experience-pricing", label: "Experience & pricing", icon: BriefcaseBusiness },
  { id: "availability-management", label: "Availability & management", icon: ListChecks },
  { id: "review", label: "Review", icon: BookOpen },
];
const sectionIds = sections.map((section) => section.id);

function Section({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return <Card id={id} className="scroll-mt-6 shadow-sm"><CardHeader className="px-4 pb-0 pt-4"><CardTitle className="font-sans text-[15px]">{title}</CardTitle></CardHeader><CardContent className="space-y-3 p-4">{children}</CardContent></Card>;
}

function FieldError({ message }: { message?: string }) {
  return message ? <p className="text-xs font-medium text-destructive">{message}</p> : null;
}

function initialFallback(name: string) {
  return name.trim().split(/\s+/).map((part) => part[0]).join("").slice(0, 2).toUpperCase();
}

export function AdminAstrologerEditor({ astrologer }: { astrologer: AstrologerListItem }) {
  const router = useRouter();
  const avatar = useSessionImagePreview();
  const [specialtyInput, setSpecialtyInput] = useState("");
  const [showDiscard, setShowDiscard] = useState(false);
  const [apiBoundaryMessage, setApiBoundaryMessage] = useState<string | null>(null);
  const form = useForm<AstrologerEditorValues>({ resolver: zodResolver(astrologerEditorSchema), defaultValues: getAstrologerEditorDefaults(astrologer), mode: "onChange" });
  const { control, formState: { errors, isDirty, isValid }, getValues, handleSubmit, register, setValue, watch } = form;
  const bio = useFieldArray({ control, name: "bio" });
  const guidanceAreas = useFieldArray({ control, name: "guidanceAreas" });
  const pricing = useFieldArray({ control, name: "consultationPricing" });
  const values = watch();
  const { activeId, scrollToSection } = useAdminScrollSpy(sectionIds);
  const expertiseLabel = expertiseOptions.find((option) => option.value === values.expertiseKey)?.label ?? "Choose expertise";

  const previewSrc = avatar.previewUrl ?? values.avatarSrc;
  const profileCompleteness = useMemo(() => getAstrologerProfileCompleteness({
    ...astrologer,
    name: values.name,
    initials: initialFallback(values.name),
    avatarSrc: values.avatarSrc,
    primaryExpertise: expertiseLabel,
    expertiseKey: values.expertiseKey,
    specialties: values.specialties,
    languages: values.languages,
    detail: {
      ...(astrologer.detail ?? { relatedSlugs: [] }),
      role: values.role,
      intro: values.intro,
      bio: values.bio.map((paragraph) => paragraph.text),
      guidanceAreas: values.guidanceAreas,
      approachFocus: values.approachFocus,
      consultationModes: values.consultationModes,
      relatedSlugs: astrologer.detail?.relatedSlugs ?? [],
    },
  }), [astrologer, expertiseLabel, values]);

  function addSpecialty() {
    const specialty = specialtyInput.trim();
    if (!specialty || values.specialties.some((value) => value.toLowerCase() === specialty.toLowerCase())) return;
    setValue("specialties", [...values.specialties, specialty], { shouldDirty: true, shouldValidate: true });
    setSpecialtyInput("");
  }

  function toggleLanguage(language: string) {
    const current = getValues("languages");
    const selected = current.includes(language) ? current.filter((item) => item !== language) : [...current, language];
    setValue("languages", selected, { shouldDirty: true, shouldValidate: true });
  }

  function toggleConsultationMode(mode: ConsultationMode) {
    const current = getValues("consultationModes");
    const modes = current.includes(mode) ? current.filter((item) => item !== mode) : [...current, mode];
    setValue("consultationModes", modes, { shouldDirty: true, shouldValidate: true });
    const retained = getValues("consultationPricing").filter((item) => modes.includes(item.mode));
    const missing = modes.filter((item) => !retained.some((pricingItem) => pricingItem.mode === item)).map((item) => ({ mode: item, priceInRupees: "", durationMinutes: "" }));
    pricing.replace([...retained, ...missing]);
  }

  function onSubmit(formValues: AstrologerEditorValues) {
    toAstrologerEditorPayload(formValues, avatar.file);
    setApiBoundaryMessage("Saving astrologer changes requires the Admin API.");
  }

  function cancel() {
    if (isDirty) setShowDiscard(true);
    else router.push(`/admin/astrologers/${astrologer.slug}`);
  }

  return (
    <form noValidate onSubmit={handleSubmit(onSubmit)} className="w-full max-w-[1240px] space-y-4">
      <header className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-3"><h1 className="truncate font-sans text-xl font-semibold tracking-tight text-foreground">Edit Astrologer</h1></div>
        <div className="flex items-center gap-2"><Button type="button" variant="outline" size="sm" onClick={cancel}>Cancel</Button><Button type="submit" size="sm" disabled={!isDirty || !isValid}>Save changes</Button></div>
      </header>

      {apiBoundaryMessage ? <Card className="border-warning/30 shadow-sm"><CardContent className="p-4 text-sm text-foreground">{apiBoundaryMessage}</CardContent></Card> : null}

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_14rem]">
        <div className="min-w-0 space-y-4">
          <Section id="identity" title="Identity">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <Avatar className="size-11"><AvatarImage src={previewSrc} alt={values.name || "Astrologer avatar"} /><AvatarFallback>{initialFallback(values.name)}</AvatarFallback></Avatar>
              <div className="flex flex-wrap items-center gap-2"><Button type="button" variant="outline" size="sm" onClick={avatar.openPicker}><ImageUp aria-hidden="true" />Upload image</Button>{avatar.hasLocalFile ? <Button type="button" variant="ghost" size="sm" onClick={avatar.clear}><X aria-hidden="true" />Remove local image</Button> : null}</div>
              <input ref={avatar.inputRef} type="file" accept="image/*" aria-label="Upload avatar image" className="sr-only" onChange={avatar.handleInputChange} />
            </div>
            <FieldError message={avatar.error ?? undefined} />
            <div className="grid gap-3 sm:grid-cols-2"><div className="grid gap-1 sm:col-span-2"><Label htmlFor="name">Name</Label><Input id="name" aria-invalid={Boolean(errors.name)} {...register("name")} /><FieldError message={errors.name?.message} /></div><div className="grid gap-1 sm:col-span-2"><Label htmlFor="avatarSrc">Image URL</Label><Input id="avatarSrc" placeholder="https://example.com/avatar.jpg" aria-invalid={Boolean(errors.avatarSrc)} {...register("avatarSrc")} /><FieldError message={errors.avatarSrc?.message} /></div><div className="grid gap-1"><Label htmlFor="role">Role</Label><Input id="role" aria-invalid={Boolean(errors.role)} {...register("role")} /><FieldError message={errors.role?.message} /></div><div className="grid gap-1"><Label>Slug</Label><Input value={astrologer.slug} readOnly aria-label="Slug" /></div></div>
          </Section>

          <Section id="expertise" title="Expertise">
            <div className="grid gap-1.5"><Label>Primary expertise</Label><Select value={values.expertiseKey} onValueChange={(value) => setValue("expertiseKey", value, { shouldDirty: true, shouldValidate: true })}><SelectTrigger aria-label="Primary expertise"><SelectValue>{expertiseLabel}</SelectValue></SelectTrigger><SelectContent>{expertiseOptions.filter((option) => option.value !== "all").map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select><FieldError message={errors.expertiseKey?.message} /></div>
            <div className="grid gap-1.5"><Label htmlFor="specialty">Specialties</Label><div className="flex gap-2"><Input id="specialty" value={specialtyInput} onChange={(event) => setSpecialtyInput(event.target.value)} onKeyDown={(event) => { if (event.key === "Enter") { event.preventDefault(); addSpecialty(); } }} /><Button type="button" variant="outline" size="sm" onClick={addSpecialty}><Plus aria-hidden="true" />Add</Button></div><div className="flex flex-wrap gap-2">{values.specialties.map((specialty, index) => <Badge key={specialty} variant="outline" className="gap-1"><span>{specialty}</span><button type="button" aria-label={`Remove ${specialty}`} className="rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" onClick={() => setValue("specialties", values.specialties.filter((_, itemIndex) => itemIndex !== index), { shouldDirty: true, shouldValidate: true })}><X className="size-3" aria-hidden="true" /></button></Badge>)}</div><FieldError message={errors.specialties?.message} /></div>
            <div className="grid gap-2"><Label>Guidance areas</Label>{guidanceAreas.fields.map((field, index) => <div key={field.id} className="grid gap-2 border-b border-border pb-3 sm:grid-cols-[minmax(0,0.8fr)_minmax(0,1.6fr)_auto]"><Input aria-label={`Guidance area ${index + 1} title`} {...register(`guidanceAreas.${index}.title`)} /><Input aria-label={`Guidance area ${index + 1} description`} {...register(`guidanceAreas.${index}.description`)} /><Button type="button" variant="ghost" size="sm" className="size-9 p-0 text-muted-foreground hover:text-destructive" aria-label={`Remove guidance area ${index + 1}`} onClick={() => guidanceAreas.remove(index)}><Trash2 aria-hidden="true" /></Button><FieldError message={errors.guidanceAreas?.[index]?.title?.message ?? errors.guidanceAreas?.[index]?.description?.message} /></div>)}<Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => guidanceAreas.append({ title: "", description: "" })}><Plus aria-hidden="true" />Add guidance area</Button></div>
          </Section>

          <Section id="profile-content" title="Profile content"><p className="text-xs text-muted-foreground">Keep guidance reflective and avoid guaranteed outcomes.</p><div className="grid gap-1.5"><Label htmlFor="intro">Intro</Label><Textarea id="intro" aria-invalid={Boolean(errors.intro)} {...register("intro")} /><FieldError message={errors.intro?.message} /></div><div className="grid gap-2"><Label>Bio paragraphs</Label>{bio.fields.map((field, index) => <div key={field.id} className="grid gap-2"><div className="flex gap-2"><Textarea aria-label={`Bio paragraph ${index + 1}`} {...register(`bio.${index}.text`)} /><Button type="button" variant="ghost" size="sm" className="size-9 shrink-0 p-0 text-muted-foreground hover:text-destructive" aria-label={`Remove bio paragraph ${index + 1}`} onClick={() => bio.remove(index)}><Trash2 aria-hidden="true" /></Button></div><FieldError message={errors.bio?.[index]?.text?.message} /></div>)}<Button type="button" variant="outline" size="sm" className="w-fit" onClick={() => bio.append({ text: "" })}><Plus aria-hidden="true" />Add paragraph</Button></div><div className="grid gap-1.5"><Label htmlFor="approachFocus">Approach focus</Label><Textarea id="approachFocus" aria-invalid={Boolean(errors.approachFocus)} {...register("approachFocus")} /><FieldError message={errors.approachFocus?.message} /></div></Section>

          <Section id="languages-consultation" title="Languages & consultation"><div className="grid gap-4 sm:grid-cols-2"><div className="grid gap-2"><Label>Languages</Label>{languageOptions.filter((option) => option.value !== "all").map((option) => { const id = `language-${option.value}`; return <div key={option.value} className="flex items-center gap-2"><Checkbox id={id} checked={values.languages.some((language) => language.toLowerCase() === option.value)} onCheckedChange={() => toggleLanguage(option.label)} /><Label htmlFor={id} className="font-normal leading-5">{option.label}</Label></div>; })}<FieldError message={errors.languages?.message} /></div><div className="grid gap-2"><Label>Consultation modes</Label>{consultationModes.map((mode) => { const id = `consultation-mode-${mode.toLowerCase()}`; return <div key={mode} className="flex items-center gap-2"><Checkbox id={id} checked={values.consultationModes.includes(mode)} onCheckedChange={() => toggleConsultationMode(mode)} /><Label htmlFor={id} className="font-normal leading-5">{mode}</Label></div>; })}<FieldError message={errors.consultationModes?.message} /></div></div></Section>

          <Section id="experience-pricing" title="Experience & pricing"><div className="grid gap-1.5"><Label htmlFor="experienceYears">Experience</Label><Input id="experienceYears" type="number" min="0" max="80" placeholder="Years" aria-invalid={Boolean(errors.experienceYears)} {...register("experienceYears")} /><FieldError message={errors.experienceYears?.message} /></div><div className="grid gap-2"><Label>Consultation pricing</Label>{pricing.fields.map((field, index) => { const modeId = field.mode.toLowerCase(); return <div key={field.id} className="grid gap-2 border-b border-border pb-3 sm:grid-cols-[minmax(0,0.7fr)_minmax(0,1fr)_minmax(0,1fr)]"><div className="min-w-0 text-sm font-medium text-foreground">{field.mode}</div><div className="grid min-w-0 gap-1"><Label htmlFor={`price-${modeId}`} className="text-xs text-muted-foreground">Price (INR)</Label><Input id={`price-${modeId}`} inputMode="decimal" placeholder="Not configured" {...register(`consultationPricing.${index}.priceInRupees`)} /><FieldError message={errors.consultationPricing?.[index]?.priceInRupees?.message} /></div><div className="grid min-w-0 gap-1"><Label htmlFor={`duration-${modeId}`} className="text-xs text-muted-foreground">Duration (min)</Label><Input id={`duration-${modeId}`} inputMode="numeric" placeholder="Optional" {...register(`consultationPricing.${index}.durationMinutes`)} /><FieldError message={errors.consultationPricing?.[index]?.durationMinutes?.message} /></div></div>; })}</div></Section>

          <Section id="availability-management" title="Availability & management"><div className="grid gap-1.5"><Label>Booking availability</Label><Select value={values.availability} onValueChange={(value) => setValue("availability", value as AstrologerEditorValues["availability"], { shouldDirty: true, shouldValidate: true })}><SelectTrigger aria-label="Booking availability"><SelectValue>{availabilityOptions.find((option) => option.value === values.availability)?.label}</SelectValue></SelectTrigger><SelectContent>{availabilityOptions.filter((option) => option.value !== "all").map((option) => <SelectItem key={option.value} value={option.value}>{option.label}</SelectItem>)}</SelectContent></Select></div><div className="grid gap-1.5"><Label>Management status</Label><Select value={values.managementStatus} onValueChange={(value) => setValue("managementStatus", value as AstrologerEditorValues["managementStatus"], { shouldDirty: true, shouldValidate: true })}><SelectTrigger aria-label="Management status"><SelectValue>{values.managementStatus === "not-configured" ? "Not configured" : values.managementStatus[0].toUpperCase() + values.managementStatus.slice(1)}</SelectValue></SelectTrigger><SelectContent>{managementStatusFormValues.map((status) => <SelectItem key={status} value={status}>{status === "not-configured" ? "Not configured" : status[0].toUpperCase() + status.slice(1)}</SelectItem>)}</SelectContent></Select></div><div className="divide-y divide-border"><div className="flex justify-between gap-4 py-2 text-sm"><span className="text-muted-foreground">Verification</span><span>{astrologer.management?.verificationStatus ?? "\u2014"}</span></div><div className="flex justify-between gap-4 py-2 text-sm"><span className="text-muted-foreground">Live availability</span><span>Not connected</span></div></div></Section>

          <Section id="review" title="Review"><div className="grid gap-3 text-sm sm:grid-cols-2"><div><p className="text-muted-foreground">Identity</p><p className="font-medium">{values.name || "\u2014"}</p></div><div><p className="text-muted-foreground">Primary expertise</p><p className="font-medium">{expertiseLabel}</p></div><div><p className="text-muted-foreground">Languages</p><p className="font-medium">{values.languages.join(", ") || "\u2014"}</p></div><div><p className="text-muted-foreground">Consultation modes</p><p className="font-medium">{values.consultationModes.join(", ") || "\u2014"}</p></div><div><p className="text-muted-foreground">Booking availability</p><p className="font-medium">{availabilityOptions.find((option) => option.value === values.availability)?.label}</p></div><div><p className="text-muted-foreground">Management status</p><p className="font-medium">{values.managementStatus === "not-configured" ? "Not configured" : values.managementStatus}</p></div><div><p className="text-muted-foreground">Experience</p><p className="font-medium">{values.experienceYears === "" ? "\u2014" : formatAstrologerExperience(Number(values.experienceYears))}</p></div><div><p className="text-muted-foreground">Configured pricing modes</p><p className="font-medium">{values.consultationPricing.filter((item) => item.priceInRupees).map((item) => item.mode).join(", ") || "\u2014"}</p></div></div></Section>
        </div>
        <AdminDetailStickyRail className="order-first xl:order-none"><div className="hidden xl:block"><Card className="shadow-sm"><CardContent className="p-2"><AdminEditorSectionNav sections={sections} activeId={activeId} onNavigate={scrollToSection} /></CardContent></Card></div><Card className="shadow-sm"><CardContent className="space-y-1.5 p-3 text-sm"><p className="text-xs text-muted-foreground">Profile completeness</p><p className="font-semibold text-foreground">{profileCompleteness.percentage}%</p><p className="text-xs text-muted-foreground">{profileCompleteness.completed} of {profileCompleteness.total} fields</p></CardContent></Card></AdminDetailStickyRail>
      </div>

      <AlertDialog open={showDiscard} onOpenChange={setShowDiscard}><AlertDialogContent><AlertDialogHeader><AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle><AlertDialogDescription>Your local changes will be lost.</AlertDialogDescription></AlertDialogHeader><AlertDialogFooter><AlertDialogCancel className="whitespace-nowrap">Continue editing</AlertDialogCancel><AlertDialogAction className="whitespace-nowrap" onClick={() => router.push(`/admin/astrologers/${astrologer.slug}`)}>Discard changes</AlertDialogAction></AlertDialogFooter></AlertDialogContent></AlertDialog>
    </form>
  );
}
