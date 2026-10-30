import { CheckCircle2, Loader2 } from "lucide-react";

import type { ImageUploadState } from "../../hooks/use-session-image-preview";

export function AdminImageUploadStatus({ state }: { state: ImageUploadState }) {
  if (state === "uploading") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-muted-foreground" role="status">
        <Loader2 className="size-3.5 animate-spin" aria-hidden="true" />
        Uploading…
      </span>
    );
  }
  if (state === "uploaded") {
    return (
      <span className="inline-flex items-center gap-1.5 text-xs text-success" role="status">
        <CheckCircle2 className="size-3.5" aria-hidden="true" />
        Uploaded
      </span>
    );
  }
  return null;
}
