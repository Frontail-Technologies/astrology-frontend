"use client";

import { useState } from "react";

import type { ProductMedia } from "@/features/store/types/store";
import { cn } from "@/lib/utils";
import { StoreImage } from "./store-image";

export function ProductGallery({ media, name, featured = false }: { media: ProductMedia[]; name: string; featured?: boolean }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const active = media[Math.min(activeIndex, Math.max(media.length - 1, 0))];

  return (
    <div className="flex flex-col gap-3 lg:flex-row-reverse">
      <div className="relative min-w-0 flex-1 overflow-hidden rounded-2xl border border-border bg-gradient-to-b from-surface-muted to-gold-300/15">
        {featured ? (
          <span className="absolute left-4 top-4 z-10 rounded-full bg-gold-400 px-3 py-1 text-xs font-semibold text-midnight-950">
            Featured
          </span>
        ) : null}
        <StoreImage src={active?.src} alt={active?.alt ?? name} priority className="aspect-square w-full p-6 sm:p-10" />
      </div>

      {media.length > 1 ? (
        <ul className="flex gap-2 overflow-x-auto pb-1 lg:w-20 lg:shrink-0 lg:flex-col lg:overflow-y-auto lg:overflow-x-visible lg:pb-0" aria-label="Product images">
          {media.map((item, index) => {
            const selected = index === activeIndex;
            return (
              <li key={`${item.src}-${index}`} className="shrink-0">
                <button
                  type="button"
                  onClick={() => setActiveIndex(index)}
                  aria-label={`Show image ${index + 1}${index === 0 ? " (primary)" : ""}`}
                  aria-pressed={selected}
                  className={cn(
                    "block overflow-hidden rounded-lg border bg-surface-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
                    selected ? "border-conversion-500 ring-1 ring-conversion-500" : "border-border hover:border-gold-500/50",
                  )}
                >
                  <StoreImage src={item.src} alt="" className="size-16 p-1.5 lg:size-20" />
                </button>
              </li>
            );
          })}
        </ul>
      ) : null}
    </div>
  );
}
