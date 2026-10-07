import { BadgeCheck, Gem, ListChecks, MessagesSquare } from "lucide-react";

import { Container } from "@/components/layout/container";
import { storeHeroBenefits } from "../content/store-content";
import { StoreBreadcrumb } from "./store-breadcrumb";
import { StoreImage } from "./store-image";

const benefitIcons = { natural: Gem, selected: BadgeCheck, details: ListChecks, guidance: MessagesSquare };
const SCENE = "/assets/astrology/calculators/categories/mystical_gemstone_astrology_altar.png";

type Props = {
  variant: "all" | "category" | "search";
  breadcrumb: Array<{ label: string; href?: string }>;
  title: string;
  description?: string;
  count?: number;
  imageSrc?: string;
};

export function CollectionHeader({ variant, breadcrumb, title, description, count, imageSrc }: Props) {
  if (variant === "search") {
    return (
      <section className="border-b border-border bg-surface-muted/50">
        <Container className="max-w-[1440px] py-6 sm:py-8">
          <StoreBreadcrumb items={breadcrumb} />
          <h1 className="mt-3 font-display text-3xl font-semibold text-foreground sm:text-4xl">{title}</h1>
          {description ? <p className="mt-1.5 text-sm text-muted-foreground">{description}</p> : null}
        </Container>
      </section>
    );
  }

  const useScene = variant === "all" || !imageSrc;

  return (
    <section className="relative isolate overflow-hidden border-b border-border bg-surface-muted/50">
      {useScene ? (
        <div className="absolute inset-0 -z-10 hidden lg:block" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SCENE} alt="" className="size-full object-cover object-[82%_center] dark:brightness-75" />
          <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-transparent lg:via-background/75" />
        </div>
      ) : null}

      <Container className="max-w-[1440px]">
        <div className="flex items-center justify-between gap-6 py-6 sm:py-8 lg:min-h-[240px]">
          <div className="max-w-xl">
            <StoreBreadcrumb items={breadcrumb} />
            <h1 className="mt-3 font-display text-4xl font-semibold leading-tight text-foreground sm:text-5xl">{title}</h1>
            {description ? <p className="mt-3 text-base leading-7 text-muted-foreground">{description}</p> : null}
            {count !== undefined ? (
              <p className="mt-2 text-sm font-medium text-foreground">
                {count} {count === 1 ? "product" : "products"}
              </p>
            ) : null}
            <ul className="mt-5 hidden flex-wrap gap-x-5 gap-y-2 sm:flex">
              {storeHeroBenefits.map((item) => {
                const Icon = benefitIcons[item.id];
                return (
                  <li key={item.id} className="flex items-center gap-1.5 text-xs font-medium text-foreground">
                    <Icon className="size-4 text-gold-500" aria-hidden="true" />
                    {item.title}
                  </li>
                );
              })}
            </ul>
          </div>

          {!useScene && imageSrc ? (
            <StoreImage
              src={imageSrc}
              alt=""
              className="size-24 shrink-0 rounded-2xl border border-border bg-gradient-to-br from-surface to-gold-300/25 p-3 sm:size-32 lg:size-52 lg:p-5"
            />
          ) : null}
        </div>
      </Container>

      {useScene ? (
        <div className="relative h-28 overflow-hidden sm:h-40 lg:hidden" aria-hidden="true">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={SCENE} alt="" className="size-full object-cover object-[82%_center] dark:brightness-75" />
        </div>
      ) : null}
    </section>
  );
}
