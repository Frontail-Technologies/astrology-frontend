/** Server-computed placeholders (`{{customer_name}}`), read-only. */
export function TemplateVariables({ variables, emptyText = "No {{placeholders}} in this template." }: { variables: readonly string[]; emptyText?: string }) {
  if (!variables.length) return <p className="text-xs text-muted-foreground">{emptyText}</p>;
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label="Template variables">
      {variables.map((variable) => (
        <li key={variable} className="rounded border border-border bg-surface-muted px-1.5 py-0.5 font-mono text-xs">
          {variable}
        </li>
      ))}
    </ul>
  );
}
