"use client";

import Link from "next/link";
import { ArrowRight, Database } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { buttonVariants } from "@/components/ui/button";
import { masterDataLabels } from "../data/master-data";
import { useMasterDataRepository } from "../hooks/use-master-data-repository";
import type { MasterDataType } from "../types/master-data";
import { getMasterDataUsage } from "../utils/master-data";
import { getMasterDataIcon, masterDataVisuals } from "./master-data-visuals";

const cardTypes: MasterDataType[] = ["languages", "countries", "states", "cities", "expertise", "specialties", "tags", "consultation-modes", "pooja-categories"];

export function MasterDataOverview() {
  const { data } = useMasterDataRepository();
  const totalRecords = cardTypes.reduce((total, type) => total + data[type].length, 0);
  const activeRecords = cardTypes.reduce((total, type) => total + data[type].filter((record) => record.status === "active").length, 0);
  const used = (["expertise", "specialties", "pooja-categories", "tags"] as MasterDataType[])
    .flatMap((type) => data[type].map((record) => ({ type, record, ...getMasterDataUsage(type, record.id, data) })))
    .filter((item) => item.count > 0)
    .sort((a, b) => b.count - a.count)
    .slice(0, 5);
  const maxUsage = Math.max(1, ...used.map((item) => item.count));

  return <section className="space-y-5"><header className="flex flex-wrap items-center justify-between gap-3"><div className="flex items-center gap-3"><span className="grid size-10 place-items-center rounded-md bg-primary/10 text-primary"><Database className="size-5" aria-hidden="true" /></span><div><h1 className="font-sans text-xl font-semibold">Master Data</h1><p className="text-sm text-muted-foreground">Manage shared taxonomies and reference data.</p></div></div><div className="flex gap-2 text-xs"><span className="rounded-md bg-sky-500/10 px-2 py-1.5 text-sky-800"><strong>{totalRecords}</strong> records</span><span className="rounded-md bg-success/10 px-2 py-1.5 text-success"><strong>{activeRecords}</strong> active</span></div></header><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">{cardTypes.map((type) => { const records = data[type]; const active = records.filter((record) => record.status === "active").length; const inactive = records.length - active; const visual = masterDataVisuals[type]; const Icon = getMasterDataIcon(type); return <Card key={type} className="group border-border shadow-sm transition-all duration-150 hover:border-primary/30 hover:shadow-md"><CardContent className="flex h-full flex-col p-4"><div className="flex items-start justify-between gap-3"><span className={`grid size-10 place-items-center rounded-md ${visual.tileClass} ${visual.iconClass}`}><Icon className="size-5" aria-hidden="true" /></span><span className="text-2xl font-semibold tabular-nums">{records.length}</span></div><h2 className="mt-3 font-semibold">{masterDataLabels[type].plural}</h2><p className="mt-1 line-clamp-2 min-h-9 text-xs leading-4 text-muted-foreground">{masterDataLabels[type].description}</p><div className="mt-3 flex flex-wrap gap-1.5"><Badge variant="online">{active} Active</Badge>{inactive ? <Badge variant="muted" className="border-error/15 bg-error/8 text-error">{inactive} Inactive</Badge> : null}</div><Link href={`/admin/master-data/${type}`} className={buttonVariants({ variant: "outline", size: "sm", className: "mt-4 w-full border-primary/25 text-primary hover:bg-primary/5" })}>Manage {masterDataLabels[type].plural}<ArrowRight className="transition-transform duration-150 group-hover:translate-x-0.5" /></Link></CardContent></Card>; })}</div>{used.length ? <Card className="shadow-sm"><CardContent className="p-4"><div className="mb-3"><h2 className="font-semibold">Most used master data</h2><p className="text-xs text-muted-foreground">Derived from current catalog and profile records.</p></div><div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-5">{used.map((item, index) => { const visual = masterDataVisuals[item.type]; return <div key={`${item.type}-${item.record.id}`} className="rounded-md border border-border bg-muted/20 p-3"><div className="flex items-center justify-between gap-2"><span className={`grid size-5 place-items-center rounded ${visual.tileClass} ${visual.iconClass} text-[10px] font-semibold`}>{index + 1}</span><span className="text-xs text-muted-foreground">{masterDataLabels[item.type].singular}</span></div><p className="mt-2 truncate text-sm font-medium">{item.record.name}</p><div className="mt-2 flex items-center justify-between text-xs"><span className="font-medium tabular-nums">{item.count} {item.label}</span><span className="text-muted-foreground">Usage</span></div><div className="mt-1.5 h-1.5 overflow-hidden rounded-full bg-muted"><div className={`h-full rounded-full ${visual.barClass}`} style={{ width: `${Math.round((item.count / maxUsage) * 100)}%` }} /></div></div>; })}</div></CardContent></Card> : null}</section>;
}
