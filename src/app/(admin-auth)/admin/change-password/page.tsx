"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { KeyRound } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { AdminAuthProvider, useAdminAuth } from "@/features/admin/auth/admin-auth-context";
import { changeOwnPassword } from "@/features/admin-users/api/admin-user-api";
import { passwordProblem } from "@/features/admin-users/lib/admin-password";
import { ApiError } from "@/lib/api/api-error";

function ChangePasswordForm() {
  const { ready, user, reload } = useAdminAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [current, setCurrent] = useState("");
  const [next, setNext] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const forced = Boolean(user?.mustChangePassword);

  useEffect(() => {
    if (ready && !user) router.replace("/admin/login?next=/admin/change-password");
  }, [ready, router, user]);

  async function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const problem = passwordProblem(next);
    if (problem) return setError(problem);
    if (next !== confirm) return setError("The new passwords don't match.");
    setError(null);
    setSubmitting(true);
    try {
      await changeOwnPassword(current, next);
      await reload();
      const target = searchParams.get("next");
      router.replace(target?.startsWith("/admin") && target !== "/admin/change-password" ? target : "/admin");
    } catch (caught) {
      if (caught instanceof ApiError && caught.code === "INVALID_CURRENT_PASSWORD") setError(forced ? "The temporary password is incorrect." : "Your current password is incorrect.");
      else setError(caught instanceof Error ? caught.message : "Could not change the password");
    } finally {
      setSubmitting(false);
    }
  }

  if (!ready || !user) {
    return <div data-theme="admin" className="grid min-h-svh place-items-center bg-background text-sm text-muted-foreground">Checking administrator session...</div>;
  }

  return (
    <main data-theme="admin" className="grid min-h-svh place-items-center bg-background px-4 py-8">
      <Card className="w-full max-w-sm shadow-sm">
        <CardHeader className="space-y-3">
          <div className="flex items-center gap-3">
            <span className="grid size-10 place-items-center rounded-md bg-primary text-primary-foreground">
              <KeyRound className="size-5" aria-hidden="true" />
            </span>
            <div>
              <CardTitle className="font-sans text-lg">{forced ? "Choose your password" : "Change password"}</CardTitle>
              <p className="text-sm text-muted-foreground">{forced ? "Replace the temporary password you were given." : user.email}</p>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <form className="space-y-4" onSubmit={submit}>
            <div className="space-y-1.5">
              <Label htmlFor="current-password">{forced ? "Temporary password" : "Current password"}</Label>
              <Input id="current-password" type="password" autoComplete="current-password" required value={current} onChange={(event) => setCurrent(event.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="new-password">New password</Label>
              <Input id="new-password" type="password" autoComplete="new-password" required value={next} onChange={(event) => setNext(event.target.value)} />
              <p className="text-xs text-muted-foreground">At least 12 characters.</p>
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input id="confirm-password" type="password" autoComplete="new-password" required value={confirm} onChange={(event) => setConfirm(event.target.value)} />
            </div>
            {error ? <p role="alert" className="text-sm text-destructive">{error}</p> : null}
            <Button className="w-full" type="submit" disabled={submitting}>
              {submitting ? "Saving..." : "Save password"}
            </Button>
            {forced ? null : (
              <Button className="w-full" type="button" variant="ghost" onClick={() => router.back()}>
                Cancel
              </Button>
            )}
          </form>
        </CardContent>
      </Card>
    </main>
  );
}

export default function AdminChangePasswordPage() {
  return (
    <AdminAuthProvider>
      <Suspense fallback={<div data-theme="admin" className="grid min-h-svh place-items-center bg-background text-sm text-muted-foreground">Loading...</div>}>
        <ChangePasswordForm />
      </Suspense>
    </AdminAuthProvider>
  );
}
