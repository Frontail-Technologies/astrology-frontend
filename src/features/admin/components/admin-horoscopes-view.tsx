"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { Pencil, Plus } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { defaultPeriodDates, periodLabels, zodiacSigns } from "@/features/horoscopes/data/horoscopes";
import { useHoroscopeRepository } from "@/features/horoscopes/hooks/use-horoscope-repository";
import type { HoroscopePeriod } from "@/features/horoscopes/types/horoscope";

export function AdminHoroscopesView() {
  const { records } = useHoroscopeRepository();
  const [period, setPeriod] = useState<HoroscopePeriod>("daily");
  const [dates, setDates] = useState(defaultPeriodDates);
  const date = dates[period];
  const entries = useMemo(() => new Map(records.filter((entry) => entry.period === period && entry.date === date).map((entry) => [entry.sign, entry])), [date, period, records]);
  const dateType = period === "monthly" ? "month" : "date";
  const updatePeriod = (value: string) => setPeriod(value as HoroscopePeriod);
  return <section className="space-y-4"><header className="flex flex-wrap items-end justify-between gap-3"><div className="flex items-center gap-3"><div><h1 className="font-sans text-xl font-semibold">Horoscopes</h1><p className="text-sm text-muted-foreground">Manage reflective zodiac content by period and date.</p></div></div><div className="w-48"><label htmlFor="horoscope-date" className="mb-1 block text-xs font-medium text-muted-foreground">{period === "weekly" ? "Week starting" : period === "monthly" ? "Month" : "Date"}</label><Input id="horoscope-date" type={dateType} className="h-9 bg-surface" value={date} onChange={(event) => setDates((current) => ({ ...current, [period]: event.target.value }))} /></div></header><Tabs value={period} onValueChange={updatePeriod}><TabsList variant="line">{(["daily", "weekly", "monthly"] as HoroscopePeriod[]).map((item) => <TabsTrigger key={item} value={item} >{periodLabels[item]}</TabsTrigger>)}</TabsList></Tabs><div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">{zodiacSigns.map((sign) => { const entry = entries.get(sign.key); const href = `/admin/horoscopes/${period}/${sign.key}?date=${encodeURIComponent(date)}`; return <Card key={sign.key} className="shadow-sm"><CardContent className="flex min-h-36 gap-3 p-4"><div className="size-14 shrink-0 overflow-hidden rounded-md bg-muted"><img src={sign.image} alt="" className="size-full object-cover" /></div><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div><h2 className="font-semibold">{sign.label}</h2><p className="text-xs text-muted-foreground">{periodLabels[period]} horoscope</p></div><Badge variant={entry?.status === "published" ? "online" : "outline"}>{entry ? (entry.status === "published" ? "Published" : "Draft") : "Missing"}</Badge></div><p className="mt-2 line-clamp-2 text-xs leading-5 text-muted-foreground">{entry?.overview || "No horoscope has been written for this date."}</p><div className="mt-2 flex justify-end"><Button asChild variant="ghost" size="sm"><Link href={href}>{entry ? <Pencil /> : <Plus />}{entry ? "Edit" : "Create"}</Link></Button></div></div></CardContent></Card>; })}</div></section>;
}
