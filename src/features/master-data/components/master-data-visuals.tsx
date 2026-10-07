import type { LucideIcon } from "lucide-react";
import { Database, Flag, Globe2, Landmark, Map, MapPin, MessageCircle, Phone, Sparkles, Star, Tags, Video } from "lucide-react";
import type { MasterDataRecord, MasterDataType } from "../types/master-data";

type MasterDataVisual = { icon: LucideIcon; tileClass: string; iconClass: string; barClass: string };

export const masterDataVisuals: Record<MasterDataType, MasterDataVisual> = {
  languages: { icon: Globe2, tileClass: "bg-sky-500/10", iconClass: "text-sky-700", barClass: "bg-sky-500" },
  countries: { icon: Flag, tileClass: "bg-rose-500/10", iconClass: "text-rose-700", barClass: "bg-rose-500" },
  states: { icon: Map, tileClass: "bg-orange-500/10", iconClass: "text-orange-700", barClass: "bg-orange-500" },
  cities: { icon: MapPin, tileClass: "bg-violet-500/10", iconClass: "text-violet-700", barClass: "bg-violet-500" },
  expertise: { icon: Sparkles, tileClass: "bg-amber-500/12", iconClass: "text-amber-700", barClass: "bg-amber-500" },
  specialties: { icon: Star, tileClass: "bg-yellow-500/12", iconClass: "text-yellow-700", barClass: "bg-yellow-500" },
  tags: { icon: Tags, tileClass: "bg-purple-500/10", iconClass: "text-purple-700", barClass: "bg-purple-500" },
  "consultation-modes": { icon: MessageCircle, tileClass: "bg-indigo-500/10", iconClass: "text-indigo-700", barClass: "bg-indigo-500" },
  "pooja-categories": { icon: Landmark, tileClass: "bg-primary/10", iconClass: "text-primary", barClass: "bg-primary" },
};

export function getMasterDataIcon(type: MasterDataType, record?: MasterDataRecord): LucideIcon {
  if (type !== "consultation-modes" || !record || !("technicalKey" in record)) return masterDataVisuals[type].icon;
  if (record.technicalKey === "Voice") return Phone;
  if (record.technicalKey === "Video") return Video;
  return MessageCircle;
}

export const masterDataFallbackIcon = Database;
