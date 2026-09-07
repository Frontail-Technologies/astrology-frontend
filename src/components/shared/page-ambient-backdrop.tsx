import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * PERSISTENT page-level ambient backdrop (D-018, level A).
 *
 * Fixed to the viewport so its motion continues through the whole scroll of a
 * public page — it is NOT clipped to a hero. Mounted once per public route by
 * `PublicAmbientController`. Purely decorative: `aria-hidden`,
 * `pointer-events-none`, `overflow-hidden`. CSS keyframes only (shared with the
 * local `SpiritualAmbientLayer`), deterministic config, disabled under
 * `prefers-reduced-motion` (globals.css).
 *
 * Stacking: this layer is `z-0`; the public content wrapper is `relative z-10`,
 * so the backdrop sits above the page background but behind every surface. It
 * shows through page gutters and section negative space, never through cards.
 *
 * Content is intentionally minimal: sparse gold dust on every route, plus
 * falling flower petals on Pooja routes. Mandala/chakra, incense smoke and
 * diya flame are NOT part of the global ambience — mandala assets are an
 * optional one-off composition asset only (spec §10); smoke/flame stay local.
 */

const AMBIENT = "/assets/astrology/ambient";

type Density = "all" | "md" | "lg";

function densityClass(density: Density): string {
  if (density === "md") return "ambient-hide-mobile";
  if (density === "lg") return "ambient-hide-mobile ambient-hide-tablet";
  return "";
}

type AmbientVars = CSSProperties & Record<`--${string}`, string | number>;

type PetalDescriptor = {
  src: string;
  left: string;
  size: number;
  duration: string;
  delay: string;
  drift: string;
  spin: string;
  maxOpacity: number;
  density: Density;
};

/* Lanes bias to gutters + open middle-background, away from content columns.
   `maxOpacity` is the LIGHT value (visible on Ivory, spec §6); dark scales down. */
const PAGE_PETALS: PetalDescriptor[] = [
  { src: "petals/marigold-petal-01.png", left: "6%", size: 24, duration: "19s", delay: "-4s", drift: "26px", spin: "220deg", maxOpacity: 0.5, density: "all" },
  { src: "petals/rose-petal-03.png", left: "92%", size: 20, duration: "22s", delay: "-11s", drift: "-22px", spin: "-200deg", maxOpacity: 0.42, density: "all" },
  { src: "petals/marigold-petal-04.png", left: "37%", size: 18, duration: "24s", delay: "-16s", drift: "18px", spin: "180deg", maxOpacity: 0.38, density: "all" },
  { src: "petals/rose-petal-02.png", left: "82%", size: 28, duration: "17s", delay: "-7s", drift: "-28px", spin: "240deg", maxOpacity: 0.44, density: "md" },
  { src: "petals/marigold-petal-06.png", left: "14%", size: 22, duration: "20s", delay: "-13s", drift: "24px", spin: "-220deg", maxOpacity: 0.46, density: "md" },
  { src: "petals/rose-petal-05.png", left: "64%", size: 20, duration: "23s", delay: "-2s", drift: "-16px", spin: "200deg", maxOpacity: 0.36, density: "lg" },
  { src: "petals/marigold-petal-02.png", left: "24%", size: 26, duration: "18s", delay: "-9s", drift: "30px", spin: "260deg", maxOpacity: 0.48, density: "lg" },
];

type ParticleDescriptor = {
  src: string;
  left: string;
  top: string;
  size: number;
  duration: string;
  delay: string;
  driftX: string;
  driftY: string;
  maxOpacity: number;
  density: Density;
};

/* Tiny sparse gold dust — never large cloudy blobs. Spread so they do not line
   up at similar x/y between sections (spec §12 / §13). */
const PAGE_PARTICLES: ParticleDescriptor[] = [
  { src: "particles/gold-particles-04.png", left: "9%", top: "22%", size: 104, duration: "27s", delay: "-6s", driftX: "16px", driftY: "-20px", maxOpacity: 0.16, density: "all" },
  { src: "particles/gold-particles-02.png", left: "83%", top: "58%", size: 120, duration: "31s", delay: "-17s", driftX: "-14px", driftY: "-14px", maxOpacity: 0.14, density: "all" },
  { src: "particles/gold-particles-01.png", left: "52%", top: "78%", size: 88, duration: "24s", delay: "-11s", driftX: "12px", driftY: "16px", maxOpacity: 0.12, density: "md" },
];

export type PageAmbientVariant =
  | "homepage"
  | "pooja"
  | "calculator"
  | "astrologer"
  | "astrology";

type PageAmbientBackdropProps = {
  variant: PageAmbientVariant;
};

export function PageAmbientBackdrop({ variant }: PageAmbientBackdropProps) {
  const showPetals = variant === "pooja";

  // Gold dust only — no mandala/chakra at page level for any route (spec §1).
  // Homepage keeps 3 sparse clusters; every other variant keeps 2.
  const particles =
    variant === "homepage" ? PAGE_PARTICLES : PAGE_PARTICLES.slice(0, 2);

  return (
    <div
      aria-hidden="true"
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      {particles.map((p, i) => (
        <img
          key={`page-particle-${i}`}
          src={`${AMBIENT}/${p.src}`}
          alt=""
          loading="lazy"
          decoding="async"
          className={cn("ambient-particle absolute", densityClass(p.density))}
          style={
            {
              left: p.left,
              top: p.top,
              width: `${p.size}px`,
              height: "auto",
              "--ambient-duration": p.duration,
              "--ambient-delay": p.delay,
              "--ambient-drift-x": p.driftX,
              "--ambient-drift-y": p.driftY,
              "--ambient-max-opacity": p.maxOpacity,
            } as AmbientVars
          }
        />
      ))}

      {showPetals
        ? PAGE_PETALS.map((petal, i) => (
            <img
              key={`page-petal-${i}`}
              src={`${AMBIENT}/${petal.src}`}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                "ambient-petal absolute top-[-8%]",
                densityClass(petal.density),
              )}
              style={
                {
                  left: petal.left,
                  width: `${petal.size}px`,
                  height: "auto",
                  "--ambient-duration": petal.duration,
                  "--ambient-delay": petal.delay,
                  "--ambient-drift": petal.drift,
                  "--ambient-spin": petal.spin,
                  "--ambient-max-opacity": petal.maxOpacity,
                } as AmbientVars
              }
            />
          ))
        : null}
    </div>
  );
}
