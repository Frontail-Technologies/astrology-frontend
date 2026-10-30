"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

import { ACCEPTED_IMAGE_TYPES, uploadAdminImage, type UploadedImage } from "@/features/media/media-api";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TOO_LARGE_MESSAGE = "Choose an image smaller than 5 MB.";

/**
 * Owns only the session lifecycle of one local image: the File, its object URL
 * (created, revoked on replace/clear/unmount) and the file-input plumbing.
 * Canonical URLs, form fields and payloads stay with the feature.
 */
export const IMAGE_TYPE_MESSAGE = "Use a JPEG, PNG or WebP image.";

export type ImageUploadState = "idle" | "uploading" | "uploaded" | "failed";

export function useSessionImagePreview({
  onReject,
  upload = false,
  onUploaded,
}: { onReject?: (message: string) => void; upload?: boolean; onUploaded?: (image: UploadedImage) => void } = {}) {
  const [uploadState, setUploadState] = useState<ImageUploadState>("idle");
  const [uploaded, setUploaded] = useState<UploadedImage | undefined>();
  const onUploadedRef = useRef(onUploaded);
  const uploadTokenRef = useRef(0);
  const [file, setFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onRejectRef = useRef(onReject);
  useEffect(() => {
    onRejectRef.current = onReject;
    onUploadedRef.current = onUploaded;
  });

  const revoke = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);

  useEffect(() => revoke, [revoke]);

  /** Returns the new object URL, or null when the file was rejected. */
  const select = useCallback(
    (next?: File): string | null => {
      if (!next) return null;
      const typeOk = upload ? ACCEPTED_IMAGE_TYPES.includes(next.type) : next.type.startsWith("image/");
      if (!typeOk || next.size > MAX_IMAGE_BYTES) {
        const message = typeOk ? IMAGE_TOO_LARGE_MESSAGE : IMAGE_TYPE_MESSAGE;
        setError(message);
        onRejectRef.current?.(message);
        return null;
      }
      revoke();
      const url = URL.createObjectURL(next);
      urlRef.current = url;
      setFile(next);
      setPreviewUrl(url);
      setError(null);
      setUploaded(undefined);
      if (upload) {
        const token = ++uploadTokenRef.current;
        setUploadState("uploading");
        uploadAdminImage(next)
          .then((result) => {
            if (token !== uploadTokenRef.current) return;
            setUploaded(result);
            setUploadState("uploaded");
            onUploadedRef.current?.(result);
          })
          .catch((uploadError: unknown) => {
            if (token !== uploadTokenRef.current) return;
            setUploadState("failed");
            setError(uploadError instanceof Error ? uploadError.message : "Image upload failed. Try again.");
          });
      }
      return url;
    },
    [revoke, upload],
  );

  const clear = useCallback(() => {
    revoke();
    setFile(undefined);
    setPreviewUrl(undefined);
    setError(null);
    setUploaded(undefined);
    setUploadState("idle");
    uploadTokenRef.current += 1;
    if (inputRef.current) inputRef.current.value = "";
  }, [revoke]);

  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => {
      const url = select(event.target.files?.[0]);
      event.currentTarget.value = "";
      return url;
    },
    [select],
  );

  const openPicker = useCallback(() => inputRef.current?.click(), []);

  return {
    file,
    previewUrl,
    error,
    hasLocalFile: Boolean(file),
    uploadState,
    uploaded,
    inputRef,
    openPicker,
    select,
    clear,
    handleInputChange,
  };
}
