"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { zodiacSignLabels, zodiacSigns } from "@/features/horoscopes/constants/horoscope-status";
import type { ZodiacSign } from "@/features/horoscopes/types/horoscope-admin";
import { useDeleteSignCompatibility, useSaveSignCompatibility, useSignCompatibility } from "@/features/sign-compatibility/hooks/use-sign-compatibility-admin";
import {
  COMPATIBILITY_SUMMARY_LIMITS,
  compatibilityFormErrors,
  entryToForm,
  formToInput,
  indexEntries,
  orderedPair,
  pairKey,
  type CompatibilityFormValues,
} from "@/features/sign-compatibility/lib/sign-compatibility-form";
import type { SignCompatibilityEntry } from "@/features/sign-compatibility/types/sign-compatibility-admin";
import { cn } from "@/lib/utils";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";

const TOTAL_PAIRS = (zodiacSigns.length * (zodiacSigns.length + 1)) / 2;
const scoreFields = [
  { key: "score", label: "Overall" },
  { key: "love", label: "Love" },
  { key: "trust", label: "Trust" },
  { key: "communication", label: "Communication" },
] as const;

type Pair = [ZodiacSign, ZodiacSign];

function PairEditor({ pair, entry, onClose }: { pair: Pair | null; entry: SignCompatibilityEntry | undefined; onClose: () => void }) {
  const save = useSaveSignCompatibility();
  const remove = useDeleteSignCompatibility();
  const [values, setValues] = useState<CompatibilityFormValues>(() => entryToForm(entry));
  const [touched, setTouched] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const errors = compatibilityFormErrors(values);
  const valid = Object.keys(errors).length === 0;
  const set = <K extends keyof CompatibilityFormValues>(key: K, value: CompatibilityFormValues[K]) => setValues((current) => ({ ...current, [key]: value }));
  const title = pair ? `${zodiacSignLabels[pair[0]]} + ${zodiacSignLabels[pair[1]]}` : "";
  const shown = (key: keyof CompatibilityFormValues) => (touched ? errors[key] : undefined);

  return (
    <>
      <AdminConfirmDialog
        open={pair !== null && !deleting}
        onOpenChange={(open) => {
          if (!open) onClose();
        }}
        title={title}
        description="Written guidance shown in the app's compatibility tool. Only published pairs are visible to customers."
        confirmLabel={entry ? "Save changes" : "Create entry"}
        pending={save.isPending}
        error={save.error}
        onConfirm={() => {
          setTouched(true);
          if (!pair || !valid) return;
          save.mutate({ signA: pair[0], signB: pair[1], input: formToInput(values) }, { onSuccess: onClose });
        }}
      >
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {scoreFields.map(({ key, label }) => (
              <div key={key} className="grid gap-1.5">
                <Label htmlFor={`compat-${key}`}>{label}</Label>
                <Input id={`compat-${key}`} inputMode="numeric" placeholder="0–100" className="tabular-nums" value={values[key]} aria-invalid={Boolean(shown(key))} onChange={(event) => set(key, event.target.value)} />
                {shown(key) ? <p className="text-xs text-destructive">{shown(key)}</p> : null}
              </div>
            ))}
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="compat-summary">Summary</Label>
            <Textarea id="compat-summary" rows={5} maxLength={COMPATIBILITY_SUMMARY_LIMITS.max} value={values.summary} aria-invalid={Boolean(shown("summary"))} onChange={(event) => set("summary", event.target.value)} />
            <p className={cn("text-xs", shown("summary") ? "text-destructive" : "text-muted-foreground")}>
              {shown("summary") ?? "Balanced, general guidance. Avoid predictions or guarantees about marriage or the future."} ({values.summary.trim().length}/{COMPATIBILITY_SUMMARY_LIMITS.max})
            </p>
          </div>
          <div className="flex items-center justify-between gap-3 rounded-[calc(var(--radius)-2px)] border border-border p-3">
            <div>
              <Label htmlFor="compat-published">Published</Label>
              <p className="text-xs text-muted-foreground">Customers see this pair only when published.</p>
            </div>
            <Switch id="compat-published" checked={values.published} onCheckedChange={(checked) => set("published", checked)} />
          </div>
          {entry ? (
            <Button type="button" variant="ghost" size="sm" className="justify-self-start text-destructive" onClick={() => setDeleting(true)}>
              Delete this entry
            </Button>
          ) : null}
        </div>
      </AdminConfirmDialog>
      <AdminConfirmDialog
        open={deleting}
        onOpenChange={(open) => {
          if (!open) setDeleting(false);
        }}
        title={`Delete ${title}?`}
        description="The pair goes back to unwritten and disappears from the app."
        confirmLabel="Delete"
        destructive
        pending={remove.isPending}
        error={remove.error}
        onConfirm={() => {
          if (pair) remove.mutate({ signA: pair[0], signB: pair[1] }, { onSuccess: onClose });
        }}
      />
    </>
  );
}

function Cell({ entry, label, onClick }: { entry: SignCompatibilityEntry | undefined; label: string; onClick: () => void }) {
  const state = entry ? (entry.published ? "Published" : "Draft") : "Not written";
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`${label}: ${entry ? `${entry.score}, ` : ""}${state}`}
      className={cn(
        "flex h-11 w-full items-center justify-center rounded-md border text-[13px] font-semibold tabular-nums transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        entry?.published && "border-success/40 bg-success/10 text-foreground hover:bg-success/20",
        entry && !entry.published && "border-dashed border-warning/60 bg-warning/10 text-foreground hover:bg-warning/20",
        !entry && "border-border bg-surface text-muted-foreground hover:bg-muted",
      )}
    >
      {entry ? entry.score : "—"}
    </button>
  );
}

/** 12×12 grid of sign pairs (symmetric: both cells of a pair open the same entry). */
export function AdminSignCompatibilityView() {
  const list = useSignCompatibility();
  const [pair, setPair] = useState<Pair | null>(null);

  return (
    <AdminDetailFrame ready={list.ready} error={list.error} onRetry={list.reload} noun="sign compatibility">
      {() => {
        const entries = list.data?.items ?? [];
        const byPair = indexEntries(entries);
        const published = entries.filter((entry) => entry.published).length;
        const open = (a: ZodiacSign, b: ZodiacSign) => setPair(orderedPair(a, b));
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title="Sign compatibility"
              description="Editorial compatibility for each pair of zodiac signs, shown in the app's compatibility tool. Pairs without a published entry show “not written yet”."
              meta={
                <>
                  <span className="tabular-nums">
                    {published} of {TOTAL_PAIRS} pairs published
                  </span>
                  <span className="tabular-nums">{entries.length - published} drafts</span>
                </>
              }
            />
            <AdminSectionCard title="Pairs" description="Select a cell to write or edit that pairing.">
              <div className="mb-3 flex flex-wrap gap-3 text-xs text-muted-foreground">
                <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-sm border border-success/40 bg-success/10" /> Published</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-sm border border-dashed border-warning/60 bg-warning/10" /> Draft</span>
                <span className="inline-flex items-center gap-1.5"><span className="size-3 rounded-sm border border-border bg-surface" /> Not written</span>
              </div>
              <div className="-mx-1 overflow-x-auto px-1 pb-1">
                <table className="w-full min-w-[760px] border-separate border-spacing-1">
                  <thead>
                    <tr>
                      <th scope="col" className="sticky left-0 z-10 bg-card" />
                      {zodiacSigns.map((sign) => (
                        <th key={sign} scope="col" className="px-0.5 text-[11px] font-medium text-muted-foreground">
                          {zodiacSignLabels[sign].slice(0, 3)}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {zodiacSigns.map((row) => (
                      <tr key={row}>
                        <th scope="row" className="sticky left-0 z-10 bg-card pr-2 text-left text-[13px] font-medium whitespace-nowrap">
                          {zodiacSignLabels[row]}
                        </th>
                        {zodiacSigns.map((column) => (
                          <td key={column} className="min-w-11">
                            <Cell entry={byPair.get(pairKey(row, column))} label={`${zodiacSignLabels[row]} and ${zodiacSignLabels[column]}`} onClick={() => open(row, column)} />
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </AdminSectionCard>
            {pair ? <PairEditor key={pairKey(pair[0], pair[1])} pair={pair} entry={byPair.get(pairKey(pair[0], pair[1]))} onClose={() => setPair(null)} /> : null}
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
