import { toneClasses, type InsightTone } from "@/features/admin/insights/tones";
import { cn } from "@/lib/utils";

export function AdminProgressRow({
  label,
  value,
  total,
  detail,
  tone = "green",
}: {
  label: string;
  value: number;
  total: number;
  detail?: string;
  tone?: InsightTone;
}) {
  const pct = total ? Math.round((value / total) * 100) : 0;
  return (
    <div className="text-xs">
      <div className="flex items-baseline justify-between gap-3">
        <span className="font-medium text-foreground">{label}</span>
        <span className="shrink-0 tabular-nums text-muted-foreground">
          <span className="font-semibold text-foreground">{value}</span> / {total}
        </span>
      </div>
      <div
        className="mt-1 h-1.5 overflow-hidden rounded-full bg-muted"
        role="progressbar"
        aria-label={label}
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={total}
      >
        <div className={cn("h-full rounded-full", toneClasses[tone].bar)} style={{ width: `${pct}%` }} />
      </div>
      {detail ? <p className="mt-1 text-muted-foreground">{detail}</p> : null}
    </div>
  );
}
