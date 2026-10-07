"use client";

import Link from "next/link";
import { Eye, ExternalLink, ImageOff, MoreHorizontal, Pencil, Star, Trash2 } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { getPoojaCategoryLabel, getPoojaStatusLabel } from "@/features/pooja/data/poojas";
import { getPoojaContentCompleteness } from "@/features/pooja/selectors/pooja-domain";
import type { PoojaDefinition } from "@/features/pooja/types/pooja";

const statusVariant = {
  available: "online",
  "coming-soon": "pending",
} as const;

export function PoojaMobileCard({ pooja, onDelete }: { pooja: PoojaDefinition; onDelete: (pooja: PoojaDefinition) => void }) {
  const completeness = getPoojaContentCompleteness(pooja);

  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <div className="relative flex size-12 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--radius)-3px)] bg-muted text-muted-foreground">
              <ImageOff className="size-4" aria-hidden="true" />
              <img
                src={pooja.imageSrc}
                alt=""
                className="absolute inset-0 size-full object-cover"
                onError={(event) => {
                  event.currentTarget.style.display = "none";
                }}
              />
            </div>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{pooja.name}</p>
              <p className="truncate text-xs text-muted-foreground">{pooja.categories.map(getPoojaCategoryLabel).join(", ")}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 shrink-0 p-0" aria-label={`Actions for ${pooja.name}`}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/poojas/${pooja.slug}`}><Eye aria-hidden="true" />View</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/poojas/${pooja.slug}/edit`}><Pencil aria-hidden="true" />Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/pooja/${pooja.slug}`}><ExternalLink aria-hidden="true" />Open public page</Link>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(pooja)}>
                <Trash2 aria-hidden="true" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant={statusVariant[pooja.status]}>{getPoojaStatusLabel(pooja.status)}</Badge>
          {pooja.featured ? <span className="inline-flex items-center gap-1 text-xs text-muted-foreground"><Star className="size-3.5 fill-current text-primary" aria-hidden="true" />Featured</span> : null}
          <span className="text-xs text-muted-foreground">{completeness.percentage}% complete</span>
        </div>
      </CardContent>
    </Card>
  );
}
