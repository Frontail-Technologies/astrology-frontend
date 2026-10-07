"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { ChangeEvent } from "react";

export const MAX_IMAGE_BYTES = 5 * 1024 * 1024;
export const IMAGE_TOO_LARGE_MESSAGE = "Choose an image smaller than 5 MB.";

/**
 * Owns only the session lifecycle of one local image: the File, its object URL
 * (created, revoked on replace/clear/unmount) and the file-input plumbing.
 * Canonical URLs, form fields and payloads stay with the feature.
 */
export function useSessionImagePreview({
  onReject,
}: { onReject?: (message: string) => void } = {}) {
  const [file, setFile] = useState<File | undefined>();
  const [previewUrl, setPreviewUrl] = useState<string | undefined>();
  const [error, setError] = useState<string | null>(null);
  const urlRef = useRef<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const onRejectRef = useRef(onReject);
  onRejectRef.current = onReject;

  const revoke = useCallback(() => {
    if (urlRef.current) URL.revokeObjectURL(urlRef.current);
    urlRef.current = null;
  }, []);

  useEffect(() => revoke, [revoke]);

  /** Returns the new object URL, or null when the file was rejected. */
  const select = useCallback(
    (next?: File): string | null => {
      if (!next) return null;
      if (!next.type.startsWith("image/") || next.size > MAX_IMAGE_BYTES) {
        setError(IMAGE_TOO_LARGE_MESSAGE);
        onRejectRef.current?.(IMAGE_TOO_LARGE_MESSAGE);
        return null;
      }
      revoke();
      const url = URL.createObjectURL(next);
      urlRef.current = url;
      setFile(next);
      setPreviewUrl(url);
      setError(null);
      return url;
    },
    [revoke],
  );

  const clear = useCallback(() => {
    revoke();
    setFile(undefined);
    setPreviewUrl(undefined);
    setError(null);
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
    inputRef,
    openPicker,
    select,
    clear,
    handleInputChange,
  };
}
