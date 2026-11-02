"use client";

import { useEffect, useMemo, useState } from "react";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COUPON_LIMITS } from "@/features/coupons/constants/coupon-status";
import { useStoreCategoryOptions, useStoreProductSearch, useStoreProductsByIds } from "@/features/store/hooks/use-store-admin";
import { formatINR } from "../../lib/format";
import { AdminCombobox } from "../shared/admin-combobox";
import { AdminFormField } from "../shared/admin-form-section";

const SEARCH_DEBOUNCE_MS = 300;

function SelectedChip({ label, onRemove, disabled, muted }: { label: string; onRemove: () => void; disabled?: boolean; muted?: boolean }) {
  return (
    <li className={`inline-flex h-8 items-center gap-1.5 rounded-full border border-border bg-surface pl-3 pr-1.5 text-sm ${muted ? "text-muted-foreground" : "text-foreground"}`}>
      <span className="max-w-56 truncate">{label}</span>
      <button
        type="button"
        onClick={onRemove}
        disabled={disabled}
        className="grid size-5 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-50"
        aria-label={`Remove ${label}`}
      >
        <X className="size-3" aria-hidden="true" />
      </button>
    </li>
  );
}

function Chips({ children, label }: { children: React.ReactNode; label: string }) {
  return (
    <ul className="flex flex-wrap gap-1.5" aria-label={label}>
      {children}
    </ul>
  );
}

/** Store categories as removable chips plus a searchable picker (all categories, first 100). */
export function CouponCategoryPicker({ value, onChange, error, disabled }: { value: string[]; onChange: (ids: string[]) => void; error?: string; disabled?: boolean }) {
  const categories = useStoreCategoryOptions();
  const names = useMemo(() => new Map((categories.data ?? []).map((category) => [category.id, category.name])), [categories.data]);
  const options = useMemo(
    () =>
      (categories.data ?? []).map((category) => ({
        value: category.id,
        label: category.name,
        description: category.active ? undefined : "Inactive",
        disabled: value.includes(category.id),
      })),
    [categories.data, value],
  );
  const full = value.length >= COUPON_LIMITS.maxCategories;

  return (
    <div className="grid gap-3">
      {value.length ? (
        <Chips label="Selected categories">
          {value.map((id) => (
            <SelectedChip
              key={id}
              label={names.get(id) ?? (categories.isPending ? "Loading…" : "Unavailable category")}
              muted={categories.isSuccess && !names.has(id)}
              disabled={disabled}
              onRemove={() => onChange(value.filter((item) => item !== id))}
            />
          ))}
        </Chips>
      ) : null}
      <AdminFormField
        label="Add a category"
        error={error}
        description={categories.isError ? "Could not load categories." : `${value.length} selected`}
      >
        {(control) => (
          <div className="flex items-center gap-2">
            <AdminCombobox
              control={control}
              value={null}
              onValueChange={(id) => {
                if (id && !value.includes(id)) onChange([...value, id]);
              }}
              options={options}
              loading={categories.isPending}
              placeholder={categories.isSuccess && options.length === 0 ? "No store categories yet" : "Choose a category"}
              searchPlaceholder="Search categories…"
              emptyText="No categories match."
              disabled={disabled || full}
              className="min-w-0 flex-1"
            />
            {categories.isError ? (
              <Button type="button" variant="outline" size="sm" className="bg-surface" onClick={() => void categories.refetch()}>
                Retry
              </Button>
            ) : null}
          </div>
        )}
      </AdminFormField>
    </div>
  );
}

/** Products as removable chips plus a server-searched picker (`/admin/store/products?search=`, first 20 matches). */
export function CouponProductPicker({ value, onChange, error, disabled }: { value: string[]; onChange: (ids: string[]) => void; error?: string; disabled?: boolean }) {
  const [text, setText] = useState("");
  const [search, setSearch] = useState("");
  useEffect(() => {
    const timer = setTimeout(() => setSearch(text.trim().slice(0, 120)), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(timer);
  }, [text]);
  const results = useStoreProductSearch(search);
  const selected = useStoreProductsByIds(value);
  const names = new Map<string, string>((results.data?.items ?? []).map((product) => [product.id, product.name]));
  value.forEach((id, index) => {
    const name = selected[index]?.data?.name;
    if (name) names.set(id, name);
  });
  const options = (results.data?.items ?? []).map((product) => ({
    value: product.id,
    label: product.name,
    description: [
      product.category?.name ?? "Uncategorized",
      product.pricePaise === null ? "Not priced" : formatINR(product.pricePaise),
      product.catalogStatus !== "published" ? "Not published" : null,
    ]
      .filter(Boolean)
      .join(" · "),
    disabled: value.includes(product.id),
  }));
  const full = value.length >= COUPON_LIMITS.maxProducts;
  const more = results.data && results.data.total > results.data.items.length ? ` · showing ${results.data.items.length} of ${results.data.total} matches, type to narrow down` : "";

  return (
    <div className="grid gap-3">
      {value.length ? (
        <Chips label="Selected products">
          {value.map((id, index) => {
            const state = selected[index];
            const label = names.get(id) ?? (state?.isError ? "Unavailable product" : "Loading…");
            return <SelectedChip key={id} label={label} muted={state?.isError} disabled={disabled} onRemove={() => onChange(value.filter((item) => item !== id))} />;
          })}
        </Chips>
      ) : null}
      <AdminFormField label="Add a product" error={error} description={results.isError ? "Could not load products." : `${value.length} selected${more}`}>
        {(control) => (
          <AdminCombobox
            control={control}
            value={null}
            onValueChange={(id) => {
              if (id && !value.includes(id)) onChange([...value, id]);
            }}
            options={options}
            onSearchChange={setText}
            loading={results.isFetching}
            placeholder="Choose a product"
            searchPlaceholder="Search products by name…"
            emptyText={search ? "No products match this search." : "No products yet."}
            disabled={disabled || full}
          />
        )}
      </AdminFormField>
    </div>
  );
}
