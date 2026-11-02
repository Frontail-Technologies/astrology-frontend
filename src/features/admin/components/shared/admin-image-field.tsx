"use client";

import { useId, useRef, useState } from "react";
import { ImageOff, ImagePlus, Link2, Loader2, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { ACCEPTED_IMAGE_ACCEPT, IMAGE_URL_MESSAGE, normalizeImageUrlInput } from "@/features/media/media-constraints";
import { mediaDisplayUrl } from "@/features/media/media-url";
import { cn } from "@/lib/utils";

import { useSessionImageUpload } from "../../hooks/use-session-image-upload";
import { AdminImageUploadStatus } from "./admin-image-upload-status";

export type AdminImageAspect = "square" | "video" | "wide" | "portrait";

const aspectClass: Record<AdminImageAspect, string> = {
  square: "aspect-square max-w-56",
  video: "aspect-video max-w-md",
  wide: "aspect-[16/6] max-w-2xl",
  portrait: "aspect-[3/4] max-w-48",
};

/**
 * Single image field backed by `POST /admin/media/images`.
 *
 * - `value` is the stored URL (`/uploads/...`, a frontend `/path` or an http(s) URL) or `null`.
 * - `onChange` receives the uploaded image's served URL, a validated pasted URL, or `null` on remove. It never
 *   receives `blob:`/`data:` URLs; the local placeholder is only shown while the upload runs.
 * - `error` shows an external (form/server) message; upload errors render inline on their own.
 *
 * `<AdminImageField label="Cover image" value={field.value} onChange={field.onChange} aspect="video" />`
 */
export function AdminImageField({
  value,
  onChange,
  label,
  description,
  disabled = false,
  aspect = "video",
  error,
  allowUrl = true,
  id,
  className,
}: {
  value: string | null;
  onChange: (value: string | null) => void;
  label: string;
  description?: string;
  disabled?: boolean;
  aspect?: AdminImageAspect;
  /** External error (for example from react-hook-form or the server). */
  error?: string;
  /** Shows the "Use URL" option (default true). */
  allowUrl?: boolean;
  id?: string;
  className?: string;
}) {
  const generatedId = useId();
  const baseId = id ?? generatedId;
  const inputRef = useRef<HTMLInputElement>(null);
  const upload = useSessionImageUpload();
  const [urlOpen, setUrlOpen] = useState(false);
  const [urlText, setUrlText] = useState("");
  const [urlError, setUrlError] = useState<string | null>(null);
  const [failedSrc, setFailedSrc] = useState<string | null>(null);

  const displayUrl = upload.placeholderUrl ?? mediaDisplayUrl(value);
  const broken = Boolean(displayUrl) && failedSrc === displayUrl;
  const message = upload.error ?? error;
  const descriptionId = description ? `${baseId}-description` : undefined;
  const errorId = message ? `${baseId}-error` : undefined;
  const busy = disabled || upload.uploading;

  const pickFile = async (file: File | undefined) => {
    if (!file) return;
    const result = await upload.upload(file);
    if (result) onChange(result.url);
  };

  const applyUrl = () => {
    const normalized = normalizeImageUrlInput(urlText);
    if (!normalized) {
      setUrlError(IMAGE_URL_MESSAGE);
      return;
    }
    upload.reset();
    onChange(normalized);
    setUrlText("");
    setUrlError(null);
    setUrlOpen(false);
  };

  const remove = () => {
    upload.reset();
    onChange(null);
  };

  return (
    <div className={cn("grid gap-2", className)} role="group" aria-labelledby={`${baseId}-label`} aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}>
      <span id={`${baseId}-label`} className="text-sm font-medium leading-none text-foreground">
        {label}
      </span>
      {description ? (
        <p id={descriptionId} className="text-xs text-muted-foreground">
          {description}
        </p>
      ) : null}
      <div
        className={cn(
          "relative w-full overflow-hidden rounded-md border border-dashed border-border bg-muted/30",
          aspectClass[aspect],
          message ? "border-destructive/60" : undefined,
        )}
      >
        {displayUrl && !broken ? (
          // Uploaded images are served from the API origin (or pasted URLs); next/image would need every origin configured.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={displayUrl}
            alt={`${label} preview`}
            className={cn("size-full object-cover", upload.uploading ? "opacity-60" : undefined)}
            onError={() => setFailedSrc(displayUrl)}
          />
        ) : (
          <div className="grid size-full place-items-center p-3 text-center text-xs text-muted-foreground">
            <span className="grid justify-items-center gap-1.5">
              <ImageOff className="size-5" aria-hidden="true" />
              {broken ? "This image could not be loaded." : "No image selected"}
            </span>
          </div>
        )}
        {upload.uploading ? (
          <div className="absolute inset-0 grid place-items-center bg-background/40">
            <Loader2 className="size-6 animate-spin text-foreground" aria-hidden="true" />
          </div>
        ) : null}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button type="button" variant="outline" size="sm" disabled={busy} onClick={() => inputRef.current?.click()}>
          <ImagePlus aria-hidden="true" />
          {value ? "Replace image" : "Upload image"}
        </Button>
        {value || upload.uploading ? (
          <Button type="button" variant="ghost" size="sm" disabled={disabled} onClick={remove}>
            <Trash2 aria-hidden="true" />
            {upload.uploading ? "Cancel" : "Remove"}
          </Button>
        ) : null}
        {allowUrl ? (
          <Button type="button" variant="ghost" size="sm" disabled={busy} aria-expanded={urlOpen} onClick={() => setUrlOpen((open) => !open)}>
            <Link2 aria-hidden="true" />
            Use URL
          </Button>
        ) : null}
        <AdminImageUploadStatus state={upload.state} />
      </div>

      {allowUrl && urlOpen ? (
        <div className="grid gap-1.5">
          <Label htmlFor={`${baseId}-url`} className="text-xs">
            Image URL
          </Label>
          <div className="flex gap-2">
            <Input
              id={`${baseId}-url`}
              value={urlText}
              placeholder="/uploads/... or https://..."
              disabled={busy}
              aria-invalid={Boolean(urlError) || undefined}
              aria-describedby={urlError ? `${baseId}-url-error` : undefined}
              onChange={(event) => {
                setUrlText(event.target.value);
                setUrlError(null);
              }}
              onKeyDown={(event) => {
                if (event.key === "Enter") {
                  event.preventDefault();
                  applyUrl();
                }
              }}
            />
            <Button type="button" variant="outline" size="sm" disabled={busy || !urlText.trim()} onClick={applyUrl}>
              Apply
            </Button>
          </div>
          {urlError ? (
            <p id={`${baseId}-url-error`} className="text-xs text-destructive">
              {urlError}
            </p>
          ) : null}
        </div>
      ) : null}

      {message ? (
        <p id={errorId} role="alert" className="text-xs text-destructive">
          {message}
        </p>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED_IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label={`Upload ${label}`}
        disabled={busy}
        onChange={(event) => {
          const file = event.target.files?.[0];
          event.currentTarget.value = "";
          void pickFile(file);
        }}
      />
    </div>
  );
}
