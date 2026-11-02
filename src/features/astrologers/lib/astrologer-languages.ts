/**
 * Language list helpers for the astrologer profile editor. The API stores language names as strings: each 2–60
 * characters, 1–20 items, unique ignoring case (`astrologer.validation.ts`). These helpers keep the editor's chip
 * list inside those rules so typos and duplicates never reach the server.
 */
export const LANGUAGE_MIN_LENGTH = 2;
export const LANGUAGE_MAX_LENGTH = 60;
export const LANGUAGES_MAX = 20;

const normalise = (value: string) => value.trim().replace(/\s+/g, " ");

/** True when `value` (trimmed) is already in `languages`, ignoring case. */
export function hasLanguage(languages: readonly string[], value: string) {
  const key = normalise(value).toLowerCase();
  return languages.some((language) => language.toLowerCase() === key);
}

/** Why `value` cannot be added, or `null` when it can. */
export function languageAddError(languages: readonly string[], value: string): string | null {
  const name = normalise(value);
  if (name.length < LANGUAGE_MIN_LENGTH) return `Language names need at least ${LANGUAGE_MIN_LENGTH} characters.`;
  if (name.length > LANGUAGE_MAX_LENGTH) return `Language names can be at most ${LANGUAGE_MAX_LENGTH} characters.`;
  if (hasLanguage(languages, name)) return `${name} is already added.`;
  if (languages.length >= LANGUAGES_MAX) return `Up to ${LANGUAGES_MAX} languages can be added.`;
  return null;
}

/** Adds `value` (trimmed, single-spaced) when allowed; otherwise returns the list unchanged. */
export function addLanguage(languages: readonly string[], value: string): string[] {
  return languageAddError(languages, value) ? [...languages] : [...languages, normalise(value)];
}

export function removeLanguage(languages: readonly string[], value: string): string[] {
  return languages.filter((language) => language !== value);
}

/** Validation for the whole list before saving (`null` when valid). */
export function languageListError(languages: readonly string[]): string | null {
  if (languages.length === 0) return "Add at least one language.";
  if (languages.length > LANGUAGES_MAX) return `Up to ${LANGUAGES_MAX} languages can be added.`;
  return null;
}
