import Image from "next/image";
import Link from "next/link";

import { cn } from "@/lib/utils";
import type { PoojaDefinition } from "../types/pooja";

type PoojaCardProps = {
  pooja: PoojaDefinition;
  variant?: "featured" | "catalog";
};

export function PoojaCard({ pooja, variant = "catalog" }: PoojaCardProps) {
  const route = `/pooja/${pooja.slug}`;
  const featured = variant === "featured";

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-2xl border border-gold-500/22 bg-white text-foreground",
        "transition-[transform,border-color,box-shadow] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-gold-500/40",
        "has-focus-visible:-translate-y-0.5 has-focus-visible:border-gold-500/45 has-focus-visible:ring-2 has-focus-visible:ring-gold-400 has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
        "dark:border-gold-400/16 dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.025)] dark:hover:border-gold-400/30 dark:hover:bg-espresso-700 dark:hover:shadow-[0_10px_32px_rgba(0,0,0,0.24),0_0_26px_color-mix(in_srgb,var(--gold-400)_5%,transparent)]",
        featured
          ? "p-4 shadow-[0_1px_2px_rgba(23,32,51,0.05),0_2px_10px_rgba(23,32,51,0.06)]"
          : "p-5 shadow-[0_1px_2px_rgba(23,32,51,0.05),0_4px_14px_-4px_rgba(23,32,51,0.08)]",
      )}
    >
      <div
        className={cn(
          "grid w-full place-items-center overflow-hidden rounded-xl bg-conversion-500/10 transition-colors duration-200 group-hover:bg-conversion-500/16 dark:bg-conversion-500/12 dark:group-hover:bg-conversion-500/18",
          featured ? "aspect-[5/6]" : "aspect-[4/5]",
        )}
      >
        <Image
          src={pooja.imageSrc}
          alt={`${pooja.name} illustration`}
          width={360}
          height={360}
          className="illustration-lift h-[82%] w-[82%] object-contain"
        />
      </div>

      <h3
        className={cn(
          "mt-3 text-center font-sans font-bold leading-tight text-foreground",
          featured ? "text-[15px]" : "text-base",
        )}
      >
        <Link
          href={route}
          aria-label={`View details for ${pooja.name}`}
          className="outline-none after:absolute after:inset-0 after:content-['']"
        >
          {pooja.name}
        </Link>
      </h3>
    </article>
  );
}
