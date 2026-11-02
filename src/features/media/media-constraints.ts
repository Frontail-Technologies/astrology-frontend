/**
 * Client-side image constraints for Admin uploads, plus URL rules for images typed or pasted by an admin.
 * Pure module (no framework imports, no `@/` aliases) so it runs under `node --test`.
 *
 * The API re-validates every upload (`POST /admin/media/images`: JPEG/PNG/WebP, `MAX_IMAGE_UPLOAD_BYTES`, default
 * 10 MB) and re-encodes to WebP; the client limit is stricter (5 MB) so obviously bad files fail before the request.
 */
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
/** `accept` attribute for file inputs. */
export const ACCEPTED_IMAGE_ACCEPT = ACCEPTED_IMAGE_TYPES.join(",");
export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TOO_LARGE_MESSAGE = "Choose an image smaller than 5 MB.";
export const IMAGE_TYPE_MESSAGE = "Use a JPEG, PNG or WebP image.";
export const IMAGE_URL_MESSAGE = "Use a path starting with / or an http(s) URL.";

/** Returns a user-facing message when the file cannot be uploaded, otherwise `null`. */
export function validateImageFile(file: { type: string; size: number }): string | null {
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) return IMAGE_TYPE_MESSAGE;
  if (file.size > MAX_IMAGE_BYTES) return IMAGE_TOO_LARGE_MESSAGE;
  return null;
}

/**
 * Normalizes a typed/pasted image URL. Accepts only a root-relative path (`/uploads/a.webp`, not `//host`) or an
 * absolute `http(s)` URL; everything else (`blob:`, `data:`, `javascript:`, relative paths, whitespace inside)
 * returns `null`.
 */
export function normalizeImageUrlInput(input: string): string | null {
  const text = input.trim();
  if (!text || /\s/.test(text)) return null;
  if (text.startsWith("/")) return text.startsWith("//") || text.includes("\\") ? null : text;
  try {
    const url = new URL(text);
    return url.protocol === "http:" || url.protocol === "https:" ? url.toString() : null;
  } catch {
    return null;
  }
}

/** True for a value the Admin image fields may store or emit (never `blob:`/`data:`). */
export function isStorableImageUrl(value: string | null | undefined): value is string {
  return typeof value === "string" && normalizeImageUrlInput(value) !== null;
}

/**
 * URL to render for a stored image. The API stores uploads as root-relative paths under its public media prefix
 * (default `/uploads`), served by the API origin, so those are prefixed with `apiBase`. Other root-relative paths
 * are frontend assets and absolute URLs pass through. Invalid values give `null`.
 */
export function resolveMediaUrl(value: string | null | undefined, apiBase: string, mediaPrefix = "/uploads"): string | null {
  if (!isStorableImageUrl(value)) return null;
  const prefix = mediaPrefix.replace(/\/$/, "");
  if (value === prefix || value.startsWith(`${prefix}/`)) return `${apiBase.replace(/\/$/, "")}${value}`;
  return value;
}
