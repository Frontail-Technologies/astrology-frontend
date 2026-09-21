import type { AstrologerListItem } from "../types/astrologer";
import { AstrologerCard } from "./astrologer-card";

export function RelatedAstrologers({
  astrologers,
}: {
  astrologers: AstrologerListItem[];
}) {
  if (astrologers.length === 0) return null;

  return (
    <section aria-labelledby="related-astrologers-heading">
      <h2
        id="related-astrologers-heading"
        className="font-display text-[28px] font-semibold text-foreground sm:text-[32px]"
      >
        Related Astrologers
      </h2>
      <p className="mt-2 max-w-xl text-[15px] leading-7 text-muted-foreground">
        Astrologers with overlapping expertise or languages.
      </p>
      <div className="mt-6 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {astrologers.map((astrologer) => (
          <AstrologerCard
            key={astrologer.slug}
            astrologer={astrologer}
            variant="compact"
          />
        ))}
      </div>
    </section>
  );
}
