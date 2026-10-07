import Link from "next/link";
import { ArrowRight, BadgeCheck, Gem, ListChecks, MessagesSquare } from "lucide-react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import type { ProductCategory } from "@/features/store/types/store";
import { storeHero, storeHeroBenefits } from "../content/store-content";

const benefitIcons = { natural: Gem, selected: BadgeCheck, details: ListChecks, guidance: MessagesSquare };
const HERO_IMAGE = "/assets/astrology/calculators/categories/mystical_gemstone_astrology_altar.png";

export function StoreHero({ primaryCategory }: { primaryCategory?: ProductCategory }) {
  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-surface-muted/50">
      <div className="absolute inset-0 -z-10 hidden lg:block" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO_IMAGE} alt="" className="size-full object-cover object-[80%_center] dark:brightness-75" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent lg:via-background/80" />
      </div>

      <Container className="max-w-[1440px]">
        <div className="grid min-h-[500px] items-center py-10 sm:py-12 lg:grid-cols-[minmax(0,46%)_1fr] lg:py-14">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-conversion-600 dark:text-conversion-500">
              {storeHero.eyebrow}
            </p>
            <h1 className="mt-3 text-balance font-display text-4xl font-semibold leading-[1.1] text-foreground sm:text-5xl lg:text-[56px]">
              {storeHero.title}
            </h1>
            <p className="mt-4 max-w-md text-base leading-7 text-muted-foreground">{storeHero.description}</p>

            <div className="mt-7 flex flex-wrap gap-3">
              <Button asChild variant="conversion" size="lg" className="px-6">
                <Link href="/shop/search">
                  Shop collection <ArrowRight aria-hidden="true" />
                </Link>
              </Button>
              {primaryCategory ? (
                <Button asChild variant="outline" size="lg" className="bg-surface px-6">
                  <Link href={`/shop/category/${primaryCategory.slug}`}>Explore {primaryCategory.name}</Link>
                </Button>
              ) : null}
            </div>

            <ul className="mt-8 grid grid-cols-2 gap-x-4 gap-y-4 sm:grid-cols-4">
              {storeHeroBenefits.map((item) => {
                const Icon = benefitIcons[item.id];
                return (
                  <li key={item.id} className="flex items-start gap-2">
                    <Icon className="mt-0.5 size-5 shrink-0 text-gold-500" aria-hidden="true" />
                    <span className="text-xs leading-4">
                      <span className="block font-semibold text-foreground">{item.title}</span>
                      <span className="block text-muted-foreground">{item.text}</span>
                    </span>
                  </li>
                );
              })}
            </ul>
          </div>
        </div>
      </Container>

      <div className="relative h-56 overflow-hidden sm:h-72 lg:hidden" aria-hidden="true">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={HERO_IMAGE} alt="" className="size-full object-cover object-[82%_center] dark:brightness-75" />
        <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background/70 to-transparent" />
      </div>
    </section>
  );
}
