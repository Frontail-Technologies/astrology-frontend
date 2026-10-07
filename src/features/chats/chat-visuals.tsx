import { MessageCircle, Phone, Video, type LucideIcon } from "lucide-react";
import type { ConsultationMode } from "@/features/astrologers/types/astrologer";
import type { ConversationStatus } from "./types/conversation";

export const chatModeVisuals: Record<
  ConsultationMode,
  { icon: LucideIcon; className: string }
> = {
  Chat: {
    icon: MessageCircle,
    className: "border-sky-500/20 bg-sky-500/10 text-sky-800",
  },
  Voice: {
    icon: Phone,
    className: "border-emerald-500/20 bg-emerald-500/10 text-emerald-800",
  },
  Video: {
    icon: Video,
    className: "border-violet-500/20 bg-violet-500/10 text-violet-800",
  },
};

export const chatStatusLabels: Record<ConversationStatus, string> = {
  open: "Open",
  closed: "Closed",
  flagged: "Flagged",
};

export const chatStatusVariants: Record<
  ConversationStatus,
  "online" | "muted" | "pending"
> = {
  open: "online",
  closed: "muted",
  flagged: "pending",
};
