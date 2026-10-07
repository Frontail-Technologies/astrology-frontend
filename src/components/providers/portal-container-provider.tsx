"use client";

import { createContext, useContext, useState, type ReactNode } from "react";

const PortalContainerContext = createContext<HTMLElement | null>(null);

export function usePortalContainer() {
  return useContext(PortalContainerContext);
}

export function AdminPortalContainerProvider({ children }: { children: ReactNode }) {
  const [container, setContainer] = useState<HTMLDivElement | null>(null);

  return (
    <PortalContainerContext.Provider value={container}>
      {children}
      <div ref={setContainer} data-theme="admin" />
    </PortalContainerContext.Provider>
  );
}
