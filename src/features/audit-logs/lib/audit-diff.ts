/**
 * Before/after comparison for audit entries. Pure (no React, no `@/` aliases) so it runs under `node --test`.
 *
 * `before`/`after` are arbitrary JSON from the server (usually whole records, sometimes null or a scalar). Objects
 * are compared key by key at the top level; nested values are compared structurally (key order ignored).
 */
export type AuditChangeKind = "added" | "removed" | "changed" | "unchanged";

export type AuditDiffRow = { key: string; before: unknown; after: unknown; kind: AuditChangeKind };

const MISSING = undefined;

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

/** JSON with object keys sorted, so `{a,b}` and `{b,a}` compare equal. */
export function stableStringify(value: unknown): string {
  if (value === undefined) return "undefined";
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (isPlainObject(value)) {
    return `{${Object.keys(value)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`)
      .join(",")}}`;
  }
  return JSON.stringify(value);
}

export function auditValuesEqual(a: unknown, b: unknown): boolean {
  return stableStringify(a) === stableStringify(b);
}

function kindOf(before: unknown, after: unknown, hasBefore: boolean, hasAfter: boolean): AuditChangeKind {
  if (!hasBefore && hasAfter) return "added";
  if (hasBefore && !hasAfter) return "removed";
  return auditValuesEqual(before, after) ? "unchanged" : "changed";
}

/**
 * One row per top-level field (union of both sides, in first-seen order: `before` keys, then new `after` keys).
 * Non-object sides (null, scalar, array) are compared as a single `value` row; a null/absent side marks every field
 * of the other side as added or removed.
 */
export function buildAuditDiff(before: unknown, after: unknown): AuditDiffRow[] {
  const beforeEmpty = before === null || before === undefined;
  const afterEmpty = after === null || after === undefined;
  if (beforeEmpty && afterEmpty) return [];

  const beforeObject = isPlainObject(before) ? before : null;
  const afterObject = isPlainObject(after) ? after : null;
  const objectLike = (beforeObject || beforeEmpty) && (afterObject || afterEmpty);
  if (!objectLike) {
    return [{ key: "value", before: beforeEmpty ? MISSING : before, after: afterEmpty ? MISSING : after, kind: kindOf(before, after, !beforeEmpty, !afterEmpty) }];
  }

  const keys = [...new Set([...Object.keys(beforeObject ?? {}), ...Object.keys(afterObject ?? {})])];
  return keys.map((key) => {
    const hasBefore = Boolean(beforeObject && Object.prototype.hasOwnProperty.call(beforeObject, key));
    const hasAfter = Boolean(afterObject && Object.prototype.hasOwnProperty.call(afterObject, key));
    const left = hasBefore ? beforeObject![key] : MISSING;
    const right = hasAfter ? afterObject![key] : MISSING;
    return { key, before: left, after: right, kind: kindOf(left, right, hasBefore, hasAfter) };
  });
}

/** Rows to show: changes only, or everything. Changed rows keep their original order. */
export function visibleAuditRows(rows: AuditDiffRow[], showUnchanged: boolean): AuditDiffRow[] {
  return showUnchanged ? rows : rows.filter((row) => row.kind !== "unchanged");
}

/** Compact display text for a JSON value ("—" for absent, `null` spelled out). */
export function formatAuditValue(value: unknown): string {
  if (value === undefined) return "—";
  if (value === null) return "null";
  if (typeof value === "string") return value === "" ? '""' : value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

/** Top-level metadata entries for display; non-object metadata becomes a single `value` entry. */
export function auditMetadataEntries(metadata: unknown): [string, string][] {
  if (metadata === null || metadata === undefined) return [];
  if (isPlainObject(metadata)) return Object.entries(metadata).map(([key, value]) => [key, formatAuditValue(value)]);
  return [["value", formatAuditValue(metadata)]];
}
