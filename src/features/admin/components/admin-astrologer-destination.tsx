import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { availabilityLabel } from "@/features/astrologers/data/astrologers";
import type { AstrologerListItem } from "@/features/astrologers/types/astrologer";

export function AdminAstrologerDestination({
  astrologer,
  mode,
}: {
  astrologer: AstrologerListItem;
  mode: "view" | "edit";
}) {
  const title = mode === "edit" ? `Edit ${astrologer.name}` : astrologer.name;

  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        
        <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      </div>
      <Card className="max-w-2xl shadow-sm">
        <CardContent className="flex items-start gap-4 p-5">
          <Avatar size="lg">
            <AvatarImage src={astrologer.avatarSrc} alt={astrologer.name} />
            <AvatarFallback>{astrologer.initials}</AvatarFallback>
          </Avatar>
          <div className="min-w-0 space-y-2">
            <p className="font-medium text-foreground">{astrologer.primaryExpertise}</p>
            <p className="text-sm text-muted-foreground">{astrologer.languages.join(", ")}</p>
            <Badge variant={astrologer.availability === "bookable" ? "online" : "muted"}>
              {availabilityLabel(astrologer.availability)}
            </Badge>
            {mode === "edit" ? <p className="pt-2 text-sm text-muted-foreground">Editing requires the Admin API to be connected.</p> : null}
          </div>
        </CardContent>
      </Card>
    </section>
  );
}
