"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAdminAuth } from "./admin-auth-context";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (ready && !user) {
      const next = pathname.startsWith("/admin") ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/admin/login${next}`);
    }
  }, [pathname, ready, router, user]);

  if (!ready || !user) {
    return (
      <div data-theme="admin" className="grid min-h-svh place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Checking administrator session...</p>
      </div>
    );
  }

  return children;
}
