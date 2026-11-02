/**
 * Helpers for rendering server-provided `allowedTransitions` (see ADMIN_DATA_LAYER.md, "Server-provided
 * transitions"). The frontend never keeps its own state machine: these helpers only label, style and order the
 * statuses the server returned. Pure (no React, no `@/` aliases) so it runs under `node --test`.
 */
export type AdminTransitionVariant = "default" | "outline" | "destructive" | "conversion" | "ghost";

export type AdminTransitionConfig<S extends string> = {
  /** Button label per target status, for example `{ cancelled: "Cancel order" }`. Missing labels fall back to the status. */
  labels: Partial<Record<S, string>>;
  /** Button style per target (default `outline`). `destructive` also makes the confirm dialog destructive. */
  variants?: Partial<Record<S, AdminTransitionVariant>>;
  /** Confirm-dialog description per target. */
  descriptions?: Partial<Record<S, string>>;
  /** Targets that require an audited reason (or a predicate). */
  requiresReason?: readonly S[] | ((target: S) => boolean);
  /** Display order; targets not listed keep the server order after the listed ones. */
  order?: readonly S[];
};

export type AdminTransitionAction<S extends string> = {
  target: S;
  label: string;
  variant: AdminTransitionVariant;
  description?: string;
  requiresReason: boolean;
};

/** `in_progress` -> `In progress`. */
export function humanizeStatus(status: string): string {
  const text = status.replace(/[_-]+/g, " ").trim();
  return text ? text[0].toUpperCase() + text.slice(1).toLowerCase() : status;
}

/** Deduplicates, orders and decorates the server's allowed targets. Empty input means a final state. */
export function buildTransitionActions<S extends string>(
  allowed: readonly S[] | null | undefined,
  config: AdminTransitionConfig<S>,
): AdminTransitionAction<S>[] {
  const unique = [...new Set(allowed ?? [])];
  const rank = (target: S) => {
    const index = config.order?.indexOf(target) ?? -1;
    return index === -1 ? Number.MAX_SAFE_INTEGER : index;
  };
  const ordered = unique
    .map((target, index) => ({ target, index }))
    .sort((a, b) => rank(a.target) - rank(b.target) || a.index - b.index)
    .map(({ target }) => target);
  const needsReason = (target: S) =>
    typeof config.requiresReason === "function" ? config.requiresReason(target) : Boolean(config.requiresReason?.includes(target));
  return ordered.map((target) => ({
    target,
    label: config.labels[target] ?? humanizeStatus(target),
    variant: config.variants?.[target] ?? "outline",
    ...(config.descriptions?.[target] ? { description: config.descriptions[target] } : {}),
    requiresReason: needsReason(target),
  }));
}

/** True when the server lists no next status (terminal state). */
export function isFinalState(allowed: readonly string[] | null | undefined): boolean {
  return !allowed || allowed.length === 0;
}
