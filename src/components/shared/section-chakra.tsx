import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * Selective, LOCAL chakra/mandala decoration (D-018). Opt-in per composition —
 * there is no route-driven / global mandala. Rules: at most ONE visible per
 * viewport, never behind deity faces / astrologer portraits / busy hero
 * backgrounds / the footer, never repeated down page gutters. Prefer a partial
 * crop from a section edge over showing the whole circle.
 *
 * Inert (`aria-hidden`, `pointer-events-none`). Rotation reuses the shared
 * `ambient-mandala-rotate` keyframe (very slow, no pulse/scale) and is frozen
 * under `prefers-reduced-motion`; pass `spin={false}` for a static frame.
 */
type SectionChakraProps = {
  /** Positioning + sizing utilities (e.g. `-right-40 top-1/2 w-[34rem]`). */
  className?: string;
  size?: "large" | "small";
  spin?: boolean;
  /** Extra-low opacity for busier compositions. */
  faint?: boolean;
};

export function SectionChakra({
  className,
  size = "large",
  spin = true,
  faint = false,
}: SectionChakraProps) {
  return (
    <img
      aria-hidden="true"
      src={`/assets/astrology/ambient/mandala/mandala-chakra-${size}.png`}
      alt=""
      loading="lazy"
      decoding="async"
      className={cn(
        "pointer-events-none absolute aspect-square select-none",
        faint
          ? "opacity-[0.045] dark:opacity-[0.09]"
          : "opacity-[0.075] dark:opacity-[0.12]",
        spin && "ambient-mandala",
        className,
      )}
      style={
        spin
          ? ({ "--ambient-duration": "96s" } as CSSProperties &
              Record<string, string>)
          : undefined
      }
    />
  );
}
