"use client";

import { Check, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCopyToClipboard } from "@/features/admin/hooks/use-copy-to-clipboard";

export function MasterDataCopyCode({ value, label = "code" }: { value: string; label?: string }) {
  const { copied, copy } = useCopyToClipboard({ label });
  const isCopied = copied === value;
  return <div className="inline-flex items-center gap-1 rounded-md bg-muted/70 px-1.5 py-1 font-mono text-xs"><span>{value}</span><Button variant="ghost" size="sm" className="size-6 p-0 text-muted-foreground hover:text-foreground" onClick={() => void copy(value)} aria-label={`Copy ${label} ${value}`} title={`Copy ${label}`}>{isCopied ? <Check className="size-3.5 text-success" /> : <Copy className="size-3.5" />}</Button></div>;
}
