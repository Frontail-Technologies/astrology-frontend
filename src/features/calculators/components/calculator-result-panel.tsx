"use client";

import Image from "next/image";
import { ClipboardList, LockKeyhole } from "lucide-react";

export type ResultSummaryItem = { label: string; value: string };

type CalculatorResultPanelProps = {
  state: "idle" | "pending";
  title: string;
  illustrationSrc: string;
  illustrationAlt: string;
  resultSections: string[];
  summary: ResultSummaryItem[];
};

export function CalculatorResultPanel({
  state,
  title,
  illustrationSrc,
  illustrationAlt,
  resultSections,
  summary,
}: CalculatorResultPanelProps) {
  return (
    <section
      aria-labelledby="calculator-result-heading"
      aria-live="polite"
      className="rounded-2xl border border-gold-500/16 bg-ivory-50 p-6 dark:border-gold-400/16 dark:bg-espresso-900 sm:p-8"
    >
      <h2 id="calculator-result-heading" className="sr-only">
        {title}
      </h2>

      {state === "idle" ? (
        <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-start gap-4">
            <span className="grid size-14 shrink-0 place-items-center rounded-full bg-gold-300/25 text-gold-500 dark:bg-gold-400/12 dark:text-gold-300">
              <ClipboardList className="size-6" aria-hidden="true" />
            </span>
            <div>
              <p className="font-display text-xl font-semibold text-foreground sm:text-2xl">
                Your Compatibility Result Will Appear Here
              </p>
              <p className="mt-1.5 max-w-md text-sm leading-6 text-muted-foreground">
                Once you submit the details, your compatibility analysis will be
                generated here.
              </p>
              <div className="mt-4 flex items-start gap-2.5 rounded-lg border border-gold-500/16 bg-white/70 p-3 dark:border-gold-400/14 dark:bg-espresso-800/60">
                <LockKeyhole
                  className="mt-0.5 size-4 shrink-0 text-gold-500 dark:text-gold-300"
                  aria-hidden="true"
                />
                <p className="text-[12.5px] leading-5 text-muted-foreground">
                  <span className="font-semibold text-foreground/80">
                    The astrology calculation service is not connected yet.
                  </span>{" "}
                  Your submitted details are ready for calculation once the
                  astrology engine is connected.
                </p>
              </div>
            </div>
          </div>
          <div
            aria-hidden="true"
            className="relative hidden w-40 shrink-0 opacity-70 sm:block"
          >
            <Image
              src={illustrationSrc}
              alt=""
              width={320}
              height={320}
              className="h-auto w-full object-contain"
            />
          </div>
        </div>
      ) : (
        <div>
          <div className="flex items-start gap-2.5 rounded-lg border border-gold-500/20 bg-gold-300/12 p-3.5 dark:border-gold-400/18 dark:bg-gold-400/8">
            <LockKeyhole
              className="mt-0.5 size-4 shrink-0 text-gold-500 dark:text-gold-300"
              aria-hidden="true"
            />
            <p className="text-[13px] leading-6 text-foreground/80">
              <span className="font-semibold text-foreground">
                Compatibility calculation service is not connected yet.
              </span>{" "}
              Your submitted details are ready for calculation once the astrology
              engine is connected. No score or interpretation is generated until
              then.
            </p>
          </div>

          <div className="mt-6 grid gap-6 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
                Result structure
              </p>
              <ul className="mt-3 space-y-2.5">
                {resultSections.map((label) => (
                  <li
                    key={label}
                    className="flex items-center justify-between gap-3 rounded-lg border border-gold-500/14 bg-white px-3.5 py-2.5 text-[13.5px] font-medium text-foreground/80 dark:border-gold-400/14 dark:bg-espresso-800"
                  >
                    {label}
                    <span className="text-[11px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
                      Pending
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {summary.length > 0 ? (
              <div className="rounded-lg border border-gold-500/14 bg-white p-4 dark:border-gold-400/14 dark:bg-espresso-800">
                <p className="text-[11px] font-bold uppercase tracking-[0.14em] text-gold-500 dark:text-gold-300">
                  Birth Detail Summary
                </p>
                <dl className="mt-3 space-y-2">
                  {summary.map((item) => (
                    <div
                      key={item.label}
                      className="flex items-baseline justify-between gap-3 text-[13px]"
                    >
                      <dt className="text-muted-foreground">{item.label}</dt>
                      <dd className="text-right font-medium text-foreground/85">
                        {item.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </section>
  );
}
