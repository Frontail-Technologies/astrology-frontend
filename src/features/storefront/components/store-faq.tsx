"use client";

import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import type { StoreFaq as StoreFaqItem } from "@/features/store/types/store";

export function StoreFaq({ items, title = "Frequently asked questions" }: { items: StoreFaqItem[]; title?: string }) {
  if (!items.length) return null;
  return (
    <section aria-labelledby="store-faq-heading">
      <h2 id="store-faq-heading" className="font-display text-2xl font-semibold text-foreground sm:text-3xl">
        {title}
      </h2>
      <Accordion type="single" collapsible className="mt-5 rounded-xl border border-border bg-surface px-5">
        {items.map((item, index) => (
          <AccordionItem key={item.question} value={`faq-${index}`}>
            <AccordionTrigger className="text-left text-sm font-medium">{item.question}</AccordionTrigger>
            <AccordionContent className="text-sm leading-6 text-muted-foreground">{item.answer}</AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
