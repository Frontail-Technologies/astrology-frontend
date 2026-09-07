import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * Selective ritual flame accent (D-018). A single diya flame PNG with a very
 * small warm halo, placed at the OUTER EDGE of a Pooja-related section — never
 * floating in the middle of the page, never on Calculator/Astrologer pages,
 * never over deity artwork. Inert: `aria-hidden`, `pointer-events-none`.
 *
 * Motion reuses the shared `ambient-diya-flicker` keyframe (subtle scale/opacity
 * modulation, ~2.4s) and is frozen under `prefers-reduced-motion`. Position with
 * `className` (e.g. `absolute -left-4 top-8`).
 */
type DiyaFlameAccentProps = {
  className?: string;
  /** Desktop flame width in px (mobile is scaled down). Range ~42–64. */
  size?: number;
};

export function DiyaFlameAccent({ className, size = 52 }: DiyaFlameAccentProps) {
  return (
    <span
      aria-hidden="true"
      className={cn("pointer-events-none absolute", className)}
      style={{ "--flame-w": `${size}px` } as CSSProperties & Record<string, string>}
    >
      <span
        aria-hidden="true"
        className="absolute left-1/2 top-[46%] size-[88px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(circle,color-mix(in_srgb,var(--conversion-500)_12%,transparent),transparent_70%)] sm:size-[128px]"
      />
      <img
        src="/assets/astrology/ambient/flame/diya-flame-01.png"
        alt=""
        loading="lazy"
        decoding="async"
        className="ambient-flame relative block w-[32px] drop-shadow-[0_3px_6px_rgba(110,70,20,0.12)] sm:w-[var(--flame-w)] dark:drop-shadow-[0_3px_8px_rgba(0,0,0,0.4)]"
        style={{ "--ambient-duration": "2.4s" } as CSSProperties & Record<string, string>}
      />
    </span>
  );
}
