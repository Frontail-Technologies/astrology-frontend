import type { CSSProperties } from "react";

import { cn } from "@/lib/utils";

/**
 * Reusable spiritual ambient motion system (D-018).
 *
 * Renders a decorative, deterministic set of transparent PNGs (petals, incense
 * smoke, gold particles) animated with CSS keyframes only
 * (transform / opacity). The layer is inert: `aria-hidden`, `pointer-events-none`,
 * `overflow-hidden`. All motion is disabled under `prefers-reduced-motion`
 * (handled in globals.css). Config is fixed — no `Math.random()` at render — so
 * SSR and client output match.
 *
 * Place it inside a `position: relative; overflow: hidden` hero, above the
 * background but below the hero's own artwork and all HTML content.
 */

const AMBIENT = "/assets/astrology/ambient";

type Density = "all" | "md" | "lg";

/** Density → visibility helper classes (see globals.css media queries). */
function densityClass(density: Density): string {
  if (density === "md") return "ambient-hide-mobile";
  if (density === "lg") return "ambient-hide-mobile ambient-hide-tablet";
  return "";
}

type AmbientVars = CSSProperties & Record<`--${string}`, string | number>;

/* -------------------------------------------------------------------------- */
/* Deterministic descriptors                                                   */
/* -------------------------------------------------------------------------- */

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

/**
 * Local hero accent petals only — the persistent page-level petal rain is
 * carried by `PageAmbientBackdrop`. Keep this to ≤2 so hero density is not
 * doubled (spec §15).
 */
const POOJA_PETALS: PetalDescriptor[] = [
  { src: "petals/marigold-petal-01.png", left: "80%", size: 30, duration: "13s", delay: "-9s", drift: "-24px", spin: "-180deg", maxOpacity: 0.5, density: "all" },
  { src: "petals/rose-petal-02.png", left: "90%", size: 22, duration: "16s", delay: "-2s", drift: "18px", spin: "200deg", maxOpacity: 0.42, density: "md" },
];

type SmokeDescriptor = {
  src: string;
  left: string;
  bottom: string;
  size: number;
  duration: string;
  delay: string;
  drift: string;
  maxOpacity: number;
  density: Density;
};

const POOJA_SMOKE: SmokeDescriptor[] = [
  { src: "smoke/incense-smoke-01.png", left: "68%", bottom: "-4%", size: 120, duration: "12s", delay: "-3s", drift: "14px", maxOpacity: 0.18, density: "all" },
  { src: "smoke/incense-smoke-02.png", left: "80%", bottom: "-8%", size: 150, duration: "10s", delay: "-7s", drift: "-10px", maxOpacity: 0.15, density: "md" },
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

const PARTICLES: ParticleDescriptor[] = [
  { src: "particles/gold-particles-04.png", left: "12%", top: "20%", size: 112, duration: "20s", delay: "-4s", driftX: "14px", driftY: "-18px", maxOpacity: 0.16, density: "all" },
  { src: "particles/gold-particles-02.png", left: "82%", top: "54%", size: 124, duration: "24s", delay: "-12s", driftX: "-12px", driftY: "-14px", maxOpacity: 0.14, density: "all" },
  { src: "particles/gold-particles-01.png", left: "56%", top: "12%", size: 92, duration: "18s", delay: "-8s", driftX: "10px", driftY: "16px", maxOpacity: 0.12, density: "md" },
];

/* -------------------------------------------------------------------------- */

export type SpiritualAmbientVariant =
  | "pooja"
  | "calculator"
  | "astrologer"
  | "homepage";

type SpiritualAmbientLayerProps = {
  variant: SpiritualAmbientVariant;
  intensity?: "low" | "medium";
  className?: string;
};

export function SpiritualAmbientLayer({
  variant,
  intensity = "low",
  className,
}: SpiritualAmbientLayerProps) {
  const showPetals = variant === "pooja";
  const showSmoke = variant === "pooja";
  // Diya flame is no longer buried in the hero — it is placed as a selective
  // edge accent via <DiyaFlameAccent /> in chosen Pooja sections instead.

  const intensityScale = intensity === "medium" ? 1.35 : 1;
  // No mandala/chakra in any local variant — the existing hero artwork
  // (Pooja illustration, zodiac wheel, category background) already carries the
  // circular astrology/devotional identity (spec §3–§8, §16).
  const particles =
    variant === "pooja" ? PARTICLES.slice(0, 1) : PARTICLES.slice(0, 2);

  return (
    <div
      aria-hidden="true"
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        className,
      )}
    >
      {particles.length > 0
        ? particles.map((p, i) => (
            <img
              key={`particle-${i}`}
              src={`${AMBIENT}/${p.src}`}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                "ambient-particle absolute",
                densityClass(p.density),
              )}
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
                  "--ambient-max-opacity": p.maxOpacity * intensityScale,
                } as AmbientVars
              }
            />
          ))
        : null}

      {showPetals
        ? POOJA_PETALS.map((petal, i) => (
            <img
              key={`petal-${i}`}
              src={`${AMBIENT}/${petal.src}`}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                "ambient-petal absolute top-[-6%]",
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
                  "--ambient-max-opacity": petal.maxOpacity * intensityScale,
                } as AmbientVars
              }
            />
          ))
        : null}

      {showSmoke
        ? POOJA_SMOKE.map((smoke, i) => (
            <img
              key={`smoke-${i}`}
              src={`${AMBIENT}/${smoke.src}`}
              alt=""
              loading="lazy"
              decoding="async"
              className={cn(
                "ambient-smoke absolute",
                densityClass(smoke.density),
              )}
              style={
                {
                  left: smoke.left,
                  bottom: smoke.bottom,
                  width: `${smoke.size}px`,
                  height: "auto",
                  "--ambient-duration": smoke.duration,
                  "--ambient-delay": smoke.delay,
                  "--ambient-drift": smoke.drift,
                  "--ambient-max-opacity": smoke.maxOpacity * intensityScale,
                } as AmbientVars
              }
            />
          ))
        : null}
    </div>
  );
}
