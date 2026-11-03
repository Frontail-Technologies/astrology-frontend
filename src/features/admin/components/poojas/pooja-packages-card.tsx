"use client";

import { useState } from "react";
import { Pencil, Plus, Trash2, UsersRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { useDeletePoojaPackage, usePoojaPackages, useSavePoojaPackage } from "@/features/poojas/hooks/use-pooja-admin";
import {
  POOJA_PACKAGE_LIMITS,
  packageFormToInput,
  packageToFormValues,
  validatePackageForm,
  type PoojaPackageFormErrors,
  type PoojaPackageFormValues,
} from "@/features/poojas/lib/pooja-package-form";
import type { PoojaPackage } from "@/features/poojas/types/pooja-admin";
import { formatINR } from "../../lib/format";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminMoneyInput } from "../shared/admin-money-input";
import { AdminErrorState } from "../shared/admin-list-states";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminStatusPill } from "../shared/admin-status-badge";

type Editing = { pkg: PoojaPackage | null } | null;

/** Bookable packages for a pooja (price and sankalp size per option), shown on the pooja detail page. */
export function PoojaPackagesCard({ poojaId }: { poojaId: string }) {
  const packages = usePoojaPackages(poojaId);
  const save = useSavePoojaPackage(poojaId);
  const remove = useDeletePoojaPackage(poojaId);
  const [editing, setEditing] = useState<Editing>(null);
  const [values, setValues] = useState<PoojaPackageFormValues>(packageToFormValues(null));
  const [errors, setErrors] = useState<PoojaPackageFormErrors>({});
  const [deleting, setDeleting] = useState<PoojaPackage | null>(null);
  const items = packages.data ?? [];

  const open = (pkg: PoojaPackage | null) => {
    save.reset();
    setErrors({});
    setValues(packageToFormValues(pkg, items.length));
    setEditing({ pkg });
  };
  const set = <K extends keyof PoojaPackageFormValues>(key: K, value: PoojaPackageFormValues[K]) => setValues((current) => ({ ...current, [key]: value }));
  const submit = () => {
    const found = validatePackageForm(values);
    setErrors(found);
    if (Object.keys(found).length) return;
    save.mutate({ packageId: editing?.pkg?.id, input: packageFormToInput(values) }, { onSuccess: () => setEditing(null) });
  };

  return (
    <AdminSectionCard
      title="Packages"
      description="Options customers choose when booking, each with its own price and number of names in the sankalp."
      flush
      actions={
        <Button variant="outline" size="sm" className="bg-surface" onClick={() => open(null)}>
          <Plus aria-hidden="true" />
          Add package
        </Button>
      }
    >
      {packages.error ? (
        <div className="px-5 py-4">
          <AdminErrorState error={packages.error} onRetry={packages.reload} title="Could not load packages" />
        </div>
      ) : !packages.ready ? (
        <p className="px-5 py-4 text-sm text-muted-foreground">Loading packages…</p>
      ) : items.length === 0 ? (
        <p className="px-5 py-4 text-sm text-muted-foreground">No packages yet. Customers book at the pooja&apos;s base price with one name.</p>
      ) : (
        <ul className="divide-y divide-border">
          {items.map((pkg) => (
            <li key={pkg.id} className="flex flex-wrap items-center gap-x-4 gap-y-2 px-5 py-3">
              <div className="min-w-0 flex-1">
                <p className="flex flex-wrap items-center gap-2 font-medium">
                  {pkg.name}
                  {pkg.active ? null : <AdminStatusPill tone="neutral">Inactive</AdminStatusPill>}
                </p>
                <p className="mt-0.5 flex flex-wrap items-center gap-x-3 text-xs text-muted-foreground">
                  <span className="inline-flex items-center gap-1">
                    <UsersRound className="size-3.5" aria-hidden="true" />
                    {pkg.maxDevotees === 1 ? "1 name" : `Up to ${pkg.maxDevotees} names`}
                  </span>
                  {pkg.durationMinutes ? <span>{pkg.durationMinutes} min</span> : null}
                  {pkg.description ? <span className="truncate">{pkg.description}</span> : null}
                </p>
              </div>
              <span className="font-medium tabular-nums">{formatINR(pkg.pricePaise)}</span>
              <div className="flex gap-1">
                <Button variant="ghost" size="icon" className="size-8" aria-label={`Edit ${pkg.name}`} onClick={() => open(pkg)}>
                  <Pencil className="size-4" aria-hidden="true" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="size-8 text-destructive hover:text-destructive"
                  aria-label={`Delete ${pkg.name}`}
                  onClick={() => {
                    remove.reset();
                    setDeleting(pkg);
                  }}
                >
                  <Trash2 className="size-4" aria-hidden="true" />
                </Button>
              </div>
            </li>
          ))}
        </ul>
      )}

      <AdminConfirmDialog
        open={editing !== null}
        onOpenChange={(next) => (next ? null : setEditing(null))}
        title={editing?.pkg ? `Edit ${editing.pkg.name}` : "Add package"}
        description="Shown to customers on the booking screen."
        confirmLabel={editing?.pkg ? "Save package" : "Add package"}
        pending={save.isPending}
        error={save.error}
        onConfirm={submit}
      >
        <div className="grid gap-3">
          <Field label="Name" error={errors.name}>
            {(id) => <Input id={id} value={values.name} onChange={(event) => set("name", event.target.value)} maxLength={POOJA_PACKAGE_LIMITS.name[1]} placeholder="Family sankalp" />}
          </Field>
          <Field label="Description" error={errors.description}>
            {(id) => <Textarea id={id} value={values.description} onChange={(event) => set("description", event.target.value)} maxLength={POOJA_PACKAGE_LIMITS.description} className="min-h-20" />}
          </Field>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="Price" error={errors.pricePaise}>
              {(id) => <AdminMoneyInput id={id} value={values.pricePaise} onChange={(next) => set("pricePaise", next)} />}
            </Field>
            <Field label="Names in sankalp" error={errors.maxDevotees}>
              {(id) => <Input id={id} inputMode="numeric" value={values.maxDevotees} onChange={(event) => set("maxDevotees", event.target.value)} className="tabular-nums" />}
            </Field>
            <Field label="Duration (minutes)" error={errors.durationMinutes}>
              {(id) => <Input id={id} inputMode="numeric" value={values.durationMinutes} onChange={(event) => set("durationMinutes", event.target.value)} placeholder="Same as the pooja" className="tabular-nums" />}
            </Field>
            <Field label="Order" error={errors.sortOrder}>
              {(id) => <Input id={id} inputMode="numeric" value={values.sortOrder} onChange={(event) => set("sortOrder", event.target.value)} className="tabular-nums" />}
            </Field>
          </div>
          <div className="flex items-center justify-between gap-4 rounded-md border border-border p-3">
            <div>
              <Label htmlFor="package-active">Bookable</Label>
              <p className="text-xs text-muted-foreground">Inactive packages are hidden from the booking screen.</p>
            </div>
            <Switch id="package-active" checked={values.active} onCheckedChange={(next) => set("active", next)} />
          </div>
        </div>
      </AdminConfirmDialog>

      <AdminConfirmDialog
        open={deleting !== null}
        onOpenChange={(next) => (next ? null : setDeleting(null))}
        title={`Delete ${deleting?.name ?? "package"}?`}
        description="If bookings already use this package it is deactivated instead, so their history stays intact."
        confirmLabel="Delete"
        destructive
        pending={remove.isPending}
        error={remove.error}
        onConfirm={() => deleting && remove.mutate(deleting.id, { onSuccess: () => setDeleting(null) })}
      />
    </AdminSectionCard>
  );
}

function Field({ label, error, children }: { label: string; error?: string; children: (id: string) => React.ReactNode }) {
  const id = `package-${label.toLowerCase().replace(/\W+/g, "-")}`;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>{label}</Label>
      {children(id)}
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
