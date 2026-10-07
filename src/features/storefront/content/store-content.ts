import type { StoreFaq } from "@/features/store/types/store";

export const storeHero = {
  eyebrow: "Astrology Store",
  title: "Authentic spiritual products for your practice",
  description:
    "Discover carefully selected rudraksha, gemstones and sacred essentials, described clearly so you can choose with confidence.",
};

export const storeHeroBenefits = [
  { id: "natural", title: "Natural materials", text: "Described honestly" },
  { id: "selected", title: "Carefully selected", text: "For quality and clarity" },
  { id: "details", title: "Clear details", text: "Shown where known" },
  { id: "guidance", title: "Expert guidance", text: "Ask an astrologer" },
] as const;

export const storeTrustItems = [
  { id: "natural", title: "Natural materials", text: "Products are described honestly, with care guidance." },
  { id: "selected", title: "Carefully selected", text: "Chosen for quality, clarity and traditional use." },
  { id: "details", title: "Clear details", text: "Specifications appear only where they are known." },
  { id: "guidance", title: "Expert guidance", text: "Not sure what to choose? Speak with an astrologer." },
] as const;

export const storeUtilityMessages = {
  left: "Natural, carefully selected spiritual products",
  helpLabel: "Need help choosing?",
  helpHref: "/astrologers",
};

export const rudrakshaEditorial = {
  eyebrow: "Tradition meets purpose",
  title: "Why choose rudraksha?",
  intro:
    "Rudraksha beads are natural seeds that have been used in traditional practice for generations, often as a mala or pendant.",
  points: [
    { title: "Natural seed", text: "Every bead is unique in size, shape and surface." },
    { title: "Different mukhi options", text: "Beads are classified by the number of natural lines on the surface." },
    { title: "Simple to use", text: "Commonly worn as a pendant or strung into a mala for daily practice." },
  ],
  note: "Traditional significance varies by belief and practice. Choose what feels meaningful to you.",
};

export const storeFaqs: StoreFaq[] = [
  {
    question: "How do I choose a rudraksha?",
    answer:
      "Mukhi, the number of natural lines on a bead, is the usual starting point. If you are unsure, a five-mukhi bead is the most commonly used form. An astrologer can help you decide.",
  },
  {
    question: "Are your products natural?",
    answer:
      "Product pages describe the material of each item. Natural products such as rudraksha seeds and gemstones can vary slightly from one piece to the next.",
  },
  {
    question: "How should I care for a gemstone?",
    answer:
      "Clean it gently with lukewarm water and a soft cloth, store it separately from harder stones, and avoid harsh chemicals. Each product page lists specific care notes where available.",
  },
  {
    question: "How long does delivery take?",
    answer: "Online ordering is not open yet. Delivery timelines will be shown clearly at checkout once it launches.",
  },
  {
    question: "Can I return a product?",
    answer: "Return terms will be confirmed at checkout once online ordering opens.",
  },
];

export const collectionIntro = {
  title: "All products",
  description:
    "Explore our carefully selected collection of gemstones, rudraksha beads and sacred essentials.",
};

export const collectionGuidance = {
  eyebrow: "Guidance",
  title: "Need help choosing the right product?",
  body: "Every individual's spiritual needs are unique. Get guidance from an astrologer to understand which category may suit your practice.",
  cta: "Talk to an astrologer",
  href: "/astrologers",
};
