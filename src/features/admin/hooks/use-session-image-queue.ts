"use client";

import { useCallback, useEffect, useRef, useState } from "react";

import { normalizeAdminError } from "@/features/admin/data/admin-errors";
import { uploadAdminImage, type UploadedImage } from "@/features/media/media-api";
import { validateImageFile } from "@/features/media/media-constraints";

export type PendingImageUpload = { id: number; name: string; placeholderUrl: string };

/**
 * Sequential multi-file upload queue for gallery fields. Each accepted file gets a local `blob:` placeholder (for
 * display only; revoked when its upload settles or on unmount) and is uploaded one at a time. `onUploaded` runs
 * once per successful upload with the server image; failures and rejected files are collected in `errors`.
 */
export function useSessionImageQueue({ onUploaded }: { onUploaded: (image: UploadedImage, file: File) => void }) {
  const [pending, setPending] = useState<PendingImageUpload[]>([]);
  const [errors, setErrors] = useState<string[]>([]);
  const onUploadedRef = useRef(onUploaded);
  const queueRef = useRef<{ item: PendingImageUpload; file: File }[]>([]);
  const runningRef = useRef(false);
  const mountedRef = useRef(true);
  const nextIdRef = useRef(1);
  useEffect(() => {
    onUploadedRef.current = onUploaded;
  });
  useEffect(() => {
    mountedRef.current = true;
    return () => {
      mountedRef.current = false;
      for (const { item } of queueRef.current) URL.revokeObjectURL(item.placeholderUrl);
      queueRef.current = [];
    };
  }, []);

  const run = useCallback(async () => {
    if (runningRef.current) return;
    runningRef.current = true;
    while (queueRef.current.length && mountedRef.current) {
      const { item, file } = queueRef.current[0];
      try {
        const image = await uploadAdminImage(file);
        if (mountedRef.current) onUploadedRef.current(image, file);
      } catch (error) {
        if (mountedRef.current) setErrors((current) => [...current, `${file.name}: ${normalizeAdminError(error).message}`]);
      } finally {
        queueRef.current = queueRef.current.slice(1);
        URL.revokeObjectURL(item.placeholderUrl);
        if (mountedRef.current) setPending((current) => current.filter((entry) => entry.id !== item.id));
      }
    }
    runningRef.current = false;
  }, []);

  /** Validates and queues files; at most `limit` are accepted (extras are reported in `errors`). */
  const enqueue = useCallback(
    (files: Iterable<File>, limit = Infinity) => {
      const accepted: { item: PendingImageUpload; file: File }[] = [];
      const rejected: string[] = [];
      let skipped = 0;
      for (const file of files) {
        const invalid = validateImageFile(file);
        if (invalid) rejected.push(`${file.name}: ${invalid}`);
        else if (accepted.length >= limit) skipped += 1;
        else accepted.push({ file, item: { id: nextIdRef.current++, name: file.name, placeholderUrl: URL.createObjectURL(file) } });
      }
      if (skipped) rejected.push(`${skipped} image${skipped === 1 ? " was" : "s were"} not added: the gallery limit was reached.`);
      setErrors(rejected);
      if (!accepted.length) return;
      queueRef.current = [...queueRef.current, ...accepted];
      setPending((current) => [...current, ...accepted.map(({ item }) => item)]);
      void run();
    },
    [run],
  );

  const clearErrors = useCallback(() => setErrors([]), []);

  return { pending, errors, uploading: pending.length > 0, enqueue, clearErrors };
}
