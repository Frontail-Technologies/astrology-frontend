"use client";

import Link from "next/link";
import { ArrowRight } from "lucide-react";

import { cn } from "@/lib/utils";
import {
  CompatibilityEmblem,
  HoroscopeEmblem,
  KundliEmblem,
  PanchangEmblem,
  type EmblemProps,
} from "./astrology-emblems";

export type ServiceEmblemKey = "kundli" | "horoscope" | "compatibility" | "panchang";

export type AstrologyServiceCardProps = {
  title: string;
  description: string;
  emblem: ServiceEmblemKey;
  href?: string;
};

const EMBLEMS: Record<ServiceEmblemKey, React.ComponentType<EmblemProps>> = {
  kundli: KundliEmblem,
  horoscope: HoroscopeEmblem,
  compatibility: CompatibilityEmblem,
  panchang: PanchangEmblem,
};

export function AstrologyServiceCard({
  title,
  description,
  emblem,
  href,
}: AstrologyServiceCardProps) {
  const Emblem = EMBLEMS[emblem];

  return (
    <article
      className={cn(
        "group relative flex h-full flex-col justify-between gap-4 rounded-2xl border border-border bg-white p-4 text-left sm:min-h-[172px] sm:p-5 lg:min-h-[180px]",
        "shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(239,209,154,0.08)]",
        "transition-[transform,border-color] duration-200 ease-out",
        "hover:-translate-y-0.5 hover:border-gold-500/40 dark:hover:border-gold-400/40",
        "has-focus-visible:-translate-y-0.5 has-focus-visible:border-gold-500/45 dark:has-focus-visible:border-gold-400/45",
        "has-focus-visible:ring-2 has-focus-visible:ring-gold-400 has-focus-visible:ring-offset-2 has-focus-visible:ring-offset-background",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <Emblem size={60} />
        <span className="text-xs font-medium text-muted-foreground">{href ? "Explore" : "Coming soon"}</span>
      </div>
      <div className="space-y-1">
        <h3 className="font-sans text-[15px] font-semibold text-foreground lg:text-base">
          {href ? <Link className="inline-flex items-center gap-2 hover:text-gold-500" href={href}>{title} <ArrowRight aria-hidden="true" className="size-3.5" /></Link> : title}
        </h3>
        <p className="text-[13px] leading-5 text-muted-foreground lg:text-sm lg:leading-6">
          {description}
        </p>
      </div>
    </article>
  );
}
