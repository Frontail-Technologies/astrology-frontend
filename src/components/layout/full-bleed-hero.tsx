import type { ReactNode } from "react";
import Image from "next/image";

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { Container } from "@/components/layout/container";
import { cn } from "@/lib/utils";

export type HeroCrumb = {
  label: string;
  href?: string;
};

export type HeroAtmosphere = "default" | "planetary" | "shiva" | "knowledge";

type FullBleedHeroProps = {
  /**
   * Wide banner artwork rendered edge-to-edge behind the content (photographic
   * `object-cover` treatment). Omit to use the neutral atmospheric background
   * instead — required when the hero subject is a `foregroundImage`.
   */
  bgImage?: string;
  /**
   * Transparent subject PNG shown on the right of the hero (`object-contain`,
   * bottom-aligned). Used for detail pages where the hero must show the exact
   * illustration the user clicked from a listing.
   */
  foregroundImage?: string;
  foregroundAlt?: string;
  /** Soft radial gold halo behind the `foregroundImage`. */
  ambientHalo?: boolean;
  /** Subtle low-opacity background linework family for the atmospheric bg. */
  atmosphere?: HeroAtmosphere;
  /** Breadcrumb trail. The last entry (no `href`) renders as the current page. */
  crumbs: HeroCrumb[];
  children: ReactNode;
  /**
   * Container width for the breadcrumb + content grid. Match the page's own
   * container so the overlay aligns with everything below the banner.
   */
  containerClassName?: string;
  /** Width cap for the hero copy column. */
  contentClassName?: string;
  /**
   * Layout/height classes for the content box (min-heights + vertical padding).
   * Override for a shallower banner (e.g. product tool intro).
   */
  contentBoxClassName?: string;
  /** `object-position` utilities for the `bgImage`. */
  imagePositionClassName?: string;
  /**
   * Decorative ambient motion layer (e.g. `<SpiritualAmbientLayer />`). Rendered
   * above the background but below the fades, the foreground artwork and all
   * content. Must be inert (`pointer-events-none`, `aria-hidden`).
   */
  ambientSlot?: ReactNode;
  labelledBy?: string;
};

export function FullBleedHero({
  bgImage,
  foregroundImage,
  foregroundAlt = "",
  ambientHalo = false,
  atmosphere = "default",
  crumbs,
  children,
  containerClassName = "max-w-[1440px]",
  contentClassName = "max-w-[600px]",
  contentBoxClassName = "min-h-[520px] pb-12 pt-24 sm:min-h-[440px] sm:pt-24 lg:min-h-[500px] lg:pb-16",
  imagePositionClassName = "object-[72%_center] sm:object-[right_center]",
  ambientSlot,
  labelledBy,
}: FullBleedHeroProps) {
  return (
    <section
      aria-labelledby={labelledBy}
      className="relative isolate w-full overflow-hidden"
    >
      {/* Fallback ground behind the banner artwork */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-30 bg-ivory-50 dark:bg-obsidian-950"
      />

      {bgImage ? (
        /* Full-bleed background artwork — subject stays right, text side stays clean */
        <Image
          src={bgImage}
          alt=""
          aria-hidden="true"
          fill
          priority
          sizes="100vw"
          className={cn("-z-20 object-cover", imagePositionClassName)}
        />
      ) : (
        /* Neutral premium atmosphere — no identifiable subject */
        <div aria-hidden="true" className="absolute inset-0 -z-20">
          <div className="absolute inset-0 bg-[radial-gradient(120%_120%_at_85%_15%,color-mix(in_srgb,var(--gold-300)_18%,transparent),transparent_55%)] dark:bg-[radial-gradient(120%_120%_at_85%_15%,color-mix(in_srgb,var(--gold-400)_12%,transparent),transparent_55%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,transparent,color-mix(in_srgb,var(--gold-500)_5%,transparent))] dark:bg-[linear-gradient(180deg,transparent,color-mix(in_srgb,var(--espresso-800)_55%,transparent))]" />
          {atmosphere === "planetary" ? (
            <>
              <span className="absolute right-[8%] top-1/2 hidden h-[26rem] w-[26rem] -translate-y-1/2 rounded-full border border-gold-500/12 dark:border-gold-400/12 lg:block" />
              <span className="absolute right-[2%] top-1/2 hidden h-[38rem] w-[52rem] -translate-y-1/2 rotate-[-8deg] rounded-[50%] border border-gold-500/10 dark:border-gold-400/10 lg:block" />
            </>
          ) : (
            <>
              <span className="absolute right-[10%] top-1/2 hidden size-[24rem] -translate-y-1/2 rounded-full border border-gold-500/12 dark:border-gold-400/12 lg:block" />
              <span className="absolute right-[16%] top-1/2 hidden size-[34rem] -translate-y-1/2 rounded-full border border-gold-500/8 dark:border-gold-400/8 lg:block" />
            </>
          )}
        </div>
      )}

      {/* Ambient halo behind the subject PNG */}
      {foregroundImage && ambientHalo ? (
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 -z-20 hidden w-[46%] bg-[radial-gradient(circle_at_62%_58%,color-mix(in_srgb,var(--gold-400)_11%,transparent),transparent_62%)] dark:bg-[radial-gradient(circle_at_62%_58%,color-mix(in_srgb,var(--gold-400)_8%,transparent),transparent_60%)] lg:block"
        />
      ) : null}

      {/* Ambient motion layer — above background, below fades / artwork / content */}
      {ambientSlot}

      {/* Left fade — light mode. Directional: strong Ivory over the copy,
          clear by ~58% so the right ~42% of the artwork stays rich (spec §20/§21). */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 bg-gradient-to-r from-ivory-50 from-0% via-ivory-50/80 via-42% to-ivory-50/35 to-100% dark:hidden sm:via-ivory-50/52 sm:via-30% sm:to-transparent sm:to-58% lg:via-ivory-50/40 lg:via-26%"
      />
      {/* Left fade — dark mode */}
      <div
        aria-hidden="true"
        className="absolute inset-0 -z-10 hidden bg-gradient-to-r from-obsidian-950 from-0% via-obsidian-950/82 via-40% to-obsidian-950/25 to-100% dark:block sm:via-obsidian-950/58 sm:via-32% sm:to-transparent sm:to-60%"
      />

      {/* Subject PNG — right side, contained, bottom-aligned (desktop) */}
      {foregroundImage ? (
        <div className="pointer-events-none absolute inset-y-0 right-0 -z-10 hidden w-[42%] max-w-[560px] lg:right-[2%] lg:block xl:right-[4%]">
          <Image
            src={foregroundImage}
            alt=""
            aria-hidden="true"
            fill
            priority
            sizes="42vw"
            className="illustration-lift-lg object-contain object-bottom"
          />
        </div>
      ) : null}

      {/* Breadcrumb — absolute overlay, aligned to the page content grid */}
      <div className="absolute inset-x-0 top-6 z-10 sm:top-7">
        <Container className={containerClassName}>
          <Breadcrumb className="text-foreground/60 [text-shadow:0_1px_2px_rgba(255,255,255,0.35)] dark:text-ivory-50/70 dark:[text-shadow:0_1px_3px_rgba(0,0,0,0.55)]">
            <BreadcrumbList>
              {crumbs.map((crumb, index) => {
                const isLast = index === crumbs.length - 1;
                return (
                  <BreadcrumbItem key={crumb.label}>
                    {isLast || !crumb.href ? (
                      <BreadcrumbPage className="text-foreground dark:text-ivory-50">
                        {crumb.label}
                      </BreadcrumbPage>
                    ) : (
                      <>
                        <BreadcrumbLink href={crumb.href}>
                          {crumb.label}
                        </BreadcrumbLink>
                        <BreadcrumbSeparator />
                      </>
                    )}
                  </BreadcrumbItem>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </Container>
      </div>

      {/* Hero content — normal container alignment */}
      <Container className={cn("relative z-10", containerClassName)}>
        <div
          className={cn(
            "flex flex-col justify-center",
            contentBoxClassName,
            contentClassName,
          )}
        >
          {children}

          {/* Subject PNG — in-flow below the copy (mobile / tablet) */}
          {foregroundImage ? (
            <div className="mt-8 lg:hidden">
              <Image
                src={foregroundImage}
                alt={foregroundAlt}
                width={480}
                height={480}
                className="illustration-lift-lg mx-auto h-auto w-[260px] max-w-full object-contain sm:w-[300px]"
              />
            </div>
          ) : null}
        </div>
      </Container>
    </section>
  );
}
