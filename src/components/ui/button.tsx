import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

export const buttonVariants = cva(
  "inline-flex min-h-11 items-center justify-center gap-2 rounded-[calc(var(--radius)-2px)] px-4 py-2 text-sm font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:
          "bg-midnight-900 text-ivory-50 hover:bg-midnight-800",
        discovery:
          "border border-gold-500/35 bg-gold-300/20 text-midnight-900 hover:border-gold-500/60 hover:bg-gold-300/35 dark:border-gold-400/40 dark:bg-gold-400/12 dark:text-ivory-50 dark:hover:border-gold-400/55 dark:hover:bg-gold-400/20",
        conversion:
          "bg-conversion-500 text-midnight-950 hover:bg-conversion-600",
        outline:
          "border border-border bg-transparent text-foreground hover:bg-surface-muted",
        ghost:
          "bg-transparent text-foreground hover:bg-surface-muted",
        destructive:
          "bg-error text-ivory-50 hover:bg-error/90"
      },
      size: {
        default: "h-11",
        sm: "h-9 px-3 text-sm",
        lg: "h-12 px-5 text-base",
        icon: "size-11 p-0"
      }
    },
    defaultVariants: {
      variant: "default",
      size: "default"
    }
  }
);

export type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  VariantProps<typeof buttonVariants>;

export function Button({
  className,
  variant,
  size,
  type = "button",
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(buttonVariants({ variant, size }), className)}
      type={type}
      {...props}
    />
  );
}
