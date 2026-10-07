import { articleSeedData } from "@/features/articles/data/articles";
import { astrologers } from "@/features/astrologers/data/astrologers";
import { poojas } from "@/features/pooja/data/poojas";
import type { MasterDataStore, MasterDataType } from "../types/master-data";

export const masterDataSlug = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

export function getMasterDataUsage(type: MasterDataType, id: string, data: MasterDataStore) {
  const item = data[type].find((record) => record.id === id);
  if (!item) return { count: 0, label: "records" };
  if (type === "countries") return { count: data.states.filter((state) => state.countryId === id).length, label: "states" };
  if (type === "states") return { count: data.cities.filter((city) => city.stateId === id).length, label: "cities" };
  if (type === "languages") return { count: astrologers.filter((astrologer) => astrologer.languages.some((language) => language.toLowerCase() === item.name.toLowerCase())).length, label: "astrologers" };
  if (type === "expertise") return { count: astrologers.filter((astrologer) => astrologer.expertiseKey === ("slug" in item ? item.slug : "")).length, label: "astrologers" };
  if (type === "specialties") return { count: astrologers.filter((astrologer) => astrologer.specialties.includes(item.name)).length, label: "astrologers" };
  if (type === "consultation-modes") return { count: astrologers.filter((astrologer) => astrologer.detail?.consultationModes.includes(("technicalKey" in item ? item.technicalKey : item.name) as "Chat" | "Voice" | "Video")).length, label: "astrologers" };
  if (type === "pooja-categories") return { count: poojas.filter((pooja) => pooja.categories.includes(("technicalKey" in item ? item.technicalKey : "") as never)).length, label: "poojas" };
  if (type === "tags") return { count: articleSeedData.filter((article) => article.tags.includes(("slug" in item ? item.slug : ""))).length, label: "articles" };
  return { count: 0, label: "records" };
}

export function canDeleteMasterData(type: MasterDataType, id: string, data: MasterDataStore) {
  return getMasterDataUsage(type, id, data).count === 0;
}
