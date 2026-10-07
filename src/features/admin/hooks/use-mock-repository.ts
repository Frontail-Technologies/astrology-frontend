"use client";

import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";

export type MockRecord = { id: string; slug?: string };

/**
 * Generic localStorage-backed mock repository for Admin UI development.
 * Reads seed data on first mount (writing it to localStorage), then reflects
 * localStorage for all subsequent operations. Mutations are synchronous in
 * React state and persisted to localStorage. SSR-safe: useState initialises
 * with seedData (deterministic) and the useEffect runs only on the client.
 *
 * Replace with an API-backed equivalent later by swapping this hook — no
 * component should call localStorage directly.
 */
export function useMockRepository<T extends MockRecord>(
  storageKey: string,
  seedData: T[],
) {
  const [records, setRecords] = useState<T[]>(seedData);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as T[];
        setRecords(parsed.length ? parsed : seedData);
      } else {
        localStorage.setItem(storageKey, JSON.stringify(seedData));
      }
    } catch {
      // localStorage blocked or malformed — silently fall back to seed data.
    }
    setReady(true);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const persist = useCallback(
    (next: T[]) => {
      setRecords(next);
      try {
        localStorage.setItem(storageKey, JSON.stringify(next));
      } catch {
        toast.error("Could not save changes. Browser storage may be full.");
      }
    },
    [storageKey],
  );

  const getById = useCallback(
    (id: string) => records.find((r) => r.id === id) ?? null,
    [records],
  );

  const getBySlug = useCallback(
    (slug: string) => records.find((r) => r.slug === slug) ?? null,
    [records],
  );

  const slugExists = useCallback(
    (slug: string, excludeId?: string) =>
      records.some((r) => r.slug === slug && r.id !== excludeId),
    [records],
  );

  const create = useCallback(
    (record: T) => {
      persist([...records, record]);
    },
    [records, persist],
  );

  const update = useCallback(
    (record: T) => {
      persist(records.map((r) => (r.id === record.id ? record : r)));
    },
    [records, persist],
  );

  const remove = useCallback(
    (id: string) => {
      persist(records.filter((r) => r.id !== id));
    },
    [records, persist],
  );

  /** Dev-only — resets localStorage to the seed data. Never expose in normal UI. */
  const resetToSeed = useCallback(() => {
    persist([...seedData]);
  }, [persist, seedData]);

  return { records, ready, getById, getBySlug, slugExists, create, update, remove, resetToSeed };
}
