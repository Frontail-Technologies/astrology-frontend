"use client";

import { useState } from "react";
import { Heart, LockKeyhole } from "lucide-react";

import type { CalculatorDefinition } from "../types/calculator";
import {
  CalculatorResultPanel,
  type ResultSummaryItem,
} from "./calculator-result-panel";
import {
  LoveCompatibilityForm,
  type LoveCompatibilityValues,
} from "./tools/love-compatibility-form";

type CalculatorWorkspaceProps = {
  calculator: CalculatorDefinition;
};

function buildLoveSummary(
  values: LoveCompatibilityValues,
): ResultSummaryItem[] {
  const rows: ResultSummaryItem[] = [];
  const you = [values.personName, values.personDob, values.personTob]
    .filter(Boolean)
    .join(" · ");
  const partner = [values.partnerName, values.partnerDob, values.partnerTob]
    .filter(Boolean)
    .join(" · ");
  if (you) rows.push({ label: "You", value: you });
  if (values.personPlace) rows.push({ label: "Your birth place", value: values.personPlace });
  if (partner) rows.push({ label: "Partner", value: partner });
  if (values.partnerPlace)
    rows.push({ label: "Partner birth place", value: values.partnerPlace });
  return rows;
}

export function CalculatorWorkspace({ calculator }: CalculatorWorkspaceProps) {
  const detail = calculator.detail;
  const [resultState, setResultState] = useState<"idle" | "pending">("idle");
  const [summary, setSummary] = useState<ResultSummaryItem[]>([]);

  if (!detail) {
    return null;
  }

  function handleLoveSubmit(values: LoveCompatibilityValues) {
    // No engine yet — never fabricate a score/interpretation. We only echo the
    // details the user typed so the "Birth Detail Summary" is real data.
    setSummary(buildLoveSummary(values));
    setResultState("pending");
  }

  return (
    <div className="space-y-6">
      <section
        aria-labelledby="calculator-workspace-heading"
        className="rounded-2xl border border-gold-500/18 bg-white p-6 shadow-[0_1px_2px_rgba(23,32,51,0.05),0_18px_44px_-24px_rgba(23,32,51,0.3)] dark:border-gold-400/18 dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.025)] sm:p-8"
      >
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid size-11 shrink-0 place-items-center rounded-xl bg-conversion-500/12 text-conversion-600 dark:bg-conversion-500/14 dark:text-conversion-500">
              <Heart className="size-5" aria-hidden="true" />
            </span>
            <div>
              <h2
                id="calculator-workspace-heading"
                className="font-display text-[22px] font-semibold text-foreground sm:text-2xl"
              >
                Enter Birth Details
              </h2>
              {detail.intro ? (
                <p className="mt-1 text-[13.5px] leading-6 text-muted-foreground">
                  {detail.intro}
                </p>
              ) : null}
            </div>
          </div>

          <p className="flex items-start gap-2 rounded-lg border border-gold-500/16 bg-ivory-50 p-3 text-[12px] leading-5 text-muted-foreground dark:border-gold-400/14 dark:bg-espresso-800 sm:max-w-[320px]">
            <LockKeyhole
              className="mt-0.5 size-4 shrink-0 text-gold-500 dark:text-gold-300"
              aria-hidden="true"
            />
            {detail.privacyNote}
          </p>
        </div>

        {detail.form === "love-compatibility" ? (
          <LoveCompatibilityForm
            submitLabel={detail.submitLabel}
            onValidSubmit={handleLoveSubmit}
          />
        ) : null}
      </section>

      <CalculatorResultPanel
        state={resultState}
        title={`${calculator.name} result`}
        illustrationSrc={calculator.imageSrc}
        illustrationAlt={`${calculator.name} illustration`}
        resultSections={detail.resultSections}
        summary={summary}
      />
    </div>
  );
}
