import type { CSSProperties } from "react";
import Image from "next/image";

import { cn } from "@/lib/utils";

/**
 * Motion rules: every planet orbits clockwise; a counter-rotation on the sprite
 * keeps each PNG upright (no self-spin, no flips); Saturn's ring angle is fixed;
 * the Sun is a static anchor with only a breathing glow.
 *
 * Decorative animated solar system for the homepage hero (right column).
 *
 * Pure CSS/SVG — no client JS, no Canvas/WebGL. Animation rules live in
 * `globals.css` (`.solar-*`). Everything is sized in `cqw` (container width) so
 * the scene scales with its column. Planets orbit in a tilted, squashed plane
 * and are counter-transformed to stay round and upright. This is an artistic
 * composition, not an astronomy simulation: sizes, radii and speeds are
 * illustrative only and no labels or measurements are shown.
 */

const BASE = "/assets/astrology/solar-system";

type Body = {
  name: string;
  src: string;
  /** Orbit radius (cqw, horizontal semi-axis). */
  r: number;
  /** Image size (cqw). */
  size: number;
  /** Orbit duration (s). */
  d: number;
  /** Negative start delay (s) — deterministic starting position on the orbit. */
  delay: number;
  /** Hidden on small screens to keep the mobile scene light. */
  desktopOnly?: boolean;
  /** Only Earth: carries the Moon as a nested satellite system. */
  hasMoon?: boolean;
};

const BODIES: Body[] = [
  { name: "Mercury", src: `${BASE}/mercury.png`, r: 15, size: 4.0, d: 18, delay: -4, desktopOnly: true },
  { name: "Venus", src: `${BASE}/venus.png`, r: 19.5, size: 5.6, d: 24, delay: -13, desktopOnly: true },
  { name: "Earth", src: `${BASE}/earth.png`, r: 24, size: 6.0, d: 32, delay: -8, hasMoon: true },
  { name: "Mars", src: `${BASE}/mars.png`, r: 28.5, size: 4.9, d: 40, delay: -30 },
  { name: "Jupiter", src: `${BASE}/jupiter.png`, r: 34, size: 11.8, d: 60, delay: -10 },
  { name: "Saturn", src: `${BASE}/saturn.png`, r: 39, size: 15.7, d: 78, delay: -60 },
  { name: "Uranus", src: `${BASE}/uranus.png`, r: 43, size: 8.3, d: 98, delay: -29 },
  { name: "Neptune", src: `${BASE}/neptune.png`, r: 46.5, size: 8.3, d: 120, delay: -80, desktopOnly: true },
];

/**
 * The Moon is Earth's satellite (never a Sun-orbiting planet). It needs its own
 * transparent `moon.png`; if the asset is missing it is simply not rendered —
 * no other body is ever substituted for it.
 */
const MOON_SRC = `${BASE}/moon.png`;
const MOON = {
  size: 1.9, // cqw — clearly smaller than Earth (6.0)
  r: 5.2, // cqw — small orbit local to Earth
  d: 6, // s — much faster than Earth's Sun-orbit
  delay: -1.5,
  tilt: 14, // deg — local plane tilt, distinct from the Sun plane
  squash: 0.55,
};
/** Public path checked by the server page to decide whether the Moon renders. */
export const MOON_PUBLIC_PATH = `public${MOON_SRC}`;

/** Fixed star positions (x%, y%, radius px, alpha) — deterministic, no randomness. */
const STARS: Array<[number, number, number, number]> = [
  [7, 14, 1.2, 0.9], [14, 74, 1, 0.7], [22, 38, 1.3, 0.85], [31, 88, 1, 0.6],
  [39, 10, 1.1, 0.8], [47, 62, 0.9, 0.55], [58, 6, 1.2, 0.85], [66, 90, 1, 0.65],
  [74, 24, 1.3, 0.9], [82, 70, 1, 0.7], [90, 12, 1.1, 0.8], [95, 52, 1.2, 0.85],
  [5, 50, 0.9, 0.55], [52, 94, 1, 0.6], [86, 92, 0.9, 0.55], [28, 22, 0.9, 0.5],
];

const STAR_LAYER = STARS.map(
  ([x, y, r, a]) =>
    `radial-gradient(${r}px ${r}px at ${x}% ${y}%, rgba(255,243,215,${a}), transparent 70%)`,
).join(",");

/** Light mode: only a handful of tiny antique-gold points at very low opacity. */
const STAR_LAYER_LIGHT = STARS.slice(0, 6)
  .map(
    ([x, y, r]) =>
      `radial-gradient(${r + 0.4}px ${r + 0.4}px at ${x}% ${y}%, rgba(200,146,45,0.12), transparent 70%)`,
  )
  .join(",");

type Vars = CSSProperties & Record<`--${string}`, string | number>;

function bodyVars(body: Body): Vars {
  // Starting angle (deg, clockwise from the +x axis) implied by the negative delay.
  const phase = ((-body.delay / body.d) * 360) % 360;
  const s = Math.sin((phase * Math.PI) / 180); // > 0 = front half of the orbit
  return {
    "--r": body.r,
    "--size": body.size,
    "--d": body.d,
    "--phase": phase.toFixed(2),
    "--pd": body.delay,
    // Static (reduced-motion) depth state — same range as the animation.
    "--depth-scale": (0.975 + 0.055 * s).toFixed(3),
    "--depth-op": (0.89 + 0.11 * s).toFixed(3),
    zIndex: s > 0 ? 3 : 1,
  };
}

export function AnimatedSolarSystem({
  className,
  moonAvailable = false,
}: {
  className?: string;
  /** True only when `moon.png` exists (checked server-side). */
  moonAvailable?: boolean;
}) {
  return (
    <div
      role="img"
      aria-label="Decorative illustration of the Sun and planets in slow orbit"
      className={cn(
        "solar-stage relative aspect-[3/2] w-full select-none",
        className,
      )}
    >
      {/* Backdrop. Light: only a soft warm-gold radial + a tiny Sun halo on the
          Ivory hero (no grey/brown patch). Dark: warm-dark vignette, nebula
          glow and the richer starfield. Masked so it feathers into the page. */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute -inset-[6%] [mask-image:radial-gradient(ellipse_58%_60%_at_50%_50%,#000_38%,transparent_78%)]"
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_55%_50%,rgba(216,154,24,0.12)_0%,rgba(216,154,24,0.05)_35%,rgba(216,154,24,0.015)_58%,transparent_75%)] dark:bg-[radial-gradient(ellipse_60%_62%_at_50%_50%,rgba(28,18,10,0.7),rgba(20,14,9,0.4)_55%,transparent_80%)]" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(247,179,47,0.1),transparent_30%)] dark:hidden" />
        <div className="absolute inset-0 hidden bg-[radial-gradient(circle_at_28%_66%,rgba(176,96,40,0.16),transparent_34%),radial-gradient(circle_at_74%_30%,rgba(196,140,60,0.14),transparent_38%)] opacity-90 dark:block" />
        <div className="solar-stars-drift absolute inset-0">
          <div
            className="solar-stars absolute inset-0 dark:hidden"
            style={{ backgroundImage: STAR_LAYER_LIGHT }}
          />
          <div
            className="solar-stars absolute inset-0 hidden dark:block"
            style={{ backgroundImage: STAR_LAYER }}
          />
        </div>
      </div>

      <div className="solar-plane">
        {/* Orbit paths — SVG circles in the squashed plane render as ellipses.
            Inner orbits are slightly stronger; outer ones soften. */}
        <svg
          aria-hidden="true"
          viewBox="-50 -50 100 100"
          overflow="visible"
          className="pointer-events-none absolute text-gold-500/[0.28] dark:text-gold-400/[0.34]"
          style={{
            width: "100cqw",
            height: "100cqw",
            left: "-50cqw",
            top: "-50cqw",
          }}
        >
          {BODIES.map((body, index) => (
            <circle
              key={body.name}
              r={body.r}
              fill="none"
              stroke="currentColor"
              strokeWidth={1.2}
              strokeOpacity={1 - index * 0.078}
              vectorEffect="non-scaling-stroke"
              className={body.desktopOnly ? "max-sm:hidden" : undefined}
            />
          ))}
        </svg>

        {/* Sun — visual anchor; glow pulses, the body does not. */}
        <div className="solar-sun">
          <div aria-hidden="true" className="solar-glow" />
          <Image
            src={`${BASE}/sun.png`}
            alt=""
            width={360}
            height={360}
            priority
            draggable={false}
            sizes="(min-width: 1024px) 220px, 130px"
            className="solar-body drop-shadow-[0_0_18px_rgba(255,150,40,0.45)]"
            style={{ "--size": 35, "--pm": 1 } as Vars}
          />
        </div>

        {BODIES.map((body) => (
          <div
            key={body.name}
            className={cn("solar-orbit", body.desktopOnly && "max-sm:hidden")}
            style={bodyVars(body)}
          >
            <div className="solar-arm">
              <div className="solar-upright">
                <div className="solar-undo">
                  <div className="solar-depth">
                    {body.hasMoon && moonAvailable ? (
                      <div
                        className="solar-moon-plane"
                        style={
                          {
                            "--mt": `${MOON.tilt}deg`,
                            "--ms": MOON.squash,
                            "--mr": MOON.r,
                            "--md": MOON.d,
                            "--mpd": MOON.delay,
                            "--mphase": ((-MOON.delay / MOON.d) * 360).toFixed(2),
                          } as Vars
                        }
                      >
                        <span aria-hidden="true" className="solar-moon-ring" />
                        <div className="solar-moon-earth">
                          <Image
                            src={body.src}
                            alt=""
                            width={220}
                            height={220}
                            draggable={false}
                            sizes="(min-width: 1024px) 110px, 70px"
                            className="solar-body"
                          />
                        </div>
                        <div
                          className="solar-moon-orbit"
                          style={{ zIndex: 1 }}
                        >
                          <div className="solar-moon-arm">
                            <div className="solar-moon-upright">
                              <div className="solar-moon-undo">
                                <Image
                                  src={MOON_SRC}
                                  alt=""
                                  width={64}
                                  height={64}
                                  draggable={false}
                                  sizes="24px"
                                  className="solar-body"
                                  style={{ "--size": MOON.size } as Vars}
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <Image
                        src={body.src}
                        alt=""
                        width={220}
                        height={220}
                        draggable={false}
                        sizes="(min-width: 1024px) 110px, 70px"
                        className="solar-body"
                      />
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
