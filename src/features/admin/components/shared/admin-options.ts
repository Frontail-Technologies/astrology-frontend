/** Option for admin selects and comboboxes. `value` is the stable machine key; `label` is what people read. */
export type AdminOption = { value: string; label: string; description?: string; disabled?: boolean };

/** Either an option list or a `{ value: label }` map (the shape domain `*Labels` constants already use). */
export type AdminOptionsInput = readonly AdminOption[] | Readonly<Record<string, string>>;

export function toAdminOptions(input: AdminOptionsInput): AdminOption[] {
  if (Array.isArray(input)) return [...(input as readonly AdminOption[])];
  return Object.entries(input as Record<string, string>).map(([value, label]) => ({ value, label }));
}

/** Options from distinct strings (for example values already used in data), labelled as written. */
export function optionsFromValues(values: Iterable<string | null | undefined>): AdminOption[] {
  const seen = new Set<string>();
  for (const value of values) {
    const trimmed = value?.trim();
    if (trimmed) seen.add(trimmed);
  }
  return [...seen].sort((a, b) => a.localeCompare(b)).map((value) => ({ value, label: value }));
}
