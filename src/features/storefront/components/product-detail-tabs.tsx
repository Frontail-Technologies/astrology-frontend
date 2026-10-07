"use client";

import { Check } from "lucide-react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { ProductMedia, StoreProduct } from "@/features/store/types/store";
import { StoreImage } from "./store-image";

type TabSpec = { value: string; label: string };

// Overrides the shared line variant for the public Store: larger text, conversion-red underline.
const triggerClass =
  "group-data-[variant=line]/tabs-list:h-12 group-data-[variant=line]/tabs-list:px-5 group-data-[variant=line]/tabs-list:text-sm group-data-[variant=line]/tabs-list:after:bg-conversion-500";

export function ProductDetailTabs({
  product,
  specifications,
  supportingImage,
}: {
  product: StoreProduct;
  specifications: Array<{ label: string; value: string }>;
  supportingImage?: ProductMedia;
}) {
  const details = product.details;
  const overview = details?.overview?.length ? details.overview : product.description ? [product.description] : [];
  const care = details?.careInstructions ?? [];

  const tabs: TabSpec[] = [
    ...(overview.length ? [{ value: "overview", label: "Overview" }] : []),
    ...(specifications.length ? [{ value: "specifications", label: "Specifications" }] : []),
    ...(care.length ? [{ value: "care", label: "Care instructions" }] : []),
  ];

  if (!tabs.length) return null;

  return (
    <Tabs defaultValue={tabs[0].value} className="gap-0 overflow-hidden rounded-2xl border border-border bg-surface">
      <TabsList variant="line" className="overflow-x-auto px-2">
        {tabs.map((tab) => (
          <TabsTrigger key={tab.value} value={tab.value} className={triggerClass}>
            {tab.label}
          </TabsTrigger>
        ))}
      </TabsList>

      {overview.length ? (
        <TabsContent value="overview" className="grid gap-6 p-6 sm:p-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,0.8fr)] lg:gap-10">
          <div>
            <h2 className="font-display text-2xl font-semibold text-foreground sm:text-3xl">About {product.name}</h2>
            <div className="mt-3 space-y-3">
              {overview.map((paragraph) => (
                <p key={paragraph} className="text-base leading-7 text-muted-foreground">
                  {paragraph}
                </p>
              ))}
            </div>
            <p className="mt-4 text-xs leading-5 text-muted-foreground">
              Traditional associations vary by belief and practice and are not a guarantee of any outcome.
            </p>
          </div>
          {supportingImage ? (
            <StoreImage
              src={supportingImage.src}
              alt={supportingImage.alt ?? product.name}
              className="aspect-[4/3] w-full rounded-xl border border-border bg-surface-muted p-4"
            />
          ) : null}
        </TabsContent>
      ) : null}

      {specifications.length ? (
        <TabsContent value="specifications" className="p-6 sm:p-8">
          <dl className="max-w-2xl divide-y divide-border text-sm">
            {specifications.map((spec) => (
              <div key={spec.label} className="flex justify-between gap-6 py-3">
                <dt className="text-muted-foreground">{spec.label}</dt>
                <dd className="text-right font-medium text-foreground">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </TabsContent>
      ) : null}

      {care.length ? (
        <TabsContent value="care" className="p-6 sm:p-8">
          <ul className="max-w-2xl space-y-3">
            {care.map((item) => (
              <li key={item} className="flex gap-3 text-base leading-7 text-muted-foreground">
                <Check className="mt-1.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />
                {item}
              </li>
            ))}
          </ul>
        </TabsContent>
      ) : null}
    </Tabs>
  );
}
