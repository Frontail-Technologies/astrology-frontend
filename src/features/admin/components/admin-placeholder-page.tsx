import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function AdminPlaceholderPage({ title }: { title: string }) {
  return (
    <section className="space-y-5">
      <div className="flex items-center gap-3">
        
        <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">{title}</h1>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Catalog destination</CardTitle>
        </CardHeader>
        <CardContent className="flex items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">Management tools are not connected yet.</p>
          <Badge variant="muted">Not connected</Badge>
        </CardContent>
      </Card>
    </section>
  );
}
