"use client";

import { useEffect, useRef, useState } from "react";

import type { ProductMedia } from "@/features/store/types/store";
import { fileToStorableDataUrl } from "../lib/image-data-url";

/** Owns only session object URLs used by Store's multi-image editor. */
export function useSessionImageCollection(initialMedia: ProductMedia[] = []) {
  const urls = useRef<string[]>([]);
  const [media, setMedia] = useState<ProductMedia[]>(initialMedia);
  const [version, setVersion] = useState(0);

  useEffect(() => () => urls.current.forEach((url) => URL.revokeObjectURL(url)), []);

  const addFiles = (files: FileList | null) => {
    if (!files) return { rejected: false };
    const fileList = Array.from(files);
    const accepted = fileList.filter((file) => file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024);
    if (accepted.length) {
      // Data URLs (not blob: URLs) so saved product media survives a page refresh.
      void Promise.all(accepted.map(async (file) => ({ src: await fileToStorableDataUrl(file), alt: file.name }))).then((additions) => {
        setMedia((current) => [...current, ...additions]);
        setVersion((current) => current + 1);
      });
    }
    return { rejected: accepted.length !== fileList.length };
  };

  const addUrl = (src: string) => { setMedia((current) => [...current, { src }]); setVersion((current) => current + 1); };
  const remove = (index: number) => {
    setMedia((current) => {
      const removed = current[index];
      if (removed?.src.startsWith("blob:")) {
        URL.revokeObjectURL(removed.src);
        urls.current = urls.current.filter((url) => url !== removed.src);
      }
      return current.filter((_, itemIndex) => itemIndex !== index);
    });
    setVersion((current) => current + 1);
  };
  const move = (index: number, direction: -1 | 1) => {
    const target = index + direction;
    if (target < 0 || target >= media.length) return;
    setMedia((current) => { const next = [...current]; [next[index], next[target]] = [next[target], next[index]]; return next; });
    setVersion((current) => current + 1);
  };
  const setPrimary = (index: number) => {
    if (index <= 0 || index >= media.length) return;
    setMedia((current) => [current[index], ...current.filter((_, itemIndex) => itemIndex !== index)]);
    setVersion((current) => current + 1);
  };
  const updateAlt = (index: number, alt: string) => {
    setMedia((current) => current.map((item, itemIndex) => itemIndex === index ? { ...item, alt } : item));
    setVersion((current) => current + 1);
  };

  return { media, isDirty: version > 0, addFiles, addUrl, remove, move, setPrimary, updateAlt };
}
