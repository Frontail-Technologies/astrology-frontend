import { Geist, Geist_Mono } from "next/font/google";

import { AdminShell } from "@/features/admin/components/admin-shell";
import { AdminAuthGuard } from "@/features/admin/auth/admin-auth-guard";
import { AdminAuthProvider } from "@/features/admin/auth/admin-auth-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className={`${geistSans.variable} ${geistMono.variable}`}>
      <AdminAuthProvider>
        <AdminAuthGuard>
          <AdminShell>{children}</AdminShell>
        </AdminAuthGuard>
      </AdminAuthProvider>
    </div>
  );
}
