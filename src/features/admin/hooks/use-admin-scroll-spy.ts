"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useAdminScrollSpy(sectionIds: string[]) {
  const [activeId, setActiveId] = useState(sectionIds[0] ?? "");
  const pendingTargetRef = useRef<string | null>(null);

  useEffect(() => {
    const updateActiveSection = () => {
      const pendingTarget = pendingTargetRef.current;
      if (pendingTarget) {
        const target = document.getElementById(pendingTarget);
        const reachedTarget = target && target.getBoundingClientRect().top <= 26;
        if (!reachedTarget) return;
        pendingTargetRef.current = null;
      }
      const scrollBottom = window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2;
      if (scrollBottom) {
        setActiveId(sectionIds.at(-1) ?? "");
        return;
      }
      const offset = 24;
      const current = sectionIds.findLast((id) => {
        const section = document.getElementById(id);
        return section ? section.getBoundingClientRect().top <= offset : false;
      });
      setActiveId(current ?? sectionIds[0] ?? "");
    };
    updateActiveSection();
    window.addEventListener("scroll", updateActiveSection, { passive: true });
    window.addEventListener("resize", updateActiveSection);
    return () => { window.removeEventListener("scroll", updateActiveSection); window.removeEventListener("resize", updateActiveSection); };
  }, [sectionIds]);

  const scrollToSection = useCallback((id: string) => {
    pendingTargetRef.current = id;
    setActiveId(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, []);

  return { activeId, scrollToSection };
}
