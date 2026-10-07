"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { toast } from "sonner";

export function useCopyToClipboard({
  label = "Copied",
  resetMs = 1400,
}: { label?: string; resetMs?: number } = {}) {
  const [copied, setCopied] = useState<string | null>(null);
  const timer = useRef<number | undefined>(undefined);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const copy = useCallback(
    async (value: string) => {
      try {
        await navigator.clipboard.writeText(value);
        setCopied(value);
        toast.success(label === "Copied" ? label : `${label} copied`);
        window.clearTimeout(timer.current);
        timer.current = window.setTimeout(() => setCopied(null), resetMs);
      } catch {
        toast.error(`Unable to copy ${label === "Copied" ? "value" : label.toLowerCase()}`);
      }
    },
    [label, resetMs],
  );

  return { copied, copy };
}
