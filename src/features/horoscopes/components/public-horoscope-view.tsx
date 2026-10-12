"use client";

import Image from "next/image";
import Link from "next/link";
import { BriefcaseBusiness, CalendarDays, Heart, Sparkles, SunMedium } from "lucide-react";
import { useMemo } from "react";

import { Container } from "@/components/layout/container";
import { Button } from "@/components/ui/button";
import { defaultPeriodDates, periodLabels, zodiacSigns } from "@/features/horoscopes/data/horoscopes";
import { useHoroscopeRepository } from "@/features/horoscopes/hooks/use-horoscope-repository";
import type { HoroscopePeriod, ZodiacSign } from "@/features/horoscopes/types/horoscope";
import { cn } from "@/lib/utils";

const periods: HoroscopePeriod[] = ["daily", "weekly", "monthly"];

function formatPeriod(period: HoroscopePeriod, value: string) {
  if (period === "monthly") {
    const [year, month] = value.split("-").map(Number);
    return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric", timeZone: "UTC" }).format(new Date(Date.UTC(year, month - 1, 1)));
  }
  const date = new Date(`${value}T00:00:00Z`);
  if (period === "daily") {
    return new Intl.DateTimeFormat("en-IN", { weekday: "long", day: "numeric", month: "long", year: "numeric", timeZone: "UTC" }).format(date);
  }
  const end = new Date(date);
  end.setUTCDate(end.getUTCDate() + 6);
  const formatter = new Intl.DateTimeFormat("en-IN", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  return `${formatter.format(date)} - ${formatter.format(end)}`;
}

export function PublicHoroscopeView({
  initialPeriod = "daily",
  initialSign = "taurus",
}: {
  initialPeriod?: HoroscopePeriod;
  initialSign?: ZodiacSign;
}) {
  const { records, ready } = useHoroscopeRepository();
  const sign = zodiacSigns.find((item) => item.key === initialSign) ?? zodiacSigns[1];
  const entry = useMemo(
    () =>
      records
        .filter((item) => item.period === initialPeriod && item.sign === sign.key && item.status === "published")
        .sort((a, b) => b.date.localeCompare(a.date))[0],
    [initialPeriod, records, sign.key],
  );
  const alternative = records.find((item) => item.period === initialPeriod && item.status === "published");
  const periodDate = entry?.date ?? defaultPeriodDates[initialPeriod];

  return (
    <main className="min-h-[70vh] bg-background text-foreground">
      <section className="border-b border-border bg-surface-muted">
        <Container className="max-w-[1440px] py-10 sm:py-14 lg:py-16">
          <div className="grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
            <div className="max-w-3xl">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-gold-500 dark:text-gold-300">Horoscopes</p>
              <h1 className="mt-3 font-display text-4xl font-semibold leading-tight sm:text-5xl lg:text-6xl">Guidance for every zodiac sign</h1>
              <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg">Explore published daily, weekly, and monthly guidance from the current horoscope library.</p>
            </div>
            <div className="flex max-w-full gap-1 overflow-x-auto rounded-lg border border-border bg-surface p-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden" aria-label="Horoscope period">
              {periods.map((period) => (
                <Link
                  className={cn(
                    "flex h-10 shrink-0 items-center rounded-md px-4 text-sm font-semibold transition-colors",
                    period === initialPeriod ? "bg-conversion-500 text-white dark:text-midnight-950" : "text-muted-foreground hover:bg-surface-muted hover:text-foreground",
                  )}
                  href={`/horoscope/${period}/${sign.key}`}
                  key={period}
                >
                  {periodLabels[period]}
                </Link>
              ))}
            </div>
          </div>
        </Container>
      </section>

      <Container className="max-w-[1440px] py-8 sm:py-10 lg:py-12">
        <nav aria-label="Zodiac signs" className="-mx-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden sm:mx-0 sm:px-0">
          <div className="flex w-max min-w-full gap-2 lg:grid lg:w-full lg:grid-cols-12">
            {zodiacSigns.map((item) => (
              <Link
                aria-current={item.key === sign.key ? "page" : undefined}
                className={cn(
                  "flex w-[88px] shrink-0 flex-col items-center gap-1 rounded-lg border px-2 py-3 text-center transition-colors lg:w-auto",
                  item.key === sign.key
                    ? "border-gold-500/55 bg-gold-300/20 text-foreground"
                    : "border-border bg-surface text-muted-foreground hover:border-gold-500/35 hover:text-foreground",
                )}
                href={`/horoscope/${initialPeriod}/${item.key}`}
                key={item.key}
              >
                <Image alt="" className="size-10 object-contain" height={48} src={item.image} width={48} />
                <span className="text-xs font-semibold">{item.label}</span>
              </Link>
            ))}
          </div>
        </nav>

        {!ready ? (
          <div className="mt-8 h-[440px] animate-pulse rounded-lg bg-surface-muted" aria-label="Loading horoscope" />
        ) : entry ? (
          <div className="mt-8 grid gap-6 lg:grid-cols-[minmax(0,1fr)_300px] lg:gap-8">
            <div>
              <header className="flex min-w-0 items-center gap-4 border-b border-border pb-6 sm:gap-6">
                <div className="grid size-20 shrink-0 place-items-center rounded-full bg-gold-300/15 sm:size-24">
                  <Image alt={`${sign.label} zodiac sign`} className="size-16 object-contain sm:size-20" height={96} src={sign.image} width={96} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-500">{periodLabels[initialPeriod]} horoscope</p>
                  <h2 className="mt-1 truncate font-display text-4xl font-semibold sm:text-5xl">{sign.label}</h2>
                  <p className="mt-2 flex items-center gap-2 text-sm text-muted-foreground"><CalendarDays aria-hidden="true" className="size-4 shrink-0" /> {formatPeriod(initialPeriod, periodDate)}</p>
                </div>
              </header>

              <section className="py-8" aria-labelledby="overview-heading">
                <div className="flex items-center gap-3"><Sparkles aria-hidden="true" className="size-5 text-gold-500" /><h3 className="text-lg font-semibold" id="overview-heading">Overview</h3></div>
                <p className="mt-4 max-w-4xl font-serif text-xl leading-9 text-foreground/85 sm:text-2xl sm:leading-10">{entry.overview}</p>
              </section>

              <div className="grid gap-4 border-t border-border pt-8 md:grid-cols-3">
                {[
                  { title: "Love", text: entry.love, icon: Heart },
                  { title: "Career", text: entry.career, icon: BriefcaseBusiness },
                  { title: "Wellbeing", text: entry.health, icon: SunMedium },
                ].map(({ title, text, icon: Icon }) => (
                  <section className="rounded-lg border border-border bg-surface p-5" key={title}>
                    <span className="grid size-9 place-items-center rounded-md bg-gold-300/20 text-gold-500"><Icon aria-hidden="true" className="size-4" /></span>
                    <h3 className="mt-4 font-semibold">{title}</h3>
                    <p className="mt-2 text-sm leading-6 text-muted-foreground">{text}</p>
                  </section>
                ))}
              </div>
            </div>

            <aside className="h-fit border-l-0 border-border lg:border-l lg:pl-8">
              <p className="text-xs font-bold uppercase tracking-[0.14em] text-gold-500">Explore another period</p>
              <div className="mt-4 space-y-2">
                {periods.filter((period) => period !== initialPeriod).map((period) => (
                  <Link className="flex min-h-12 items-center justify-between rounded-lg border border-border bg-surface px-4 text-sm font-semibold hover:border-gold-500/40" href={`/horoscope/${period}/${sign.key}`} key={period}>{periodLabels[period]} <span aria-hidden="true">→</span></Link>
                ))}
              </div>
              <p className="mt-6 text-xs leading-5 text-muted-foreground">Horoscope guidance is reflective and should not replace professional medical, legal, or financial advice.</p>
            </aside>
          </div>
        ) : (
          <div className="mx-auto flex max-w-xl flex-col items-center py-16 text-center sm:py-24">
            <span className="grid size-14 place-items-center rounded-full bg-gold-300/20 text-gold-500"><SunMedium aria-hidden="true" className="size-6" /></span>
            <h2 className="mt-5 font-display text-3xl font-semibold">No published {periodLabels[initialPeriod].toLowerCase()} horoscope for {sign.label}</h2>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">Guidance for this sign and period is not published yet. Choose another sign or period to continue.</p>
            {alternative ? <Button asChild className="mt-6" variant="conversion"><Link href={`/horoscope/${initialPeriod}/${alternative.sign}`}>View {periodLabels[initialPeriod].toLowerCase()} guidance</Link></Button> : null}
          </div>
        )}
      </Container>
    </main>
  );
}
