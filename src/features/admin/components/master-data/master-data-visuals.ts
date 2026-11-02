import type { LucideIcon } from "lucide-react";
import { Flag, Globe2, Landmark, Map, MapPin, MessageCircle, Phone, Sparkles, Star, Tags, Video } from "lucide-react";

import type { MasterDataEntity } from "@/features/master-data/types/master-data-admin";

/** One restrained icon per entity (tinted with semantic tokens, no per-entity colour palette). */
export const masterDataIcons: Record<MasterDataEntity, LucideIcon> = {
  languages: Globe2,
  countries: Flag,
  states: Map,
  cities: MapPin,
  expertise: Sparkles,
  specialties: Star,
  tags: Tags,
  "consultation-modes": MessageCircle,
  "pooja-categories": Landmark,
};

/** Icon per consultation mode code (a lookup map, so the component identity is static). */
export const consultationModeIcons: Record<string, LucideIcon> = { chat: MessageCircle, voice: Phone, video: Video };
