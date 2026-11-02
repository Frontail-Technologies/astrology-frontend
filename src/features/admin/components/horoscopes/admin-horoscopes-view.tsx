"use client";

import Link from "next/link";
import { useMemo } from "react";
import { ChevronRight } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { horoscopePeriodLabels, horoscopePeriods, horoscopeStatusLabels, horoscopeStatusVariants, zodiacSignImage, zodiacSignLabels, zodiacSigns } from "@/features/horoscopes/constants/horoscope-status";
import { useHoroscopeGrid, useHoroscopeGridState } from "@/features/horoscopes/hooks/use-horoscope-admin";
import type { HoroscopePeriod, ManagedHoroscope, ZodiacSign } from "@/features/horoscopes/types/horoscope-admin";
import { cn } from "@/lib/utils";
import { formatDateLong } from "../../lib/format";
import { AdminErrorState } from "../shared/admin-list-states";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";

const dateLabels: Record<HoroscopePeriod, string> = { daily: "Date", weekly: "Week starting", monthly: "Month" };

/** Human label for the period the grid is showing. */
function periodTitle(period: HoroscopePeriod, date: string) {
  if (period === "monthly") return new Intl.DateTimeFormat("en-IN", { month: "long", year: "numeric" }).format(new Date(`${date}T00:00:00`));
  const long = formatDateLong(`${date}T00:00:00`);
  return period === "weekly" ? `Week starting ${long}` : long;
}

export function AdminHoroscopesView() {
  const grid = useHoroscopeGridState();
  const { state } = grid;
  const entries = useHoroscopeGrid(state);
  const bySign = useMemo(() => new Map<ZodiacSign, ManagedHoroscope>((entries.data ?? []).map((entry) => [entry.sign, entry])), [entries.data]);
  const written = bySign.size;
  const published = [...bySign.values()].filter((entry) => entry.status === "published").length;
  const periodLabel = horoscopePeriodLabels[state.period].toLowerCase();

  return (
    <section className="space-y-5" aria-busy={entries.isFetching || undefined}>
      <h1 className="sr-only">Horoscopes</h1>
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-surface p-4 md:flex-row md:items-end md:justify-between md:px-5">
        <div className="min-w-0 space-y-3">
          <Tabs value={state.period} onValueChange={(value) => grid.setPeriod(value as HoroscopePeriod)}>
            <TabsList variant="line" aria-label="Horoscope period">
              {horoscopePeriods.map((period) => (
                <TabsTrigger key={period} value={period}>
                  {horoscopePeriodLabels[period]}
                </TabsTrigger>
              ))}
            </TabsList>
          </Tabs>
          <div>
            <p className="text-base font-semibold text-foreground">{periodTitle(state.period, state.date)}</p>
            <p className="mt-0.5 text-[13px] tabular-nums text-muted-foreground">
              {entries.data ? `${written} of 12 signs written · ${published} published` : "Loading…"}
            </p>
          </div>
        </div>
        <div className="w-full md:w-52">
          <label htmlFor="horoscope-date" className="mb-1.5 block text-[13px] text-muted-foreground">
            {dateLabels[state.period]}
          </label>
          <Input
            id="horoscope-date"
            type={state.period === "monthly" ? "month" : "date"}
            className="bg-surface"
            value={grid.inputValue}
            onChange={(event) => grid.setDate(event.target.value)}
          />
        </div>
      </div>

      {entries.error ? (
        <AdminErrorState error={entries.error} onRetry={entries.reload} title="Could not load horoscopes" />
      ) : (
        <ul className={cn("grid gap-3 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4", entries.isFetching && "opacity-70 transition-opacity")} aria-label={`${horoscopePeriodLabels[state.period]} horoscopes by sign`}>
          {zodiacSigns.map((sign) => {
            const entry = bySign.get(sign);
            const href = `/admin/horoscopes/${state.period}/${sign}?date=${encodeURIComponent(state.date)}`;
            const signLabel = zodiacSignLabels[sign];
            return (
              <li key={sign}>
                <Link
                  href={href}
                  aria-label={`${entry ? "Edit" : "Write"} ${signLabel} ${periodLabel} horoscope`}
                  className={cn(
                    "group flex h-full gap-3 rounded-xl border bg-surface p-4 outline-none transition-colors hover:border-foreground/20 focus-visible:ring-2 focus-visible:ring-ring",
                    entry ? "border-border" : "border-dashed border-border",
                  )}
                >
                  <div className="size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
                    {/* eslint-disable-next-line @next/next/no-img-element -- bundled zodiac artwork */}
                    <img src={zodiacSignImage(sign)} alt="" className="size-full object-cover" />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h2 className="text-[15px] font-semibold text-foreground">{signLabel}</h2>
                      {!entries.ready ? (
                        <Skeleton className="h-6 w-20 rounded-full" />
                      ) : entry ? (
                        <AdminStatusBadge status={entry.status} labels={horoscopeStatusLabels} variants={horoscopeStatusVariants} />
                      ) : (
                        <AdminStatusPill tone="neutral">Not written</AdminStatusPill>
                      )}
                    </div>
                    <p className="mt-1.5 line-clamp-2 min-h-10 text-[13px] leading-5 text-muted-foreground">
                      {!entries.ready ? "Loading…" : entry ? entry.overview : `No ${periodLabel} guidance yet.`}
                    </p>
                    <span className="mt-2 inline-flex items-center gap-0.5 self-end text-[13px] font-medium text-foreground/80 group-hover:text-foreground">
                      {entry ? "Edit" : "Write"}
                      <ChevronRight className="size-3.5" aria-hidden="true" />
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
