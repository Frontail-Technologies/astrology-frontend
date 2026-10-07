"use client";

import { useCallback, useEffect, useState } from "react";
import { masterDataSeed } from "../data/master-data";
import type { LanguageRecord, MasterDataRecord, MasterDataStore, MasterDataType } from "../types/master-data";

const storageKey = "astrology-admin-master-data-v1";

export function useMasterDataRepository() {
  const [data, setData] = useState<MasterDataStore>(masterDataSeed);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const raw = localStorage.getItem(storageKey); if (raw) setData(JSON.parse(raw) as MasterDataStore); else localStorage.setItem(storageKey, JSON.stringify(masterDataSeed)); } catch { /* storage is optional */ } setReady(true); }, []);
  const persist = useCallback((next: MasterDataStore) => { setData(next); try { localStorage.setItem(storageKey, JSON.stringify(next)); } catch { /* storage is optional */ } }, []);
  const list = useCallback(<T extends MasterDataType>(type: T): MasterDataStore[T] => data[type], [data]);
  const get = useCallback((type: MasterDataType, id: string) => (data[type] as MasterDataRecord[]).find((item) => item.id === id) ?? null, [data]);
  const create = useCallback((type: MasterDataType, record: MasterDataRecord) => { const next = { ...data, [type]: [...data[type], record] } as MasterDataStore; if (type === "languages" && (record as LanguageRecord).isDefault) next.languages = next.languages.map((language) => ({ ...language, isDefault: language.id === record.id })); persist(next); }, [data, persist]);
  const update = useCallback((type: MasterDataType, record: MasterDataRecord) => { const next = { ...data, [type]: (data[type] as MasterDataRecord[]).map((item) => item.id === record.id ? record : item) } as MasterDataStore; if (type === "languages" && (record as LanguageRecord).isDefault) next.languages = next.languages.map((language) => ({ ...language, isDefault: language.id === record.id })); persist(next); }, [data, persist]);
  const remove = useCallback((type: MasterDataType, id: string) => persist({ ...data, [type]: (data[type] as MasterDataRecord[]).filter((item) => item.id !== id) } as MasterDataStore), [data, persist]);
  return { data, ready, list, get, create, update, remove };
}
