"use client";

import { useState } from "react";
import { ImageOff } from "lucide-react";

import { cn } from "@/lib/utils";

export function StoreImage({
  src,
  alt,
  className,
  fit = "contain",
  priority = false,
}: {
  src?: string;
  alt?: string;
  className?: string;
  fit?: "contain" | "cover";
  priority?: boolean;
}) {
  const [failedSrc, setFailedSrc] = useState<string>();

  if (!src || failedSrc === src) {
    return (
      <div className={cn("grid place-items-center bg-muted/60 text-muted-foreground", className)}>
        <ImageOff className="size-6" aria-hidden="true" />
        <span className="sr-only">Image unavailable</span>
      </div>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={src}
      alt={alt ?? ""}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailedSrc(src)}
      className={cn(fit === "contain" ? "object-contain" : "object-cover", className)}
    />
  );
}
