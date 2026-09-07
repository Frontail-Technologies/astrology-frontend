"use client";

import Image from "next/image";
import {
  ArrowRight,
  CheckCircle2,
  LockKeyhole,
  MessagesSquare,
  Orbit,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { SpiritualAmbientLayer } from "@/components/shared/spiritual-ambient-layer";
import { cn } from "@/lib/utils";

const astrologerAvatars = [
  {
    name: "Astrologer profile placeholder 1",
    initials: "A1",
    src: "/assets/astrology/avatars/astrologer-01.png",
  },
  {
    name: "Astrologer profile placeholder 2",
    initials: "A2",
    src: "/assets/astrology/avatars/astrologer-02.png",
  },
  {
    name: "Astrologer profile placeholder 3",
    initials: "A3",
    src: "/assets/astrology/avatars/astrologer-03.png",
  },
  {
    name: "Astrologer profile placeholder 4",
    initials: "A4",
    src: "/assets/astrology/avatars/astrologer-04.png",
  },
];

const trustItems = [
  {
    label: "Private Birth Details",
    icon: LockKeyhole,
  },
  {
    label: "Vedic Astrology",
    icon: Orbit,
  },
  {
    label: "Clear Explanations",
    icon: ShieldCheck,
  },
];

const valueBullets = [
  "Personal astrology guidance",
  "Free Kundli & daily horoscope tools",
];

export function HomepageHero() {
  function handleTalkToAstrologer() {
    toast("Astrologer consultation experience is coming next.");
  }

  function handleExploreTools() {
    toast("Astrology tools experience is coming next.");
  }

  return (
    <section
      className="relative isolate overflow-hidden bg-background text-foreground transition-colors duration-300"
    >
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(circle_at_76%_38%,color-mix(in_srgb,var(--gold-300)_32%,transparent),transparent_22rem),radial-gradient(circle_at_12%_12%,color-mix(in_srgb,var(--indigo-700)_10%,transparent),transparent_18rem)] dark:bg-[radial-gradient(circle_at_72%_34%,color-mix(in_srgb,var(--gold-400)_16%,transparent),transparent_22rem),radial-gradient(circle_at_10%_20%,color-mix(in_srgb,var(--indigo-700)_20%,transparent),transparent_24rem)]"
      />
      <SpiritualAmbientLayer variant="homepage" />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute left-[7%] top-24 hidden h-px w-16 rotate-[-18deg] bg-gold-400/40 lg:block"
      />
      <div
        aria-hidden="true"
        className="pointer-events-none absolute right-[44%] top-28 hidden size-1.5 rounded-full bg-gold-400/80 lg:block"
      />
      <div className="mx-auto grid min-h-[540px] w-full max-w-[1440px] items-center gap-10 px-4 pb-10 pt-12 sm:px-6 md:pb-12 md:pt-14 lg:grid-cols-[0.96fr_1.04fr] lg:gap-16 lg:px-8 lg:pb-8 lg:pt-12 xl:gap-24">
        <div className="max-w-[720px]">
          <div
            className="mb-5 inline-flex items-center gap-3 text-sm font-medium text-foreground"
          >
            <div
              className="-space-x-2.5 flex"
              aria-label="Available astrologers"
            >
              {astrologerAvatars.map((avatar, index) => (
                <Avatar
                  className={cn(
                    "size-8 border transition-all duration-200 hover:z-10 hover:-translate-y-0.5 hover:scale-[1.03]",
                    index === 3 && "hidden sm:flex",
                    "border-white ring-2 ring-white hover:border-gold-400 dark:border-obsidian-950 dark:ring-gold-400/28",
                  )}
                  key={avatar.src}
                >
                  <AvatarImage
                    alt={avatar.name}
                    className="object-cover"
                    src={avatar.src}
                  />
                  <AvatarFallback>{avatar.initials}</AvatarFallback>
                </Avatar>
              ))}
            </div>
            <span className="inline-flex items-center gap-2">
              <span
                className="size-2 rounded-full bg-success"
                aria-hidden="true"
              />
              Astrologers available now
            </span>
          </div>
          <h1 className="max-w-[720px] font-display text-[42px] font-semibold leading-[0.95] tracking-normal sm:text-5xl lg:text-[62px] xl:text-[66px]">
            <span className="block">Astrology for clarity.</span>
            <span
              className="block text-gold-500 dark:text-gold-300 lg:whitespace-nowrap"
            >
              Guidance for better decisions.
            </span>
          </h1>
          <p
            className="mt-5 max-w-xl text-base leading-7 text-muted-foreground sm:text-lg"
          >
            Talk to experienced astrologers or explore Kundli, horoscope,
            compatibility and Panchang in one modern astrology platform.
          </p>
          <div className="mt-6 flex gap-3 flex-col">
            {valueBullets.map((item) => (
              <div
                className={cn(
                  "inline-flex items-center gap-2 text-sm font-medium text-foreground",
                )}
                key={item}
              >
                <CheckCircle2
                  aria-hidden="true"
                  className="size-4 text-success dark:text-gold-300"
                />
                {item}
              </div>
            ))}
          </div>
          <div className="mt-7 flex flex-col gap-3 sm:flex-row">
            <Button
              className="h-11 px-5 transition-all duration-200 hover:-translate-y-px hover:shadow-[0_8px_22px_color-mix(in_srgb,var(--saffron-500)_20%,transparent)]"
              onClick={handleTalkToAstrologer}
              type="button"
              variant="conversion"
            >
              <MessagesSquare aria-hidden="true" />
              Talk to Astrologer
              <ArrowRight aria-hidden="true" />
            </Button>
            <Button
              className="h-11 border-gold-500/35 px-5 text-foreground transition-all duration-200 hover:-translate-y-px hover:bg-gold-300/20 dark:border-gold-400/35 dark:hover:bg-gold-300/10"
              onClick={handleExploreTools}
              type="button"
              variant="outline"
            >
              <Sparkles aria-hidden="true" />
              Explore Astrology Tools
            </Button>
          </div>
          <div
            className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-xs font-medium text-muted-foreground"
          >
            {trustItems.map((item) => {
              const Icon = item.icon;

              return (
                <div
                  className="inline-flex items-center gap-2"
                  key={item.label}
                >
                  <Icon
                    aria-hidden="true"
                    className="size-4 text-gold-500 dark:text-gold-300"
                  />
                  {item.label}
                </div>
              );
            })}
          </div>
        </div>
        <div className="relative mx-auto flex w-full max-w-[760px] items-center justify-center lg:justify-end">
          <div
            aria-hidden="true"
            className="absolute inset-8 -z-10 rounded-full bg-gold-300/24 blur-3xl dark:bg-gold-400/12"
          />
          <Image
            alt="Golden zodiac wheel and celestial astrology illustration"
            className="h-auto w-full max-w-[360px] object-contain sm:max-w-[460px] lg:max-w-[680px] xl:max-w-[760px]"
            height={1280}
            priority
            src="/assets/astrology/hero-zodiac-wheel.png"
            width={1280}
          />
        </div>
      </div>
    </section>
  );
}
