import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { mediaDisplayUrl } from "@/features/media/media-url";
import { cn } from "@/lib/utils";
import { getInitials } from "../../lib/format";

/** Astrologer photo (uploaded or external URL) with initials while it loads or when there is none. */
export function AstrologerAvatar({ name, imageUrl, className, fallbackClassName }: { name: string; imageUrl: string | null; className?: string; fallbackClassName?: string }) {
  const src = mediaDisplayUrl(imageUrl);
  return (
    <Avatar className={cn("size-8 shrink-0", className)}>
      {src ? <AvatarImage src={src} alt="" className="object-cover" /> : null}
      <AvatarFallback className={cn("bg-accent text-xs font-semibold text-sidebar-primary", fallbackClassName)}>{getInitials(name)}</AvatarFallback>
    </Avatar>
  );
}
