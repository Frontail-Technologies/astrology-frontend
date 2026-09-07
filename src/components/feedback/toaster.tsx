"use client";

import { Toaster as SonnerToaster } from "sonner";

export function Toaster() {
  return (
    <SonnerToaster
      position="top-right"
      toastOptions={{
        classNames: {
          toast: "border-border bg-surface text-foreground",
          title: "text-foreground",
          description: "text-muted-foreground",
          actionButton: "bg-saffron-500 text-midnight-950",
          cancelButton: "bg-muted text-foreground"
        }
      }}
    />
  );
}
