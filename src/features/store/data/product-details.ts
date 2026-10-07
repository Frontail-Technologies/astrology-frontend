import type { CategoryDetails, ProductDetails } from "../types/store";

/** Seed editorial content for Admin/Storefront UI development. Wording avoids guarantees by design. */
export const productDetailsBySlug: Record<string, ProductDetails> = {
  "blue-sapphire": {
    overview: [
      "Blue sapphire, known as Neelam in Vedic tradition, is a gemstone traditionally associated with Saturn.",
      "Each stone is selected for clarity and colour, and is commonly set in a ring or pendant.",
    ],
    highlights: [
      "Traditionally associated with Saturn in Vedic astrology",
      "Commonly chosen for ring or pendant settings",
      "Selected for clarity and colour",
    ],
    specifications: [
      { label: "Gemstone", value: "Blue sapphire (Neelam)" },
      { label: "Form", value: "Loose stone" },
    ],
    careInstructions: [
      "Clean gently with lukewarm water and a soft cloth.",
      "Store separately to avoid scratches from harder stones.",
      "Remove before using harsh cleaning products.",
    ],
    faq: [
      {
        question: "Is a gemstone recommendation personal?",
        answer:
          "In Vedic tradition, gemstone choice is usually considered alongside an individual's chart. An astrologer can help you decide whether a stone suits your practice.",
      },
    ],
  },
  "yellow-sapphire": {
    overview: [
      "Yellow sapphire, known as Pukhraj, is traditionally associated with Jupiter in Vedic astrology.",
    ],
    highlights: ["Traditionally associated with Jupiter", "Often selected for ring settings"],
    careInstructions: ["Clean gently with lukewarm water and a soft cloth.", "Store separately from harder stones."],
  },
  "red-coral": {
    overview: ["Red coral, known as Moonga, is traditionally associated with Mars in Vedic astrology."],
    highlights: ["Traditionally associated with Mars", "A natural, organic gem material"],
    careInstructions: [
      "Wipe gently with a soft, dry cloth.",
      "Keep away from perfumes, acids and prolonged moisture, as coral is a soft material.",
    ],
  },
  "five-mukhi-rudraksha": {
    overview: [
      "The five-mukhi (Panchmukhi) rudraksha is among the most commonly used forms in traditional practice.",
      "It is often chosen for daily wear or for stringing into a mala.",
    ],
    highlights: [
      "Commonly used in traditional daily practice",
      "Suitable for mala stringing or pendant use",
      "A natural seed, so each bead varies slightly",
    ],
    specifications: [
      { label: "Type", value: "5 Mukhi (Panchmukhi)" },
      { label: "Material", value: "Natural rudraksha seed" },
    ],
    careInstructions: [
      "Keep dry and wipe with a soft cloth.",
      "Occasionally apply a little natural oil to prevent drying.",
      "Avoid contact with strong chemicals and perfumes.",
    ],
    faq: [
      {
        question: "How do I choose a rudraksha?",
        answer:
          "Mukhi (the number of natural lines on the bead) is the usual starting point. If you are unsure, a five-mukhi bead is the most commonly used form.",
      },
    ],
  },
  "one-mukhi-rudraksha": {
    overview: ["The one-mukhi rudraksha is a rare form that is traditionally held in high regard."],
    highlights: ["Rare form with a single natural line", "A natural seed, so each bead varies slightly"],
    careInstructions: ["Keep dry and wipe with a soft cloth.", "Avoid contact with strong chemicals and perfumes."],
  },
};

export const categoryDetailsBySlug: Record<string, CategoryDetails> = {
  gemstones: {
    about: [
      "Gemstones have a long place in Vedic tradition, where each stone is associated with a particular planet.",
      "Our gemstones are presented with clear descriptions so you can choose with confidence.",
    ],
    highlights: ["Natural stones", "Clear product descriptions", "Support if you need help choosing"],
    faq: [
      {
        question: "How should I care for a gemstone?",
        answer:
          "Clean gently with lukewarm water and a soft cloth, store it separately from harder stones, and avoid harsh chemicals.",
      },
    ],
  },
  rudraksha: {
    about: [
      "Rudraksha beads are natural seeds that are widely used in traditional practice, often as a mala or pendant.",
      "Beads are classified by mukhi, the number of natural lines on the surface.",
    ],
    highlights: ["Natural seeds", "Different mukhi options", "Suitable for mala or pendant use"],
    faq: [
      {
        question: "Are rudraksha beads natural?",
        answer: "Yes. Rudraksha is a natural seed, so every bead differs slightly in size, shape and surface.",
      },
    ],
  },
};
