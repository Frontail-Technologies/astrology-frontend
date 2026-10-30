"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Sparkles } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminAuthProvider, useAdminAuth } from "@/features/admin/auth/admin-auth-context";
import { ApiError } from "@/lib/api/api-error";

function AdminLoginForm() {
  const { login } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await login(email, password);
      const next = searchParams.get("next");
      router.replace(next?.startsWith("/admin") ? next : "/admin");
    } catch (caught) {
      setError(caught instanceof ApiError || caught instanceof Error ? caught.message : "Unable to sign in");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main data-theme="admin" className="grid min-h-svh place-items-center bg-background px-4 py-8">
      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <Sparkles className="size-5" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="font-sans text-lg">Astrology Admin</CardTitle>
              <p className="text-sm text-muted-foreground">Sign in to continue</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-1.5">
              <Label htmlFor="admin-email">Email</Label>
              <Input id="admin-email" type="email" autoComplete="username" required value={email} onChange={(event) => setEmail(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="admin-password">Password</Label>
              <Input id="admin-password" type="password" autoComplete="current-password" required value={password} onChange={(event) => setPassword(event.target.value)} />
            </div>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={submitting}>
              <LockKeyhole aria-hidden="true" />
              {submitting ? "Signing in..." : "Sign in"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function AdminLoginPage() {
  return (
    <AdminAuthProvider>
      <Suspense fallback={<div data-theme="admin" className="grid min-h-svh place-items-center bg-background text-sm text-muted-foreground">Loading...</div>}>
        <AdminLoginForm />
      </Suspense>
    </AdminAuthProvider>
  );
}
