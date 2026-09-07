"use client";

import { ArrowRight, Languages } from "lucide-react";
import { toast } from "sonner";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { AstrologerListItem } from "../types/astrologer";

type AstrologerCardProps = {
  astrologer: AstrologerListItem;
  variant?: "compact" | "listing";
};

function availabilityLabel(availability: AstrologerListItem["availability"]) {
  return availability === "bookable"
    ? "Available for booking"
    : "Booking opens soon";
}

function availabilityClassName(
  availability: AstrologerListItem["availability"],
) {
  return availability === "bookable" ? "bg-success" : "bg-gold-500";
}

export function AstrologerCard({
  astrologer,
  variant = "listing",
}: AstrologerCardProps) {
  const route = `/astrologer/${astrologer.slug}`;
  const shownSpecialties = astrologer.specialties.slice(0, 3);
  const remainingSpecialties =
    astrologer.specialties.length - shownSpecialties.length;

  function handleViewProfile() {
    toast(
      `${astrologer.name}'s profile opens when astrologer pages are connected.`,
    );
  }

  if (variant === "compact") {
    return (
      <article className="group relative flex h-full w-full flex-col overflow-hidden rounded-2xl border border-border bg-white p-5 shadow-[inset_0_1px_0_0_rgba(255,255,255,0.65)] transition-[transform,border-color,background-color,box-shadow] duration-200 ease-out hover:-translate-y-0.5 hover:border-gold-500/40 hover:bg-gold-300/10 dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(239,209,154,0.08)] dark:hover:border-gold-400/30 dark:hover:bg-espresso-700 dark:hover:shadow-[0_10px_32px_rgba(0,0,0,0.24),0_0_26px_color-mix(in_srgb,var(--gold-400)_5%,transparent)]">
        <span
          aria-hidden="true"
          className="pointer-events-none absolute -right-8 -top-8 size-24 rounded-full border border-gold-400/12"
        />
        <div className="relative flex items-center gap-4">
          <Avatar className="size-18 border border-gold-400/25 ring-2 ring-gold-300/15">
            <AvatarImage
              src={astrologer.avatarSrc}
              alt=""
              className="object-cover"
            />
            <AvatarFallback className="bg-surface-muted text-lg font-medium text-foreground">
              {astrologer.initials}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <h3 className="font-sans text-[17px] font-bold text-foreground">
              {astrologer.name}
            </h3>
            <p className="mt-0.5 text-[13px] leading-5 text-muted-foreground">
              {astrologer.primaryExpertise} · {astrologer.specialties[0]}
            </p>
          </div>
        </div>

        <div className="relative mt-5 space-y-2.5 border-t border-border/60 pt-4">
          <p className="inline-flex items-center gap-2 text-[13px] text-foreground/80">
            <Languages
              aria-hidden="true"
              className="size-4 text-gold-500 dark:text-gold-300"
            />
            {astrologer.languages.join(", ")}
          </p>
          <p className="inline-flex items-center gap-2 text-[13px] text-muted-foreground">
            <span
              aria-hidden="true"
              className={cn(
                "size-1.5 rounded-full",
                availabilityClassName(astrologer.availability),
              )}
            />
            {availabilityLabel(astrologer.availability)}
          </p>
        </div>

        <div className="relative mt-auto pt-6">
          <Button
            type="button"
            variant="conversion"
            onClick={handleViewProfile}
            data-route={route}
            aria-label={`View profile for ${astrologer.name}`}
            className="w-full transition-all duration-200 hover:-translate-y-px"
          >
            View Profile
          </Button>
        </div>
      </article>
    );
  }

  return (
    <article className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-gold-500/22 bg-white p-5 text-foreground shadow-[0_1px_2px_rgba(23,32,51,0.05),0_8px_22px_rgba(75,52,24,0.05),inset_0_1px_0_0_rgba(255,255,255,0.9)] transition-[transform,border-color,background-color] duration-200 ease-out hover:-translate-y-0.5 hover:border-gold-500/40 dark:border-gold-400/18 dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(239,209,154,0.08)] dark:hover:border-gold-400/40 dark:hover:bg-espresso-700">
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-10 -top-10 size-28 rounded-full border border-gold-500/18 dark:border-gold-400/16"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute right-6 top-6 size-1 rounded-full bg-gold-500/45 dark:bg-gold-400/40"
      />

      <div className="relative flex items-start gap-4">
        <div className="relative shrink-0">
          <Avatar className="size-20 border border-gold-500/22 ring-2 ring-ivory-100 transition-[border-color] duration-200 group-hover:border-gold-500/45 dark:border-gold-400/25 dark:ring-gold-300/16 sm:size-[84px]">
            <AvatarImage
              src={astrologer.avatarSrc}
              alt={astrologer.name}
              className="object-cover"
            />
            <AvatarFallback className="bg-surface-muted text-lg font-medium text-foreground">
              {astrologer.initials}
            </AvatarFallback>
          </Avatar>
          <span
            aria-hidden="true"
            className={cn(
              "absolute bottom-1 right-1 size-3.5 rounded-full ring-2 ring-white dark:ring-espresso-900",
              availabilityClassName(astrologer.availability),
            )}
          />
        </div>

        <div className="min-w-0 flex-1">
          <h2 className="font-sans text-lg font-bold leading-6 text-foreground">
            {astrologer.name}
          </h2>
          <p className="mt-1 text-[13px] font-bold text-gold-500 dark:text-gold-300">
            {astrologer.primaryExpertise}
          </p>
          <p className="mt-1.5 inline-flex items-center gap-2 text-[13px] text-muted-foreground">
            <Languages
              aria-hidden="true"
              className="size-4 text-gold-500 dark:text-gold-300"
            />
            {astrologer.languages.join(" · ")}
          </p>
          <p className="mt-1.5 inline-flex items-center gap-2 text-[13px] font-medium text-foreground/80">
            <span
              aria-hidden="true"
              className={cn(
                "size-2 rounded-full",
                availabilityClassName(astrologer.availability),
              )}
            />
            {availabilityLabel(astrologer.availability)}
          </p>
        </div>
      </div>

      <div className="relative mt-4 flex flex-wrap gap-1.5">
        {shownSpecialties.map((specialty) => (
          <span
            className="rounded-md border border-border/50 bg-ivory-100 px-2 py-0.5 text-[11px] font-medium text-muted-foreground dark:border-gold-400/12 dark:bg-obsidian-950/40 dark:text-ivory-50/72"
            key={specialty}
          >
            {specialty}
          </span>
        ))}
        {remainingSpecialties > 0 ? (
          <span className="px-1.5 py-0.5 text-[11px] font-medium text-muted-foreground">
            +{remainingSpecialties} more
          </span>
        ) : null}
      </div>

      <div className="relative mt-auto border-t border-border/70 pt-3.5 dark:border-gold-400/16">
        <Button
          type="button"
          variant="conversion"
          onClick={handleViewProfile}
          data-route={route}
          aria-label={`View profile for ${astrologer.name}`}
          className="w-full transition-colors duration-200"
        >
          View Profile
          <ArrowRight
            aria-hidden="true"
            className="transition-transform duration-200 group-hover:translate-x-0.5"
          />
        </Button>
      </div>
    </article>
  );
}
