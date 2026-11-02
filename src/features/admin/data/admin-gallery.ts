/**
 * Immutable operations for an ordered image gallery with exactly one primary image (when non-empty). Pure (no
 * React, no `@/` aliases) so it runs under `node --test`. Used by `AdminImageGalleryField`.
 */
export type AdminGalleryImage = { url: string; alt: string; isPrimary: boolean };

/** Guarantees exactly one primary when non-empty: keeps the first flagged image, otherwise promotes index 0. */
export function normalizeGallery<T extends AdminGalleryImage>(images: readonly T[]): T[] {
  const primaryIndex = Math.max(
    0,
    images.findIndex((image) => image.isPrimary),
  );
  return images.map((image, index) => (image.isPrimary === (index === primaryIndex) ? image : { ...image, isPrimary: index === primaryIndex }));
}

/** Appends images (up to `max` in total; extras are dropped) and normalizes. */
export function addGalleryImages<T extends AdminGalleryImage>(images: readonly T[], additions: readonly T[], max = Infinity): T[] {
  const room = Math.max(0, max - images.length);
  return normalizeGallery([...images, ...additions.slice(0, room).map((image) => ({ ...image, isPrimary: false }))]);
}

/** Removes one image; if it was primary, the new first image becomes primary. */
export function removeGalleryImage<T extends AdminGalleryImage>(images: readonly T[], index: number): T[] {
  if (index < 0 || index >= images.length) return [...images];
  return normalizeGallery(images.filter((_, itemIndex) => itemIndex !== index));
}

/** Moves the image at `index` by `delta` positions (clamped). Primary stays with the same image. */
export function moveGalleryImage<T extends AdminGalleryImage>(images: readonly T[], index: number, delta: number): T[] {
  const target = Math.min(images.length - 1, Math.max(0, index + delta));
  if (index < 0 || index >= images.length || target === index) return [...images];
  const next = [...images];
  const [item] = next.splice(index, 1);
  next.splice(target, 0, item);
  return next;
}

export function setGalleryPrimary<T extends AdminGalleryImage>(images: readonly T[], index: number): T[] {
  if (index < 0 || index >= images.length) return [...images];
  return images.map((image, itemIndex) => (image.isPrimary === (itemIndex === index) ? image : { ...image, isPrimary: itemIndex === index }));
}

export function setGalleryAlt<T extends AdminGalleryImage>(images: readonly T[], index: number, alt: string): T[] {
  return images.map((image, itemIndex) => (itemIndex === index ? { ...image, alt } : image));
}
