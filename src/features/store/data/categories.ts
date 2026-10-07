import type { ProductCategory } from "../types/store";
import { categoryDetailsBySlug } from "./product-details";

/** Seed data for Admin UI development. Replaced by the backend catalog API later. */
const baseCategories: ProductCategory[] = [
  {
    id: "cat-gemstones",
    slug: "gemstones",
    name: "Gemstones",
    description: "Natural gemstones selected for Vedic astrology practice, including planetary stones and protective gems.",
    imageSrc: "/assets/astrology/calculators/lucky-gemstone.png",
    managementStatus: "active",
  },
  {
    id: "cat-rudraksha",
    slug: "rudraksha",
    name: "Rudraksha",
    description: "Traditional rudraksha beads in single and combination mukhis, sourced from Nepal and India.",
    imageSrc: "/assets/astrology/calculators/lucky-rudraksha.png",
    managementStatus: "active",
  },
  {
    id: "cat-remedies",
    slug: "remedies",
    name: "Remedies",
    description: "Guidance materials, yantra prints and ritual essentials for traditional planetary remedies.",
    imageSrc: "/assets/astrology/calculators/pitra-dosha.png",
    managementStatus: "active",
  },
  {
    id: "cat-yantras",
    slug: "yantras",
    name: "Yantras",
    description: "Geometric meditation and worship tools used in Vedic tradition, engraved or printed on copper and paper.",
    managementStatus: "draft",
  },
  {
    id: "cat-pooja-essentials",
    slug: "pooja-essentials",
    name: "Pooja Essentials",
    description: "Ritual supplies for home worship and ceremony preparation.",
    managementStatus: "draft",
  },
];

export const canonicalProductCategories: ProductCategory[] = baseCategories.map((category) => ({
  ...category,
  details: categoryDetailsBySlug[category.slug],
}));
