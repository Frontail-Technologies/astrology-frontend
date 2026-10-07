import Link from "next/link";
import { ArrowRight, Leaf, Sparkles, Sprout } from "lucide-react";

import { Button } from "@/components/ui/button";
import { rudrakshaEditorial } from "../content/store-content";

const pointIcons = [Leaf, Sparkles, Sprout];
const SCENE = "/assets/astrology/calculators/categories/mystical_gemstone_astrology_altar.png";

export function StoreEditorialFeature({ categorySlug }: { categorySlug: string }) {
  return (
    <section
      aria-labelledby="rudraksha-editorial"
      className="grid overflow-hidden rounded-2xl border border-border bg-surface lg:grid-cols-2"
    >
      {/* Close crop of the rudraksha beads from the shared altar scene. */}
      <div className="relative aspect-[4/3] overflow-hidden bg-surface-muted lg:aspect-auto lg:min-h-[340px]" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={SCENE}
          alt=""
          className="absolute max-w-none"
          style={{ width: "400%", left: "-300%", top: "-64%" }}
        />
      </div>
      <div className="flex flex-col justify-center p-6 sm:p-8 lg:p-10">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-gold-500">{rudrakshaEditorial.eyebrow}</p>
        <h2 id="rudraksha-editorial" className="mt-2 font-display text-3xl font-semibold text-foreground sm:text-4xl">
          {rudrakshaEditorial.title}
        </h2>
        <p className="mt-3 text-base leading-7 text-muted-foreground">{rudrakshaEditorial.intro}</p>
        <ul className="mt-5 space-y-3">
          {rudrakshaEditorial.points.map((point, index) => {
            const Icon = pointIcons[index % pointIcons.length];
            return (
              <li key={point.title} className="flex gap-3">
                <Icon className="mt-0.5 size-4 shrink-0 text-gold-500" aria-hidden="true" />
                <p className="text-sm leading-6 text-muted-foreground">
                  <span className="font-semibold text-foreground">{point.title}.</span> {point.text}
                </p>
              </li>
            );
          })}
        </ul>
        <p className="mt-4 text-xs leading-5 text-muted-foreground">{rudrakshaEditorial.note}</p>
        <div className="mt-6">
          <Button asChild variant="conversion" size="lg" className="px-6">
            <Link href={`/shop/category/${categorySlug}`}>
              Explore rudraksha <ArrowRight aria-hidden="true" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
