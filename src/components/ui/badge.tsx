import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex min-h-6 items-center rounded-md border px-2 py-0.5 text-xs font-medium",
  {
    variants: {
      variant: {
        default: "border-transparent bg-midnight-900 text-ivory-50",
        gold: "border-gold-500/30 bg-gold-300/25 text-midnight-950",
        saffron: "border-saffron-500/30 bg-saffron-500/15 text-midnight-950",
        verified: "border-info/25 bg-info/10 text-midnight-900",
        online: "border-success/25 bg-success/10 text-midnight-900",
        popular: "border-gold-500/30 bg-gold-300/25 text-midnight-950",
        pending: "border-warning/25 bg-warning/10 text-midnight-900",
        unavailable: "border-error/15 bg-surface-muted text-muted-foreground",
        outline: "border-border bg-transparent text-foreground",
        muted: "border-transparent bg-surface-muted text-muted-foreground"
      }
    },
    defaultVariants: {
      variant: "default"
    }
  }
);

export type BadgeProps = React.HTMLAttributes<HTMLSpanElement> &
  VariantProps<typeof badgeVariants>;

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <span className={cn(badgeVariants({ variant }), className)} {...props} />;
}
