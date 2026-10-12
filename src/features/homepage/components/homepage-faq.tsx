import { Container } from "@/components/layout/container";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { SectionHeading } from "./section-heading";

const questions = [
  {
    question: "How do I choose the right astrologer?",
    answer:
      "Compare profiles by expertise, languages, consultation modes, and approach. Choose the person whose experience best matches the question you want to explore.",
  },
  {
    question: "Are consultations available online?",
    answer:
      "Astrologer profiles show supported chat, voice, or video modes. Online booking is not available yet, and no consultation payment is currently taken on the website.",
  },
  {
    question: "What details should I keep ready before a consultation?",
    answer:
      "Keep your main question clear. Your date, time, and place of birth may also be useful when they are relevant to the guidance you request.",
  },
  {
    question: "What are astrology calculators used for?",
    answer:
      "Calculators provide structured astrology-based reflections from the details you enter. Tool availability varies, and results should be treated as guidance rather than certainty.",
  },
  {
    question: "How does online pooja work?",
    answer:
      "You can currently explore ritual context, preparation, and required details. Online pooja requests, priest assignment, payment, and livestreaming are not available yet.",
  },
  {
    question: "Is astrology guidance guaranteed to predict outcomes?",
    answer:
      "No. Astrology is presented as a traditional framework for reflection and perspective, not a guarantee of future outcomes or a substitute for professional advice.",
  },
] as const;

export function HomepageFaq() {
  return (
    <section id="faq" aria-labelledby="homepage-faq-heading" className="text-foreground">
      <Container className="max-w-[1440px] py-11 sm:py-14 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,0.7fr)_minmax(0,1.3fr)] lg:gap-14">
          <SectionHeading
            className="self-start"
            eyebrow="Good to know"
            headingId="homepage-faq-heading"
            title="First time here?"
            description="Common questions about astrology guidance, consultations and tools."
          />

          <Accordion className="w-full border-t border-gold-500/18 dark:border-gold-400/16" collapsible type="single">
            {questions.map(({ question, answer }, index) => (
              <AccordionItem
                className="border-gold-500/18 dark:border-gold-400/16"
                key={question}
                value={`question-${index + 1}`}
              >
                <AccordionTrigger className="min-h-14 rounded-none py-4 text-[15px] font-semibold text-foreground hover:text-conversion-500 dark:text-ivory-50 dark:hover:text-gold-300">
                  {question}
                </AccordionTrigger>
                <AccordionContent className="max-w-3xl pb-5 pr-8 text-sm leading-6 text-muted-foreground">
                  {answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>
      </Container>
    </section>
  );
}
