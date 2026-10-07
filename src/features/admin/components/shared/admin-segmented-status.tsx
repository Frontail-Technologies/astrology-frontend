import { toneClasses, type InsightTone } from "@/features/admin/insights/tones";
import { cn } from "@/lib/utils";

/** Small multi-state block for a catalog split into named states (not a progress measure). */
export function AdminSegmentedStatus({
  label,
  segments,
}: {
  label: string;
  segments: Array<{ label: string; value: number; tone: InsightTone }>;
}) {
  const total = segments.reduce((sum, segment) => sum + segment.value, 0);
  return (
    <div className="text-xs">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-foreground">{label}</span>
        <span className="tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">{total}</span> total
        </span>
      </div>
      <div className="mt-1 flex h-2 gap-0.5 overflow-hidden rounded-full" aria-hidden="true">
        {segments
          .filter((segment) => segment.value > 0)
          .map((segment) => (
            <span
              key={segment.label}
              className={cn("h-full", toneClasses[segment.tone].bar)}
              style={{ width: `${(segment.value / total) * 100}%` }}
            />
          ))}
      </div>
      <ul className="mt-1.5 flex flex-wrap gap-x-3 gap-y-1 text-muted-foreground">
        {segments.map((segment) => (
          <li key={segment.label} className="flex items-center gap-1.5">
            <span className={cn("size-2 rounded-full", toneClasses[segment.tone].dot)} aria-hidden="true" />
            <span className="font-semibold tabular-nums text-foreground">{segment.value}</span> {segment.label}
          </li>
        ))}
      </ul>
    </div>
  );
}
