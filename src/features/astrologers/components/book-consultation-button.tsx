"use client";

import { CalendarClock } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { cn } from "@/lib/utils";

/**
 * "Book Consultation" — the consultation route does not exist yet, so this is a
 * disabled, non-navigating control using the Coming Soon convention: the real
 * button is `disabled` (never dead-clickable) and a focusable wrapper exposes
 * the "coming soon" tooltip to hover, keyboard and screen readers.
 */
export function BookConsultationButton({ className }: { className?: string }) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span
            tabIndex={0}
            className={cn(
              "inline-flex cursor-not-allowed rounded-[calc(var(--radius)-2px)] outline-none focus-visible:ring-2 focus-visible:ring-gold-400 focus-visible:ring-offset-2 focus-visible:ring-offset-background",
              className,
            )}
          >
            <Button
              type="button"
              variant="conversion"
              disabled
              className="pointer-events-none w-full"
            >
              <CalendarClock aria-hidden="true" />
              Book Consultation
              <span className="sr-only">
                {" "}
                — consultation booking coming soon
              </span>
            </Button>
          </span>
        </TooltipTrigger>
        <TooltipContent>Consultation booking coming soon</TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
