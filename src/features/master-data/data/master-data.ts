import { expertiseOptions, astrologers } from "@/features/astrologers/data/astrologers";
import { poojaCategories } from "@/features/pooja/data/poojas";
import type { MasterDataStore, MasterDataType } from "../types/master-data";

const createdAt = "2026-01-01T08:00:00.000Z";
const updatedAt = "2026-09-20T10:00:00.000Z";
const base = (id: string, name: string, sortOrder: number, status: "active" | "inactive" = "active") => ({ id, name, sortOrder, status, createdAt, updatedAt });
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const uniqueSpecialties = [...new Set(astrologers.flatMap((astrologer) => astrologer.specialties))];

export const masterDataLabels: Record<MasterDataType, { singular: string; plural: string; description: string }> = {
  languages: { singular: "Language", plural: "Languages", description: "Supported display and consultation languages." },
  countries: { singular: "Country", plural: "Countries", description: "Countries available in platform location fields." },
  states: { singular: "State", plural: "States", description: "States and provinces linked to a country." },
  cities: { singular: "City", plural: "Cities", description: "Cities linked to their canonical state." },
  expertise: { singular: "Expertise", plural: "Expertise", description: "Primary expertise available to astrologer profiles." },
  specialties: { singular: "Specialty", plural: "Specialties", description: "Focused service themes used by astrologers." },
  tags: { singular: "Tag", plural: "Tags", description: "Reusable content classification tags." },
  "consultation-modes": { singular: "Consultation Mode", plural: "Consultation Modes", description: "Labels and availability for supported consultation channels." },
  "pooja-categories": { singular: "Pooja Category", plural: "Pooja Categories", description: "Canonical categories used by the Pooja catalog." },
};

export const masterDataSeed: MasterDataStore = {
  languages: [
    { ...base("lang-en", "English", 1), nativeName: "English", code: "en", direction: "ltr", isDefault: true },
    { ...base("lang-hi", "Hindi", 2), nativeName: "Hindi", code: "hi", direction: "ltr", isDefault: false },
    { ...base("lang-mr", "Marathi", 3), nativeName: "Marathi", code: "mr", direction: "ltr", isDefault: false },
    { ...base("lang-ta", "Tamil", 4), nativeName: "Tamil", code: "ta", direction: "ltr", isDefault: false },
    { ...base("lang-te", "Telugu", 5), nativeName: "Telugu", code: "te", direction: "ltr", isDefault: false },
    { ...base("lang-kn", "Kannada", 6), nativeName: "Kannada", code: "kn", direction: "ltr", isDefault: false },
    { ...base("lang-bn", "Bengali", 7), nativeName: "Bengali", code: "bn", direction: "ltr", isDefault: false },
    { ...base("lang-gu", "Gujarati", 8), nativeName: "Gujarati", code: "gu", direction: "ltr", isDefault: false },
    { ...base("lang-ur", "Urdu", 9, "inactive"), nativeName: "Urdu", code: "ur", direction: "rtl", isDefault: false },
  ],
  countries: [
    { ...base("country-in", "India", 1), isoCode: "IN", phoneCode: "+91" },
    { ...base("country-np", "Nepal", 2), isoCode: "NP", phoneCode: "+977" },
    { ...base("country-us", "United States", 3), isoCode: "US", phoneCode: "+1" },
    { ...base("country-gb", "United Kingdom", 4), isoCode: "GB", phoneCode: "+44" },
    { ...base("country-ae", "United Arab Emirates", 5, "inactive"), isoCode: "AE", phoneCode: "+971" },
  ],
  states: [
    { ...base("state-rj", "Rajasthan", 1), code: "RJ", countryId: "country-in" },
    { ...base("state-mh", "Maharashtra", 2), code: "MH", countryId: "country-in" },
    { ...base("state-dl", "Delhi", 3), code: "DL", countryId: "country-in" },
    { ...base("state-ka", "Karnataka", 4), code: "KA", countryId: "country-in" },
    { ...base("state-tn", "Tamil Nadu", 5), code: "TN", countryId: "country-in" },
    { ...base("state-up", "Uttar Pradesh", 6), code: "UP", countryId: "country-in" },
    { ...base("state-gj", "Gujarat", 7), code: "GJ", countryId: "country-in" },
    { ...base("state-wb", "West Bengal", 8), code: "WB", countryId: "country-in" },
    { ...base("state-tg", "Telangana", 9), code: "TG", countryId: "country-in" },
    { ...base("state-ba", "Bagmati", 10, "inactive"), code: "BA", countryId: "country-np" },
  ],
  cities: [
    { ...base("city-jaipur", "Jaipur", 1), stateId: "state-rj" },
    { ...base("city-udaipur", "Udaipur", 2), stateId: "state-rj" },
    { ...base("city-mumbai", "Mumbai", 3), stateId: "state-mh" },
    { ...base("city-pune", "Pune", 4), stateId: "state-mh" },
    { ...base("city-delhi", "Delhi", 5), stateId: "state-dl" },
    { ...base("city-bengaluru", "Bengaluru", 6), stateId: "state-ka" },
    { ...base("city-chennai", "Chennai", 7), stateId: "state-tn" },
    { ...base("city-lucknow", "Lucknow", 8), stateId: "state-up" },
    { ...base("city-ahmedabad", "Ahmedabad", 9), stateId: "state-gj" },
    { ...base("city-kolkata", "Kolkata", 10), stateId: "state-wb" },
    { ...base("city-hyderabad", "Hyderabad", 11), stateId: "state-tg" },
    { ...base("city-kathmandu", "Kathmandu", 12, "inactive"), stateId: "state-ba" },
  ],
  expertise: expertiseOptions.filter((item) => item.value !== "all").map((item, index) => ({ ...base(`expertise-${item.value}`, item.label, index + 1), slug: item.value, description: `${item.label} guidance and consultation focus.` })),
  specialties: uniqueSpecialties.map((name, index) => ({ ...base(`specialty-${slugify(name)}`, name, index + 1), slug: slugify(name), description: `${name} consultation specialty.` })),
  tags: ["astrology", "beginners", "reflection", "relationships", "remedies", "spirituality", "horoscope", "numerology"].map((name, index) => ({ ...base(`tag-${name}`, name[0].toUpperCase() + name.slice(1), index + 1), slug: name })),
  "consultation-modes": ["Chat", "Voice", "Video"].map((name, index) => ({ ...base(`mode-${name.toLowerCase()}`, name, index + 1), slug: name.toLowerCase(), technicalKey: name, description: `${name} consultation channel.` })),
  "pooja-categories": poojaCategories.filter((item) => item.value !== "all").map((item, index) => ({ ...base(`pooja-category-${item.value}`, item.label, index + 1), slug: item.value, technicalKey: item.value, description: `${item.label} services in the Pooja catalog.` })),
};

export function isMasterDataType(value: string): value is MasterDataType {
  return (masterDataTypes as readonly string[]).includes(value);
}

const masterDataTypes = Object.keys(masterDataLabels) as MasterDataType[];
