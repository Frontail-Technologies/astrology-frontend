"use client";

import Link from "next/link";

import { masterDataGroups, masterDataMeta } from "@/features/master-data/constants/master-data-entities";
import type { MasterDataEntity } from "@/features/master-data/types/master-data-admin";
import { cn } from "@/lib/utils";

/** Sibling entities of the same group (for example Countries · States · Cities). */
export function MasterDataSubnav({ entity }: { entity: MasterDataEntity }) {
  const group = masterDataGroups.find((item) => item.entities.includes(entity));
  if (!group) return null;
  return (
    <nav aria-label={group.label} className="-mx-1 flex gap-1 overflow-x-auto px-1">
      {group.entities.map((item) => (
        <Link
          key={item}
          href={`/admin/master-data/${item}`}
          aria-current={item === entity ? "page" : undefined}
          className={cn(
            "whitespace-nowrap rounded-md px-3 py-1.5 text-sm transition-colors focus-visible:ring-2 focus-visible:ring-ring",
            item === entity ? "bg-muted font-medium text-foreground" : "text-muted-foreground hover:bg-muted hover:text-foreground",
          )}
        >
          {masterDataMeta[item].plural}
        </Link>
      ))}
    </nav>
  );
}
