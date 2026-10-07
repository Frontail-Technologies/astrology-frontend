import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { Button } from "@/components/ui/button";
import { collectionGuidance } from "../content/store-content";

const SCENE = "/assets/astrology/calculators/categories/mystical_gemstone_astrology_altar.png";

export function CollectionGuidance() {
  return (
    <section aria-labelledby="collection-guidance" className="grid overflow-hidden rounded-2xl border border-border bg-surface lg:grid-cols-2">
      {/* Close crop of the gemstones from the shared altar scene. */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted lg:aspect-auto lg:min-h-[280px]" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={SCENE} alt="" className="absolute max-w-none" style={{ width: "400%", left: "-246%", top: "-75%" }} />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">{collectionGuidance.eyebrow}</p>
        <h2 id="collection-guidance" className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
          {collectionGuidance.title}
        </h2>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{collectionGuidance.body}</p>
        <div className="mt-6">
          <Button asChild variant="conversion" size="lg" className="px-6">
            <Link href={collectionGuidance.href}>
              {collectionGuidance.cta} <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
