import { Geist, Geist_Mono } from "next/font/google";

import { AdminShell } from "@/features/admin/components/admin-shell";

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
      <AdminShell>{children}</AdminShell>
    </div>
  );
}
