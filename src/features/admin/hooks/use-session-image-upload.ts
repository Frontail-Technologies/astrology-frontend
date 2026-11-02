"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { normalizeAdminError } from "@/features/admin/data/admin-errors";
import { uploadAdminImage, type UploadedImage } from "@/features/media/media-api";
import { validateImageFile } from "@/features/media/media-constraints";

import type { ImageUploadState } from "./use-session-image-preview";

/**
 * Uploads one image at a time through `POST /admin/media/images`, keeping a local object URL only as a visual
 * placeholder while the request runs (revoked on finish, reset and unmount). Callers store `UploadedImage.url`;
 * the `blob:` placeholder is never returned from `upload`.
 *
 * `upload(file)` validates type/size first, ignores stale results when a newer upload or `reset()` happened, and
 * resolves to the uploaded image or `null` (rejected, failed or superseded). Errors are in `error`.
 */
export function useSessionImageUpload() {
  const [state, setState] = useState<ImageUploadState>("idle");
  const [error, setError] = useState<string | null>(null);
  const [placeholderUrl, setPlaceholderUrl] = useState<string | null>(null);
  const tokenRef = useRef(0);
  const objectUrlRef = useRef<string | null>(null);

  const revoke = useCallback(() => {
    if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    objectUrlRef.current = null;
    setPlaceholderUrl(null);
  }, []);

  useEffect(
    () => () => {
      tokenRef.current += 1;
      if (objectUrlRef.current) URL.revokeObjectURL(objectUrlRef.current);
    },
    [],
  );

  const upload = useCallback(
    async (file: File): Promise<UploadedImage | null> => {
      const invalid = validateImageFile(file);
      if (invalid) {
        setError(invalid);
        setState("failed");
        return null;
      }
      const token = ++tokenRef.current;
      revoke();
      const objectUrl = URL.createObjectURL(file);
      objectUrlRef.current = objectUrl;
      setPlaceholderUrl(objectUrl);
      setError(null);
      setState("uploading");
      try {
        const result = await uploadAdminImage(file);
        if (token !== tokenRef.current) return null;
        revoke();
        setState("uploaded");
        return result;
      } catch (uploadError) {
        if (token !== tokenRef.current) return null;
        revoke();
        setState("failed");
        setError(normalizeAdminError(uploadError).message || "Image upload failed. Try again.");
        return null;
      }
    },
    [revoke],
  );

  const reset = useCallback(() => {
    tokenRef.current += 1;
    revoke();
    setError(null);
    setState("idle");
  }, [revoke]);

  return {
    state,
    error,
    /** True while a request is in flight. */
    uploading: state === "uploading",
    /** Local `blob:` URL for display during upload only. Never store or emit it. */
    placeholderUrl,
    upload,
    reset,
    /** Shows a message without starting an upload (for example "only 2 more images allowed"). */
    setError,
  };
}
