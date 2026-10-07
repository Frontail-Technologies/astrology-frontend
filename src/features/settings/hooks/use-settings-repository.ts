"use client";

import { useCallback, useEffect, useState } from "react";
import { defaultSettings } from "../data/settings";
import type { AdminSettings, SettingsSection } from "../types/settings";

const STORE_KEY = "astrology-admin-settings-v1";
const cloneDefaults = () => structuredClone(defaultSettings);

export function useSettingsRepository() {
  const [settings, setSettings] = useState<AdminSettings>(cloneDefaults);
  const [ready, setReady] = useState(false);
  useEffect(() => { try { const stored = localStorage.getItem(STORE_KEY); if (stored) setSettings(JSON.parse(stored) as AdminSettings); else localStorage.setItem(STORE_KEY, JSON.stringify(defaultSettings)); } finally { setReady(true); } }, []);
  const updateSection = useCallback(<K extends SettingsSection>(section: K, values: AdminSettings[K]) => { setSettings((current) => { const next = { ...current, [section]: values }; localStorage.setItem(STORE_KEY, JSON.stringify(next)); return next; }); }, []);
  const resetSection = useCallback(<K extends SettingsSection>(section: K) => updateSection(section, cloneDefaults()[section]), [updateSection]);
  return { settings, ready, updateSection, resetSection };
}
