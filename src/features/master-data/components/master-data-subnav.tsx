"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { MasterDataType } from "../types/master-data";

const locationItems: Array<[MasterDataType, string]> = [["countries", "Countries"], ["states", "States"], ["cities", "Cities"]];
const taxonomyItems: Array<[MasterDataType, string]> = [["expertise", "Expertise"], ["specialties", "Specialties"], ["consultation-modes", "Consultation Modes"], ["pooja-categories", "Pooja Categories"], ["tags", "Tags"]];

export function MasterDataSubnav({ type }: { type: MasterDataType }) {
  const pathname = usePathname();
  const items = locationItems.some(([value]) => value === type) ? locationItems : taxonomyItems.some(([value]) => value === type) ? taxonomyItems : null;
  if (!items) return null;
  return <Tabs value={type}><TabsList variant="line">{items.map(([value, label]) => <TabsTrigger key={value} value={value} asChild ><Link href={`/admin/master-data/${value}`} aria-current={pathname.includes(`/master-data/${value}`) ? "page" : undefined}>{label}</Link></TabsTrigger>)}</TabsList></Tabs>;
}
