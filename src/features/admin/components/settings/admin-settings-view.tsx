"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSettings, useUpdateSetting } from "@/features/settings/hooks/use-settings-admin";
import { fromInput, settingGroupLabels, settingOptions, specFor, toInput } from "@/features/settings/lib/settings-fields";
import type { EffectiveSetting } from "@/features/settings/types/settings-admin";
import { formatDateTime } from "../../lib/format";
import { AdminErrorState, AdminListLoading } from "../shared/admin-list-states";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminSelectField } from "../shared/admin-select-field";
import { AdminStatusPill } from "../shared/admin-status-badge";

/** One setting, saved on its own; the server validates the value and returns `body.value` errors inline. */
function SettingRow({ setting }: { setting: EffectiveSetting }) {
  const spec = specFor(setting.key);
  const initial = toInput(spec, setting.value);
  const [text, setText] = useState(initial);
  const [localError, setLocalError] = useState<string | null>(null);
  const mutation = useUpdateSetting(setting.key);
  const dirty = text !== initial;
  const serverError = mutation.error?.fieldErrors.find((field) => field.path === "value")?.message ?? mutation.error?.message;
  const inputId = `setting-${setting.key}`;
  const errorId = `${inputId}-error`;
  const options = settingOptions(spec, text);
  const error = localError ?? serverError;

  return (
    <form
      className="grid gap-3 py-4 md:grid-cols-[minmax(0,1fr)_minmax(0,20rem)] md:items-start md:gap-8"
      onSubmit={(event) => {
        event.preventDefault();
        const parsed = fromInput(spec, text);
        if ("error" in parsed) return setLocalError(parsed.error);
        setLocalError(null);
        mutation.mutate(parsed.value);
      }}
    >
      <div className="min-w-0 space-y-1">
        <div className="flex flex-wrap items-center gap-2">
          <Label htmlFor={inputId}>{spec.label}</Label>
          {setting.isOverride ? <AdminStatusPill tone="info">Customised</AdminStatusPill> : <AdminStatusPill tone="neutral" dot={false}>Default</AdminStatusPill>}
          {setting.isPublic ? <AdminStatusPill tone="neutral" dot={false}>Shown on the site</AdminStatusPill> : null}
        </div>
        <p className="text-[13px] text-muted-foreground">{setting.description}</p>
        {setting.isOverride && setting.updatedAt ? <p className="text-xs tabular-nums text-muted-foreground">Changed {formatDateTime(setting.updatedAt)}</p> : null}
      </div>
      <div className="grid gap-1.5">
        {spec.kind === "readonly" ? (
          <p id={inputId} className="rounded-[calc(var(--radius)-2px)] border border-border bg-muted px-3 py-2 text-sm">
            {setting.value === null || setting.value === undefined ? "Not set" : String(setting.value)}
          </p>
        ) : (
          <div className="flex items-center gap-2">
            {options ? (
              <AdminSelectField
                className="min-w-0 flex-1"
                control={{ id: inputId, ...(error ? { "aria-invalid": true as const, "aria-describedby": errorId } : {}) }}
                value={text}
                onValueChange={(value) => setText(value ?? "")}
                options={options}
                disabled={mutation.isPending}
              />
            ) : (
              <div className="relative min-w-0 flex-1">
                {spec.kind === "rupees" ? (
                  <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted-foreground" aria-hidden="true">
                    ₹
                  </span>
                ) : null}
                <Input
                  id={inputId}
                  type={spec.kind === "email" ? "email" : "text"}
                  inputMode={spec.kind === "integer" ? "numeric" : spec.kind === "rupees" || spec.kind === "percentFromBps" ? "decimal" : undefined}
                  className={spec.kind === "rupees" ? "pl-7 tabular-nums" : spec.kind === "integer" || spec.kind === "percentFromBps" ? "tabular-nums" : undefined}
                  value={text}
                  placeholder={spec.nullable ? "Not set" : undefined}
                  onChange={(event) => setText(event.target.value)}
                  disabled={mutation.isPending}
                  aria-invalid={Boolean(error) || undefined}
                  aria-describedby={error ? errorId : undefined}
                />
              </div>
            )}
            {spec.suffix && !options ? <span className="shrink-0 text-sm text-muted-foreground">{spec.suffix}</span> : null}
            <Button type="submit" size="sm" variant={dirty ? "default" : "outline"} className={dirty ? "shrink-0" : "shrink-0 bg-surface"} disabled={!dirty || mutation.isPending}>
              {mutation.isPending ? "Saving…" : "Save"}
            </Button>
          </div>
        )}
        {error ? (
          <p id={errorId} role="alert" className="text-xs text-destructive">
            {error}
          </p>
        ) : null}
      </div>
    </form>
  );
}

/** Operational settings from the backend allow-list only. No secrets, API keys or environment values are shown. */
export function AdminSettingsView() {
  const settings = useSettings();
  if (!settings.ready) return <AdminListLoading label="Loading settings" rows={4} />;
  if (settings.error) return <AdminErrorState error={settings.error} onRetry={settings.reload} title="Could not load settings" />;
  const groups = new Map<string, EffectiveSetting[]>();
  for (const setting of settings.data ?? []) groups.set(setting.group, [...(groups.get(setting.group) ?? []), setting]);

  return (
    <div className="space-y-5">
      <AdminPageHeader
        title="Settings"
        description="Each setting saves on its own. Saving the default value removes the customisation. Passwords and keys are managed by your developers, not here."
      />
      <div className="grid gap-5">
        {[...groups.entries()].map(([group, items]) => (
          <AdminSectionCard key={group} title={settingGroupLabels[group] ?? group} headerClassName="pb-0" contentClassName="divide-y divide-border pb-1">
            {items.map((setting) => (
              <SettingRow key={`${setting.key}-${setting.updatedAt ?? "default"}-${String(setting.value)}`} setting={setting} />
            ))}
          </AdminSectionCard>
        ))}
      </div>
    </div>
  );
}
