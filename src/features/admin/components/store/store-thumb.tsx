"use client";

import { useState } from "react";
import { Package } from "lucide-react";

import { mediaDisplayUrl } from "@/features/media/media-url";
import { cn } from "@/lib/utils";

/** Small cover thumbnail with an icon fallback (missing or broken image). */
export function StoreThumb({ src, className }: { src: string | null; className?: string }) {
  const url = mediaDisplayUrl(src);
  const [failed, setFailed] = useState<string | null>(null);
  return (
    <span className={cn("relative grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-muted text-muted-foreground", className)}>
      <Package className="size-4" aria-hidden="true" />
      {url && failed !== url ? (
        // eslint-disable-next-line @next/next/no-img-element -- admin thumbnails come from uploads or external URLs
        <img src={url} alt="" className="absolute inset-0 size-full object-cover" onError={() => setFailed(url)} />
      ) : null}
    </span>
  );
}
