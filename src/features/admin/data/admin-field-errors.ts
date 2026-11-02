/**
 * Maps normalized server field errors (`AdminError.fieldErrors`) onto form field paths. Pure (no React, no `@/`
 * aliases) so it runs under `node --test`; `useAdminForm` applies the result with react-hook-form's `setError`.
 *
 * Server paths come from Zod issues. `normalizeAdminError` already drops the `body`/`query`/`params` segment and
 * joins the rest with dots (`["body", "content", "overview", 0]` -> `"content.overview.0"`); this module also
 * accepts raw `body.name` / `items[0].alt` spellings.
 */
import type { AdminFieldError } from "./admin-errors.ts";

export type MappedFieldError = { name: string; message: string };
export type AdminFieldErrorMapping = {
  /** Errors whose path (or nearest parent path) is a form field. First message per field wins. */
  fields: MappedFieldError[];
  /** Messages that do not belong to any known field (empty path, or a path outside the form). */
  formMessages: string[];
};

const ROOT_SEGMENTS = new Set(["body", "query", "params"]);

/** `"body.items[0].alt"` -> `"items.0.alt"`; empty segments are removed. */
export function normalizeFieldPath(path: string): string {
  const segments = path
    .replace(/\[(\w+)\]/g, ".$1")
    .split(".")
    .filter(Boolean);
  if (segments.length && ROOT_SEGMENTS.has(segments[0])) segments.shift();
  return segments.join(".");
}

/**
 * Resolves each error to the deepest path accepted by `isField` (the full path, then each parent: `a.b.0` ->
 * `a.b` -> `a`). Unresolved errors go to `formMessages`. Without `isField`, every non-empty path is kept as-is
 * and `fieldAliases` can rename server paths (`{ categoryIds: "categories" }`).
 */
export function mapAdminFieldErrors(
  errors: readonly AdminFieldError[],
  options: { isField?: (path: string) => boolean; fieldAliases?: Record<string, string> } = {},
): AdminFieldErrorMapping {
  const fields: MappedFieldError[] = [];
  const formMessages: string[] = [];
  const seen = new Set<string>();
  for (const error of errors) {
    const normalized = normalizeFieldPath(error.path);
    const target = normalized ? resolveFieldPath(normalized, options) : null;
    if (!target) {
      if (!formMessages.includes(error.message)) formMessages.push(error.message);
      continue;
    }
    if (seen.has(target)) continue;
    seen.add(target);
    fields.push({ name: target, message: error.message });
  }
  return { fields, formMessages };
}

function resolveFieldPath(path: string, options: { isField?: (path: string) => boolean; fieldAliases?: Record<string, string> }): string | null {
  const segments = path.split(".");
  const prefixes = segments.map((_, index) => segments.slice(0, segments.length - index).join("."));
  const aliased = prefixes.find((candidate) => options.fieldAliases?.[candidate]);
  if (aliased) return options.fieldAliases![aliased];
  if (!options.isField) return path;
  return prefixes.find((candidate) => options.isField!(candidate)) ?? null;
}

/** True when `path` (dot notation, numeric array indexes) exists in `values`, including `null`/`""` leaves. */
export function hasValuePath(values: unknown, path: string): boolean {
  let current: unknown = values;
  for (const segment of path.split(".")) {
    if (current === null || typeof current !== "object") return false;
    if (!Object.prototype.hasOwnProperty.call(current, segment)) return false;
    current = (current as Record<string, unknown>)[segment];
  }
  return current !== undefined;
}
