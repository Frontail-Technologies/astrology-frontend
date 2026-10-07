import { z } from "zod";

import { expertiseOptions } from "@/features/astrologers/data/astrologers";
import type {
  AstrologerAvailability,
  AstrologerGuidanceArea,
  AstrologerListItem,
  AstrologerManagementStatus,
  ConsultationMode,
} from "@/features/astrologers/types/astrologer";

export const consultationModes: ConsultationMode[] = ["Chat", "Voice", "Video"];
export const managementStatusValues: AstrologerManagementStatus[] = ["draft", "active", "suspended", "archived"];
export const managementStatusFormValues = ["not-configured", ...managementStatusValues] as const;

const trimmedRequired = (message: string) => z.string().trim().min(1, { error: message });
const optionalText = z.string().trim();
const amountPattern = /^\d+(\.\d{1,2})?$/;
const integerPattern = /^\d+$/;

export const astrologerEditorSchema = z.object({
  name: trimmedRequired("Enter a name.").min(2, { error: "Enter at least 2 characters." }),
  avatarSrc: trimmedRequired("Provide an avatar URL or image.").refine(
    (value) => value.startsWith("/") || /^https?:\/\//i.test(value),
    { error: "Use an image URL or an application asset path." },
  ),
  role: trimmedRequired("Enter a role."),
  expertiseKey: trimmedRequired("Choose a primary expertise.").refine(
    (value) => expertiseOptions.some((option) => option.value === value && option.value !== "all"),
    { error: "Choose a primary expertise." },
  ),
  specialties: z.array(trimmedRequired("Specialties cannot be empty.")).min(1, { error: "Add at least one specialty." }),
  guidanceAreas: z.array(z.object({ title: trimmedRequired("Enter a guidance area title."), description: trimmedRequired("Enter a guidance area description.") })).min(1, { error: "Add at least one guidance area." }),
  intro: trimmedRequired("Enter an introduction."),
  bio: z.array(z.object({ text: trimmedRequired("Bio paragraphs cannot be empty.") })).min(1, { error: "Add at least one bio paragraph." }),
  approachFocus: trimmedRequired("Enter an approach focus."),
  languages: z.array(trimmedRequired("Choose at least one language.")).min(1, { error: "Choose at least one language." }),
  consultationModes: z.array(z.enum(["Chat", "Voice", "Video"])).min(1, { error: "Choose at least one consultation mode." }),
  availability: z.enum(["bookable", "soon"]),
  experienceYears: z.string().trim().refine((value) => value === "" || (integerPattern.test(value) && Number(value) <= 80), { error: "Use a whole number from 0 to 80." }),
  consultationPricing: z.array(z.object({
    mode: z.enum(["Chat", "Voice", "Video"]),
    priceInRupees: z.string().trim().refine((value) => value === "" || amountPattern.test(value), { error: "Use a valid INR amount." }),
    durationMinutes: z.string().trim().refine((value) => value === "" || (integerPattern.test(value) && Number(value) > 0), { error: "Use whole minutes greater than 0." }),
  })),
  managementStatus: z.enum(managementStatusFormValues),
});

export type AstrologerEditorValues = z.infer<typeof astrologerEditorSchema>;

export type AstrologerEditorPayload = {
  profile: {
    name: string;
    initials: string;
    avatarSrc: string;
    primaryExpertise: string;
    expertiseKey: string;
    specialties: string[];
    languages: string[];
    availability: AstrologerAvailability;
    experienceYears?: number;
    consultationPricing?: Array<{ mode: ConsultationMode; priceInPaise: number; durationMinutes?: number; currency: "INR" }>;
    managementStatus?: AstrologerManagementStatus;
  };
  detail: { role: string; intro: string; bio: string[]; guidanceAreas: AstrologerGuidanceArea[]; approachFocus: string; consultationModes: ConsultationMode[] };
  avatarUpload?: File;
};

export function deriveInitials(name: string): string {
  return name.trim().split(/\s+/).filter(Boolean).slice(0, 2).map((part) => part[0]?.toUpperCase()).join("");
}

export function getAstrologerEditorDefaults(astrologer: AstrologerListItem): AstrologerEditorValues {
  const detail = astrologer.detail;
  const consultationModes = detail?.consultationModes ?? [];
  return {
    name: astrologer.name,
    avatarSrc: astrologer.avatarSrc,
    role: detail?.role ?? "",
    expertiseKey: astrologer.expertiseKey,
    specialties: astrologer.specialties,
    guidanceAreas: detail?.guidanceAreas ?? [],
    intro: detail?.intro ?? "",
    bio: (detail?.bio ?? []).map((text) => ({ text })),
    approachFocus: detail?.approachFocus ?? "",
    languages: astrologer.languages,
    consultationModes,
    availability: astrologer.availability,
    experienceYears: astrologer.experienceYears?.toString() ?? "",
    consultationPricing: consultationModes.map((mode) => {
      const pricing = astrologer.consultationPricing?.find((item) => item.mode === mode);
      return { mode, priceInRupees: pricing ? (pricing.priceInPaise / 100).toString() : "", durationMinutes: pricing?.durationMinutes?.toString() ?? "" };
    }),
    managementStatus: astrologer.management?.managementStatus ?? "not-configured",
  };
}

export function toAstrologerEditorPayload(values: AstrologerEditorValues, avatarUpload?: File): AstrologerEditorPayload {
  const expertise = expertiseOptions.find((option) => option.value === values.expertiseKey);
  if (!expertise || expertise.value === "all") throw new Error("Invalid expertise selection.");
  const pricing = values.consultationPricing
    .filter((item) => values.consultationModes.includes(item.mode) && item.priceInRupees !== "")
    .map((item) => ({
      mode: item.mode,
      priceInPaise: Math.round(Number(item.priceInRupees) * 100),
      durationMinutes: item.durationMinutes === "" ? undefined : Number(item.durationMinutes),
      currency: "INR" as const,
    }));

  return {
    profile: {
      name: values.name.trim(),
      initials: deriveInitials(values.name),
      avatarSrc: values.avatarSrc.trim(),
      primaryExpertise: expertise.label,
      expertiseKey: values.expertiseKey,
      specialties: values.specialties.map((value) => value.trim()).filter(Boolean),
      languages: values.languages,
      availability: values.availability,
      experienceYears: values.experienceYears === "" ? undefined : Number(values.experienceYears),
      consultationPricing: pricing.length ? pricing : undefined,
      managementStatus: values.managementStatus === "not-configured" ? undefined : values.managementStatus,
    },
    detail: {
      role: values.role.trim(),
      intro: values.intro.trim(),
      bio: values.bio.map((value) => value.text.trim()).filter(Boolean),
      guidanceAreas: values.guidanceAreas.map((area) => ({ title: area.title.trim(), description: area.description.trim() })).filter((area) => area.title && area.description),
      approachFocus: values.approachFocus.trim(),
      consultationModes: values.consultationModes,
    },
    avatarUpload,
  };
}

