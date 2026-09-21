import Image from "next/image";

import { availabilityLabel } from "../data/astrologers";
import type { AstrologerListItem } from "../types/astrologer";
import { BookConsultationButton } from "./book-consultation-button";

/** Compact sticky sidebar card — does not duplicate the hero. */
export function AstrologerActionCard({
  astrologer,
}: {
  astrologer: AstrologerListItem;
}) {
  return (
    <div className="lg:sticky lg:top-40">
      <div className="rounded-2xl border border-gold-500/18 bg-white p-5 shadow-[0_1px_2px_rgba(23,32,51,0.05),0_10px_30px_-14px_rgba(23,32,51,0.22)] dark:border-gold-400/18 dark:bg-espresso-900 dark:shadow-[inset_0_1px_0_0_rgba(255,255,255,0.025)] sm:p-6">
        <div className="flex items-center gap-3.5">
          <Image
            src={astrologer.avatarSrc}
            alt=""
            width={112}
            height={112}
            className="size-14 shrink-0 rounded-full border border-gold-500/30 object-cover dark:border-gold-400/28"
          />
          <div className="min-w-0">
            <p className="font-display text-lg font-semibold leading-tight text-foreground">
              {astrologer.name}
            </p>
            <p className="mt-0.5 text-[12.5px] font-semibold text-gold-500 dark:text-gold-300">
              {astrologer.primaryExpertise}
            </p>
          </div>
        </div>

        <dl className="mt-5 space-y-3 border-t border-gold-500/14 pt-4 dark:border-gold-400/14">
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Languages
            </dt>
            <dd className="text-right text-[13px] font-medium text-foreground/85">
              {astrologer.languages.join(", ")}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Specialties
            </dt>
            <dd className="max-w-[10rem] text-right text-[13px] font-medium text-foreground/85">
              {astrologer.specialties.join(", ")}
            </dd>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <dt className="text-[12px] font-semibold uppercase tracking-[0.1em] text-muted-foreground">
              Status
            </dt>
            <dd className="text-right text-[13px] font-medium text-foreground/85">
              {availabilityLabel(astrologer.availability)}
            </dd>
          </div>
        </dl>

        <BookConsultationButton className="mt-5 w-full" />
        <p className="mt-3 text-[11.5px] leading-5 text-muted-foreground">
          Consultation booking is not available yet. No payment is taken.
        </p>
      </div>
    </div>
  );
}
