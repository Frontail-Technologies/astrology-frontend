"use client";

import { ImageOff } from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { getPoojaCategoryLabel, getPoojaStatusLabel } from "@/features/pooja/data/poojas";
import type { PoojaDefinition } from "@/features/pooja/types/pooja";

const statusVariant = {
  available: "online",
  "coming-soon": "pending",
} as const;

export function AdminPoojaDestination({ pooja, mode }: { pooja: PoojaDefinition; mode: "view" | "edit" }) {
  const title = mode === "edit" ? `Edit ${pooja.name}` : pooja.name;

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        
        <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      </div>
      <Card className="max-w-2xl shadow-sm">
        <CardContent className="flex items-start gap-4 p-5">
          <div className="relative flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-[calc(var(--radius)-3px)] bg-muted text-muted-foreground">
            <ImageOff className="size-5" aria-hidden="true" />
            <img
              src={pooja.imageSrc}
              alt=""
              className="absolute inset-0 size-full object-cover"
              onError={(event) => {
                event.currentTarget.style.display = "none";
              }}
            />
          </div>
          <div className="min-w-0 space-y-2">
            <p className="text-sm text-muted-foreground">{pooja.categories.map(getPoojaCategoryLabel).join(", ")}</p>
            <Badge variant={statusVariant[pooja.status]}>{getPoojaStatusLabel(pooja.status)}</Badge>
            <p className="text-sm text-muted-foreground">{pooja.shortDescription}</p>
            {mode === "edit" ? <p className="pt-2 text-sm text-muted-foreground">Editing requires the Admin API to be connected.</p> : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
