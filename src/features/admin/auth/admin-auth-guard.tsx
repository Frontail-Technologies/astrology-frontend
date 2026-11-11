"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";

import { useAdminAuth } from "./admin-auth-context";

export function AdminAuthGuard({ children }: { children: React.ReactNode }) {
  const { ready, user } = useAdminAuth();
  const router = useRouter();
  const pathname = usePathname();

  const mustChangePassword = Boolean(user?.mustChangePassword);

  useEffect(() => {
    if (ready && !user) {
      const next = pathname.startsWith("/admin") ? `?next=${encodeURIComponent(pathname)}` : "";
      router.replace(`/admin/login${next}`);
    } else if (ready && mustChangePassword) {
      // A temporary password must be replaced first; the API refuses other admin calls until then.
      router.replace(`/admin/change-password?next=${encodeURIComponent(pathname)}`);
    }
  }, [mustChangePassword, pathname, ready, router, user]);

  if (!ready || !user || mustChangePassword) {
    return (
      <div data-theme="admin" className="grid min-h-svh place-items-center bg-background">
        <p className="text-sm text-muted-foreground">Checking administrator session...</p>
      </div>
    );
  }

  return children;
}
