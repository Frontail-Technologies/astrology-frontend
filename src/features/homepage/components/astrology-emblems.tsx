import { CalendarDays, HeartHandshake, Moon, Orbit, Sun } from "lucide-react";

import { cn } from "@/lib/utils";

/**
 * Shared square "emblem" visuals for astrology tool discovery: a composed
 * mini illustration (orbit / chart / ring geometry behind a centred Lucide
 * icon) rather than a bare icon in a plain chip. `tone="onDark"` is for
 * placement on a fixed-midnight surface (e.g. the Kundli feature panel or the
 * Explore featured card) where colours must not react to the light/dark
 * toggle; `tone="surface"` (default) adapts via `dark:` for ordinary cards.
 */
export type EmblemTone = "surface" | "onDark";

export type EmblemProps = {
  size?: number;
  tone?: EmblemTone;
  className?: string;
};

function shellClasses(tone: EmblemTone) {
  return tone === "onDark"
    ? "border-gold-400/25 bg-gold-400/10 text-gold-300"
    : "border-gold-500/24 bg-gold-300/14 text-gold-500 dark:border-gold-400/25 dark:bg-gold-400/10 dark:text-gold-300";
}

function lineClasses(tone: EmblemTone) {
  return tone === "onDark"
    ? "text-gold-300/45"
    : "text-gold-500/35 dark:text-gold-300/40";
}

export function EmblemShell({
  size = 60,
  tone = "surface",
  className,
  children,
}: EmblemProps & { children: React.ReactNode }) {
  return (
    <span
      style={{ width: size, height: size }}
      className={cn(
        "relative grid shrink-0 place-items-center overflow-hidden rounded-2xl border transition-colors duration-200",
        shellClasses(tone),
        className,
      )}
    >
      {children}
    </span>
  );
}

function IconLayer({ children }: { children: React.ReactNode }) {
  return (
    <span className="relative z-10 grid place-items-center">{children}</span>
  );
}

export function KundliEmblem({ size = 60, tone = "surface", className }: EmblemProps) {
  const iconSize = Math.round(size * 0.42);
  return (
    <EmblemShell size={size} tone={tone} className={className}>
      <svg
        viewBox="0 0 64 64"
        className={cn("absolute inset-0 h-full w-full", lineClasses(tone))}
        fill="none"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="1" />
        <rect
          x="19"
          y="19"
          width="26"
          height="26"
          stroke="currentColor"
          strokeWidth="1"
          transform="rotate(45 32 32)"
        />
        <circle cx="32" cy="8" r="1.6" fill="currentColor" />
        <circle cx="54" cy="32" r="1.6" fill="currentColor" />
        <circle cx="18" cy="46" r="1.6" fill="currentColor" />
      </svg>
      <IconLayer>
        <Orbit aria-hidden="true" size={iconSize} />
      </IconLayer>
    </EmblemShell>
  );
}

export function HoroscopeEmblem({ size = 60, tone = "surface", className }: EmblemProps) {
  const iconSize = Math.round(size * 0.42);
  return (
    <EmblemShell size={size} tone={tone} className={className}>
      <svg
        viewBox="0 0 64 64"
        className={cn("absolute inset-0 h-full w-full", lineClasses(tone))}
        fill="none"
        aria-hidden="true"
      >
        <circle
          cx="32"
          cy="32"
          r="24"
          stroke="currentColor"
          strokeWidth="1"
          strokeDasharray="4 5"
        />
        <line x1="32" y1="2" x2="32" y2="8" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="62" y1="32" x2="56" y2="32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="32" y1="62" x2="32" y2="56" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
        <line x1="2" y1="32" x2="8" y2="32" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
      </svg>
      <IconLayer>
        <Sun aria-hidden="true" size={iconSize} />
      </IconLayer>
    </EmblemShell>
  );
}

export function CompatibilityEmblem({ size = 60, tone = "surface", className }: EmblemProps) {
  const iconSize = Math.round(size * 0.38);
  return (
    <EmblemShell size={size} tone={tone} className={className}>
      <svg
        viewBox="0 0 64 64"
        className={cn("absolute inset-0 h-full w-full", lineClasses(tone))}
        fill="none"
        aria-hidden="true"
      >
        <circle cx="24" cy="32" r="16" stroke="currentColor" strokeWidth="1" />
        <circle cx="40" cy="32" r="16" stroke="currentColor" strokeWidth="1" />
        <line
          x1="24"
          y1="14"
          x2="40"
          y2="50"
          stroke="currentColor"
          strokeWidth="0.75"
          strokeDasharray="2 3"
        />
        <circle cx="24" cy="14" r="1.6" fill="currentColor" />
        <circle cx="40" cy="50" r="1.6" fill="currentColor" />
      </svg>
      <IconLayer>
        <HeartHandshake aria-hidden="true" size={iconSize} />
      </IconLayer>
    </EmblemShell>
  );
}

export function PanchangEmblem({ size = 60, tone = "surface", className }: EmblemProps) {
  const iconSize = Math.round(size * 0.38);
  const tickCount = 8;
  const ticks = Array.from({ length: tickCount }, (_, index) => index);

  return (
    <EmblemShell size={size} tone={tone} className={className}>
      <svg
        viewBox="0 0 64 64"
        className={cn("absolute inset-0 h-full w-full", lineClasses(tone))}
        fill="none"
        aria-hidden="true"
      >
        <circle cx="32" cy="32" r="24" stroke="currentColor" strokeWidth="1" />
        {ticks.map((index) => {
          const angle = (index / tickCount) * Math.PI * 2;
          const x1 = 32 + Math.cos(angle) * 21;
          const y1 = 32 + Math.sin(angle) * 21;
          const x2 = 32 + Math.cos(angle) * 24;
          const y2 = 32 + Math.sin(angle) * 24;
          return (
            <line
              key={index}
              x1={x1}
              y1={y1}
              x2={x2}
              y2={y2}
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
            />
          );
        })}
      </svg>
      <IconLayer>
        <CalendarDays aria-hidden="true" size={iconSize} />
      </IconLayer>
      <span
        aria-hidden="true"
        className={cn(
          "absolute bottom-1 right-1 z-10 grid place-items-center rounded-full",
          tone === "onDark" ? "bg-obsidian-950/70" : "bg-surface/85",
        )}
        style={{ width: size * 0.3, height: size * 0.3 }}
      >
        <Moon size={Math.max(10, Math.round(size * 0.17))} />
      </span>
    </EmblemShell>
  );
}
