"use client";

import Link from "next/link";
import { Eye, ExternalLink, MoreHorizontal, Pencil, Trash2 } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { availabilityLabel } from "@/features/astrologers/data/astrologers";
import type { AstrologerListItem } from "@/features/astrologers/types/astrologer";

export function AstrologerMobileCard({
  astrologer,
  onDelete,
}: {
  astrologer: AstrologerListItem;
  onDelete: (astrologer: AstrologerListItem) => void;
}) {
  return (
    <Card className="shadow-sm">
      <CardContent className="space-y-4 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="flex min-w-0 items-center gap-3">
            <Avatar size="lg">
              <AvatarImage src={astrologer.avatarSrc} alt={astrologer.name} />
              <AvatarFallback>{astrologer.initials}</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <p className="truncate font-medium text-foreground">{astrologer.name}</p>
              <p className="truncate text-xs text-muted-foreground">{astrologer.primaryExpertise}</p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="size-8 shrink-0 p-0" aria-label={`Actions for ${astrologer.name}`}>
                <MoreHorizontal aria-hidden="true" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem asChild>
                <Link href={`/admin/astrologers/${astrologer.slug}`}><Eye aria-hidden="true" />View admin</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/admin/astrologers/${astrologer.slug}/edit`}><Pencil aria-hidden="true" />Edit</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href={`/astrologer/${astrologer.slug}`}><ExternalLink aria-hidden="true" />Public profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem variant="destructive" onSelect={() => onDelete(astrologer)}>
                <Trash2 aria-hidden="true" />Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
        <div className="flex items-center justify-between gap-3">
          <p className="text-sm text-muted-foreground">{astrologer.languages.join(", ")}</p>
          <Badge variant={astrologer.availability === "bookable" ? "online" : "muted"}>
            {availabilityLabel(astrologer.availability)}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
