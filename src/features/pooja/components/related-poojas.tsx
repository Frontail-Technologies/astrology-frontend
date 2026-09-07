import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

import type { PoojaDefinition } from "../types/pooja";

type RelatedPoojasProps = {
  poojas: PoojaDefinition[];
};

export function RelatedPoojas({ poojas }: RelatedPoojasProps) {
  if (poojas.length === 0) {
    return null;
  }

  return (
    <section aria-labelledby="related-poojas-heading">
      <h2
        id="related-poojas-heading"
        className="font-display text-[28px] font-semibold text-foreground sm:text-[32px]"
      >
        Related Poojas
      </h2>
      <p className="mt-2 max-w-xl text-[15px] leading-7 text-muted-foreground">
        Other rituals people often look at alongside this one.
      </p>

      <div className="mt-6 grid grid-cols-2 gap-4 sm:gap-5 lg:grid-cols-4">
        {poojas.map((pooja) => (
          <article
            key={pooja.slug}
            className="group relative flex h-full flex-col rounded-2xl border border-gold-500/22 bg-white p-4 shadow-[0_1px_2px_rgba(23,32,51,0.05),0_4px_14px_-6px_rgba(23,32,51,0.1)] transition-[transform,border-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-gold-500/40 has-focus-visible:-translate-y-0.5 has-focus-visible:border-gold-500/45 has-focus-visible:ring-2 has-focus-visible:ring-gold-400 has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background dark:border-gold-400/16 dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.025)] dark:hover:border-gold-400/30 dark:hover:bg-espresso-700"
          >
            <div className="grid place-items-center rounded-xl bg-conversion-500/10 py-4 transition-colors duration-200 group-hover:bg-conversion-500/16 dark:bg-conversion-500/12">
              <Image
                src={pooja.imageSrc}
                alt={`${pooja.name} illustration`}
                width={320}
                height={320}
                className="illustration-lift size-[130px] object-contain"
              />
            </div>
            <h3 className="mt-3 font-sans text-[15px] font-bold leading-tight text-foreground">
              <Link
                href={`/pooja/${pooja.slug}`}
                className="outline-none after:absolute after:inset-0 after:content-['']"
              >
                {pooja.name}
              </Link>
            </h3>
            <p className="mt-1.5 line-clamp-2 text-[12.5px] leading-5 text-muted-foreground">
              {pooja.shortDescription}
            </p>
            <span className="mt-3 inline-flex items-center gap-1 text-[12px] font-semibold text-gold-500 dark:text-gold-300">
              View Details
              <ArrowRight aria-hidden="true" className="size-3.5" />
            </span>
          </article>
        ))}
      </div>
    </section>
  );
}
