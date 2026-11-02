import { z } from "zod";

import { BANNER_LIMITS, BANNER_PLACEMENT_PATTERN } from "../constants/banner-status.ts";
import type { BannerInput, BannerLinkType, ManagedBanner } from "../types/banner-admin.ts";

/** Banner editor values. Optional text is `""` in the form and `null` in the API; `sortOrder` is the input text. */
export type BannerFormValues = {
  title: string;
  subtitle: string;
  imageUrl: string | null;
  mobileImageUrl: string | null;
  altText: string;
  placement: string;
  linkType: BannerLinkType;
  linkValue: string;
  startsAt: string | null;
  endsAt: string | null;
  sortOrder: string;
};

export const emptyBannerForm: BannerFormValues = {
  title: "",
  subtitle: "",
  imageUrl: null,
  mobileImageUrl: null,
  altText: "",
  placement: "",
  linkType: "none",
  linkValue: "",
  startsAt: null,
  endsAt: null,
  sortOrder: "0",
};

export function isHttpUrl(value: string): boolean {
  try {
    return ["http:", "https:"].includes(new URL(value).protocol);
  } catch {
    return false;
  }
}

/** Same rule as the backend: a `/path` without `//`, whitespace, control characters, backslashes or dot segments. */
export function isSafeInternalPath(value: string): boolean {
  if (!value.startsWith("/") || value.startsWith("//") || /[\\\u0000-\u001f\u007f\s]/.test(value)) return false;
  try {
    const pathname = value.split(/[?#]/, 1)[0] ?? "";
    return !decodeURIComponent(pathname)
      .split("/")
      .some((segment) => segment === "." || segment === "..");
  } catch {
    return false;
  }
}

/** Message for an invalid link (`null` when valid). The value is trimmed first. */
export function bannerLinkError(linkType: BannerLinkType, linkValue: string): string | null {
  const value = linkValue.trim();
  if (linkType === "none") return null;
  if (!value) return linkType === "internal" ? "Enter a site path such as /pooja." : "Enter a full http(s) URL.";
  if (value.length > BANNER_LIMITS.link) return `Use at most ${BANNER_LIMITS.link} characters.`;
  if (linkType === "internal") return isSafeInternalPath(value) ? null : "Use a site path that starts with / (for example /pooja).";
  return isHttpUrl(value) ? null : "Use a full URL starting with http:// or https://.";
}

/** Message when the schedule window is reversed or empty (`null` when valid or open-ended). */
export function bannerWindowError(startsAt: string | null, endsAt: string | null): string | null {
  if (!startsAt || !endsAt) return null;
  return new Date(startsAt).getTime() < new Date(endsAt).getTime() ? null : "The end must be after the start.";
}

const optionalText = (max: number) => z.string().trim().max(max, { error: `Use at most ${max} characters.` });

export const bannerFormSchema = z
  .object({
    title: z.string().trim().min(1, { error: "Enter a title." }).max(BANNER_LIMITS.title),
    subtitle: optionalText(BANNER_LIMITS.subtitle),
    imageUrl: z.string().nullable().refine((value) => Boolean(value), { error: "Add a banner image." }),
    mobileImageUrl: z.string().nullable(),
    altText: optionalText(BANNER_LIMITS.altText),
    placement: z
      .string()
      .trim()
      .min(BANNER_LIMITS.placement[0], { error: "Enter a placement key." })
      .max(BANNER_LIMITS.placement[1])
      .regex(BANNER_PLACEMENT_PATTERN, { error: "Lower-case letters, digits and underscores, starting with a letter." }),
    linkType: z.enum(["none", "internal", "external"]),
    linkValue: z.string(),
    startsAt: z.string().nullable(),
    endsAt: z.string().nullable(),
    sortOrder: z.string().trim().regex(/^\d{1,6}$/, { error: "Enter a whole number." }).refine((value) => Number(value) <= BANNER_LIMITS.sortOrder, { error: `At most ${BANNER_LIMITS.sortOrder}.` }),
  })
  .superRefine((values, context) => {
    const linkError = bannerLinkError(values.linkType, values.linkValue);
    if (linkError) context.addIssue({ code: "custom", path: ["linkValue"], message: linkError });
    const windowError = bannerWindowError(values.startsAt, values.endsAt);
    if (windowError) context.addIssue({ code: "custom", path: ["endsAt"], message: windowError });
  });

export function bannerToFormValues(banner: ManagedBanner): BannerFormValues {
  return {
    title: banner.title,
    subtitle: banner.subtitle ?? "",
    imageUrl: banner.imageUrl,
    mobileImageUrl: banner.mobileImageUrl,
    altText: banner.altText ?? "",
    placement: banner.placement,
    linkType: banner.linkType,
    linkValue: banner.linkValue ?? "",
    startsAt: banner.startsAt,
    endsAt: banner.endsAt,
    sortOrder: String(banner.sortOrder),
  };
}

const textOrNull = (value: string) => value.trim() || null;

/** API body. `linkValue` is `null` for no-link banners, whatever the hidden input still holds. */
export function bannerFormToInput(values: BannerFormValues): BannerInput {
  return {
    title: values.title.trim(),
    subtitle: textOrNull(values.subtitle),
    imageUrl: values.imageUrl ?? "",
    mobileImageUrl: values.mobileImageUrl,
    altText: textOrNull(values.altText),
    placement: values.placement.trim(),
    linkType: values.linkType,
    linkValue: values.linkType === "none" ? null : values.linkValue.trim(),
    startsAt: values.startsAt,
    endsAt: values.endsAt,
    sortOrder: Number(values.sortOrder.trim()),
  };
}

