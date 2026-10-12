"use client";

import Image from "next/image";
import { BookOpen } from "lucide-react";
import { useState } from "react";

import { cn } from "@/lib/utils";

export function ArticleVisual({
  src,
  alt,
  className,
  sizes = "(max-width: 768px) 100vw, 50vw",
}: {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-editorial-900",
        className,
      )}
    >
      {src && !failed ? (
        <Image
          alt={alt}
          className="object-cover"
          fill
          onError={() => setFailed(true)}
          sizes={sizes}
          src={src}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center bg-[radial-gradient(circle_at_70%_25%,color-mix(in_srgb,var(--gold-400)_22%,transparent),transparent_42%),linear-gradient(145deg,var(--editorial-900),var(--espresso-800))]">
          <div className="grid size-20 place-items-center rounded-full border border-gold-400/30 text-gold-300">
            <BookOpen aria-hidden="true" className="size-8" />
          </div>
        </div>
      )}
    </div>
  );
}
