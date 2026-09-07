export type PoojaCategory =
  | "new-beginnings"
  | "family-wellbeing"
  | "devotion"
  | "planetary"
  | "knowledge"
  | "prosperity"
  | "shiva";

export type PoojaQuickFact = {
  label: string;
  value: string;
};

export type PoojaRitualStep = {
  title: string;
  description: string;
};

export type PoojaOptionalSection = {
  title: string;
  body: string[];
};

/**
 * Editorial extension used only by the `/pooja/[slug]` detail screen. Kept
 * high-level per CONTENT_AND_SAFETY.md — no mantra text, mantra counts, exact
 * samagri lists, Muhurat rules, priest procedure, duration or price.
 */
export type PoojaDetail = {
  eyebrow?: string;
  overview: string[];
  quickFacts: PoojaQuickFact[];
  ritualSteps: PoojaRitualStep[];
  requiredDetails: string[];
  preparationNotes: string[];
  relatedSlugs: string[];
  optionalSection?: PoojaOptionalSection;
};

export type PoojaDefinition = {
  slug: string;
  name: string;
  shortDescription: string;
  imageSrc: string;
  categories: PoojaCategory[];
  featured?: boolean;
  status: "available" | "coming-soon";
  detail: PoojaDetail;
};

export type PoojaCategoryValue = "all" | PoojaCategory;

export type PoojaCategoryOption = {
  value: PoojaCategoryValue;
  label: string;
};
