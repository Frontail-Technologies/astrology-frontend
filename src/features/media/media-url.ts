import { resolveMediaUrl } from "./media-constraints";

const API_URL = (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:4000").replace(/\/$/, "");
const MEDIA_PREFIX = process.env.NEXT_PUBLIC_MEDIA_PATH ?? "/uploads";

/**
 * Display URL for a stored image (`/uploads/...` from the API, a frontend `/path`, or an http(s) URL).
 * Returns `null` for empty or unsafe values. Use it for `<img src>` only; always store/emit the original value.
 */
export function mediaDisplayUrl(value: string | null | undefined): string | null {
  return resolveMediaUrl(value, API_URL, MEDIA_PREFIX);
}
