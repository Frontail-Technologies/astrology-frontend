"use client";

import { useId, useLayoutEffect, useRef } from "react";
import { ArrowDown, ArrowUp, ImagePlus, Loader2, Star, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  addGalleryImages,
  moveGalleryImage,
  normalizeGallery,
  removeGalleryImage,
  setGalleryAlt,
  setGalleryPrimary,
  type AdminGalleryImage,
} from "@/features/admin/data/admin-gallery";
import { ACCEPTED_IMAGE_ACCEPT } from "@/features/media/media-constraints";
import { mediaDisplayUrl } from "@/features/media/media-url";
import { cn } from "@/lib/utils";

import { useSessionImageQueue } from "../../hooks/use-session-image-queue";

export type { AdminGalleryImage };

/**
 * Ordered multi-image field backed by `POST /admin/media/images`.
 *
 * - `value` / `onChange`: `{ url, alt, isPrimary }[]` in display order; exactly one item is primary when non-empty
 *   (the component normalizes every emitted value). Only served URLs are emitted, never `blob:`/`data:`.
 * - Uploads run one at a time; each finished upload is appended (alt defaults to `defaultAlt` or the file name
 *   without extension). Reorder with the up/down buttons (keyboard accessible), set primary, edit alt, remove.
 * - Map to the API shape at the payload boundary (for example `images.map((image, sortOrder) => ({ ...image, sortOrder }))`).
 *
 * `<AdminImageGalleryField label="Product images" value={field.value} onChange={field.onChange} max={8} />`
 */
export function AdminImageGalleryField({
  value,
  onChange,
  max = 10,
  label = "Images",
  description,
  disabled = false,
  error,
  defaultAlt,
  className,
}: {
  value: AdminGalleryImage[];
  onChange: (value: AdminGalleryImage[]) => void;
  max?: number;
  label?: string;
  description?: string;
  disabled?: boolean;
  error?: string;
  /** Alt text for new uploads; defaults to the file name without extension. */
  defaultAlt?: string;
  className?: string;
}) {
  const baseId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  // Uploads finish asynchronously; read the latest value so concurrent edits are not lost.
  const valueRef = useRef(value);
  const onChangeRef = useRef(onChange);
  useLayoutEffect(() => {
    valueRef.current = value;
    onChangeRef.current = onChange;
  });

  const queue = useSessionImageQueue({
    onUploaded: (image, file) => {
      const next = addGalleryImages(
        valueRef.current,
        [{ url: image.url, alt: defaultAlt ?? file.name.replace(/\.[^.]+$/, ""), isPrimary: false }],
        max,
      );
      valueRef.current = next;
      onChangeRef.current(next);
    },
  });

  const emit = (next: AdminGalleryImage[]) => onChange(normalizeGallery(next));
  const remaining = Math.max(0, max - value.length - queue.pending.length);
  const messages = [...queue.errors, ...(error ? [error] : [])];
  const errorId = messages.length ? `${baseId}-error` : undefined;
  const descriptionId = description ? `${baseId}-description` : undefined;

  return (
    <div className={cn("grid gap-3", className)} role="group" aria-labelledby={`${baseId}-label`} aria-describedby={[descriptionId, errorId].filter(Boolean).join(" ") || undefined}>
      <div className="flex flex-wrap items-end justify-between gap-2">
        <div className="grid gap-1">
          <span id={`${baseId}-label`} className="text-sm font-medium leading-none text-foreground">
            {label}
          </span>
          <p id={descriptionId} className="text-xs text-muted-foreground">
            {description ? `${description} ` : null}
            {value.length}/{max} images.
          </p>
        </div>
        <Button type="button" variant="outline" size="sm" disabled={disabled || remaining === 0} onClick={() => inputRef.current?.click()}>
          <ImagePlus aria-hidden="true" />
          Add images
        </Button>
      </div>

      {value.length || queue.pending.length ? (
        <ol className="grid gap-2">
          {value.map((image, index) => {
            const src = mediaDisplayUrl(image.url);
            const altId = `${baseId}-alt-${index}`;
            const position = `image ${index + 1} of ${value.length}`;
            // Key by URL (stable across reorders, so keyboard focus follows the moved item); suffix duplicates.
            const duplicate = value.slice(0, index).filter((item) => item.url === image.url).length;
            return (
              <li
                key={`${image.url}#${duplicate}`}
                className={cn(
                  "grid gap-3 rounded-md border border-border bg-surface p-2.5 sm:grid-cols-[6rem_minmax(0,1fr)_auto] sm:items-center",
                  image.isPrimary ? "border-primary/50" : undefined,
                )}
              >
                <div className="relative aspect-square w-24 overflow-hidden rounded bg-muted">
                  {src ? (
                    // Served from the API origin; next/image would need every media origin configured.
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={src} alt={image.alt || `Gallery ${position}`} className="size-full object-cover" />
                  ) : null}
                  {image.isPrimary ? (
                    <span className="absolute left-1 top-1 rounded bg-background/90 px-1.5 py-0.5 text-[10px] font-semibold uppercase tracking-wide">
                      Primary
                    </span>
                  ) : null}
                </div>
                <div className="grid min-w-0 gap-1">
                  <Label htmlFor={altId} className="text-xs">
                    Alt text
                  </Label>
                  <Input
                    id={altId}
                    value={image.alt}
                    maxLength={200}
                    disabled={disabled}
                    placeholder="Describe the image"
                    onChange={(event) => onChange(setGalleryAlt(value, index, event.target.value))}
                  />
                </div>
                <div className="flex flex-wrap gap-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    disabled={disabled || image.isPrimary}
                    aria-pressed={image.isPrimary}
                    aria-label={image.isPrimary ? `${position} is the primary image` : `Make ${position} the primary image`}
                    onClick={() => onChange(setGalleryPrimary(value, index))}
                  >
                    <Star aria-hidden="true" className={image.isPrimary ? "fill-current" : undefined} />
                    <span className="sm:sr-only">Primary</span>
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    disabled={disabled || index === 0}
                    aria-label={`Move ${position} up`}
                    onClick={() => emit(moveGalleryImage(value, index, -1))}
                  >
                    <ArrowUp aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    disabled={disabled || index === value.length - 1}
                    aria-label={`Move ${position} down`}
                    onClick={() => emit(moveGalleryImage(value, index, 1))}
                  >
                    <ArrowDown aria-hidden="true" />
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="xs"
                    className="text-muted-foreground hover:text-destructive"
                    disabled={disabled}
                    aria-label={`Remove ${position}`}
                    onClick={() => onChange(removeGalleryImage(value, index))}
                  >
                    <Trash2 aria-hidden="true" />
                  </Button>
                </div>
              </li>
            );
          })}
          {queue.pending.map((item) => (
            <li key={`pending-${item.id}`} className="flex items-center gap-3 rounded-md border border-dashed border-border p-2.5" role="status">
              <div className="relative aspect-square w-24 overflow-hidden rounded bg-muted">
                {/* Local placeholder during upload only; it is never emitted. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={item.placeholderUrl} alt="" className="size-full object-cover opacity-60" />
                <Loader2 className="absolute inset-0 m-auto size-5 animate-spin" aria-hidden="true" />
              </div>
              <span className="min-w-0 truncate text-sm text-muted-foreground">Uploading {item.name}…</span>
            </li>
          ))}
        </ol>
      ) : (
        <p className="rounded-md border border-dashed border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">No images yet.</p>
      )}

      {messages.length ? (
        <div id={errorId} role="alert" className="grid gap-0.5 text-xs text-destructive">
          {messages.map((message) => (
            <p key={message}>{message}</p>
          ))}
        </div>
      ) : null}

      <input
        ref={inputRef}
        type="file"
        multiple
        accept={ACCEPTED_IMAGE_ACCEPT}
        className="sr-only"
        tabIndex={-1}
        aria-label={`Add ${label}`}
        disabled={disabled || remaining === 0}
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          event.currentTarget.value = "";
          queue.enqueue(files, remaining);
        }}
      />
    </div>
  );
}
