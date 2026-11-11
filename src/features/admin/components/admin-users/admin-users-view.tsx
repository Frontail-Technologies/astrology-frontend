"use client";

import { useState } from "react";
import { Check, Copy, KeyRound, PencilLine, RefreshCw, Trash2, UserPlus, UserRoundCheck, UserRoundX } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAdminAccounts, useAdminStatus, useCreateAdmin, useDeleteAdmin, useRenameAdmin, useResetAdminPassword } from "@/features/admin-users/hooks/use-admin-users";
import { generateTemporaryPassword, isEmail, passwordProblem } from "@/features/admin-users/lib/admin-password";
import type { AdminAccount } from "@/features/admin-users/types/admin-user";
import { formatDateTime } from "../../lib/format";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";

const errorCopy: Record<string, string> = {
  EMAIL_IN_USE: "An account with this email already exists.",
  CANNOT_DEACTIVATE_SELF: "You can't deactivate your own account.",
  LAST_ACTIVE_ADMIN: "At least one active admin must remain.",
  USE_CHANGE_PASSWORD: "Change your own password from the key button in the sidebar.",
  CANNOT_DELETE_SELF: "You can't delete your own account.",
};

function Pill({ tone, children }: { tone: "success" | "muted" | "warning"; children: React.ReactNode }) {
  const tones = { success: "bg-success/12 text-foreground", muted: "bg-muted text-muted-foreground", warning: "bg-warning/15 text-foreground" };
  return <span className={`inline-flex h-6 items-center rounded-full px-2 text-xs font-medium ${tones[tone]}`}>{children}</span>;
}

/** Shows a temporary password once, with copy, so it can be passed on securely. */
function PasswordReveal({ password }: { password: string }) {
  const [copied, setCopied] = useState(false);
  return (
    <div className="grid gap-2 rounded-[calc(var(--radius)-2px)] border border-border bg-muted p-3">
      <p className="text-xs text-muted-foreground">Temporary password. Share it privately; it won&apos;t be shown again. They must change it when they sign in.</p>
      <div className="flex items-center gap-2">
        <code className="flex-1 break-all rounded bg-surface px-2 py-1.5 font-mono text-sm">{password}</code>
        <Button
          type="button"
          size="sm"
          variant="outline"
          className="bg-surface"
          onClick={() => {
            void navigator.clipboard?.writeText(password).then(() => setCopied(true));
          }}
        >
          {copied ? <Check aria-hidden="true" /> : <Copy aria-hidden="true" />}
          {copied ? "Copied" : "Copy"}
        </Button>
      </div>
    </div>
  );
}

function TemporaryPasswordField({ id, value, onChange }: { id: string; value: string; onChange: (value: string) => void }) {
  const problem = value ? passwordProblem(value) : null;
  return (
    <div className="grid gap-1.5">
      <Label htmlFor={id}>Temporary password</Label>
      <div className="flex gap-2">
        <Input id={id} value={value} onChange={(event) => onChange(event.target.value)} className="font-mono" autoComplete="off" spellCheck={false} />
        <Button type="button" variant="outline" className="bg-surface" onClick={() => onChange(generateTemporaryPassword())}>
          <RefreshCw aria-hidden="true" />
          Generate
        </Button>
      </div>
      <p className={problem ? "text-xs text-destructive" : "text-xs text-muted-foreground"}>{problem ?? "At least 12 characters. They choose their own at first sign-in."}</p>
    </div>
  );
}

function AddAdminDialog({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const create = useCreateAdmin();
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [password, setPassword] = useState(() => generateTemporaryPassword());
  const [created, setCreated] = useState<{ email: string; password: string } | null>(null);
  const valid = isEmail(email) && passwordProblem(password) === null && (name.trim() === "" || name.trim().length >= 2);
  const close = (next: boolean) => {
    if (!next) {
      setEmail("");
      setName("");
      setPassword(generateTemporaryPassword());
      setCreated(null);
      create.reset();
    }
    onOpenChange(next);
  };

  return (
    <AdminConfirmDialog
      open={open}
      onOpenChange={close}
      title={created ? "Admin added" : "Add an admin"}
      description={created ? `${created.email} can now sign in at /admin/login.` : "New admins get full access to the admin panel."}
      confirmLabel={created ? "Done" : "Add admin"}
      pending={create.isPending}
      error={create.error && !errorCopy[create.error.code] ? create.error : null}
      confirmDisabled={!created && !valid}
      onConfirm={() => {
        if (created) return close(false);
        create.mutate(
          { email: email.trim(), temporaryPassword: password, ...(name.trim() ? { displayName: name.trim() } : {}) },
          { onSuccess: (account) => setCreated({ email: account.email, password }) },
        );
      }}
    >
      {created ? (
        <PasswordReveal password={created.password} />
      ) : (
        <div className="grid gap-3">
          <div className="grid gap-1.5">
            <Label htmlFor="new-admin-email">Email</Label>
            <Input id="new-admin-email" type="email" value={email} onChange={(event) => setEmail(event.target.value)} autoComplete="off" />
          </div>
          <div className="grid gap-1.5">
            <Label htmlFor="new-admin-name">Name (optional)</Label>
            <Input id="new-admin-name" value={name} onChange={(event) => setName(event.target.value)} maxLength={120} />
          </div>
          <TemporaryPasswordField id="new-admin-password" value={password} onChange={setPassword} />
          {create.error && errorCopy[create.error.code] ? <p className="text-sm text-destructive">{errorCopy[create.error.code]}</p> : null}
        </div>
      )}
    </AdminConfirmDialog>
  );
}

type Dialog = "rename" | "reset" | "deactivate" | "reactivate" | "delete" | null;

function AdminRow({ admin }: { admin: AdminAccount }) {
  const [dialog, setDialog] = useState<Dialog>(null);
  const [name, setName] = useState(admin.displayName ?? "");
  const [password, setPassword] = useState("");
  const [revealed, setRevealed] = useState<string | null>(null);
  const rename = useRenameAdmin(admin.id);
  const status = useAdminStatus(admin.id);
  const reset = useResetAdminPassword(admin.id);
  const remove = useDeleteAdmin(admin.id);
  const active = admin.status === "active";
  const label = admin.displayName ?? admin.email;
  const open = (next: Dialog) => {
    rename.reset();
    status.reset();
    reset.reset();
    remove.reset();
    setName(admin.displayName ?? "");
    setPassword(generateTemporaryPassword());
    setRevealed(null);
    setDialog(next);
  };
  const close = () => setDialog(null);
  const statusError = status.error ? (errorCopy[status.error.code] ?? status.error.message) : null;
  const removeError = remove.error ? (errorCopy[remove.error.code] ?? remove.error.message) : null;

  return (
    <li className="flex flex-wrap items-center gap-3 py-3 sm:flex-nowrap">
      <div className="grid size-9 shrink-0 place-items-center rounded-full bg-muted text-xs font-semibold uppercase">{label.slice(0, 2)}</div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium">
          {label}
          {admin.isYou ? <span className="ml-1.5 text-xs font-normal text-muted-foreground">(you)</span> : null}
        </p>
        <p className="truncate text-xs text-muted-foreground">
          {admin.displayName ? `${admin.email} · ` : ""}
          {admin.lastLoginAt ? `Last sign-in ${formatDateTime(admin.lastLoginAt)}` : "Never signed in"}
        </p>
      </div>
      <div className="flex items-center gap-2">
        {admin.mustChangePassword && active ? <Pill tone="warning">Temporary password</Pill> : null}
        <Pill tone={active ? "success" : "muted"}>{active ? "Active" : "Deactivated"}</Pill>
        <AdminRowActions
          label={`Actions for ${label}`}
          actions={[
            { label: "Edit name", icon: PencilLine, onSelect: () => open("rename") },
            ...(admin.isYou ? [] : [{ label: "Reset password", icon: KeyRound, onSelect: () => open("reset") }]),
            ...(admin.isYou ? [] : active ? [{ label: "Deactivate", icon: UserRoundX, destructive: true, separatorBefore: true, onSelect: () => open("deactivate") }] : [{ label: "Reactivate", icon: UserRoundCheck, separatorBefore: true, onSelect: () => open("reactivate") }]),
            ...(admin.isYou ? [] : [{ label: "Delete", icon: Trash2, destructive: true, onSelect: () => open("delete") }]),
          ]}
        />
      </div>

      <AdminConfirmDialog
        open={dialog === "rename"}
        onOpenChange={(next) => !next && close()}
        title="Edit name"
        description={admin.email}
        confirmLabel="Save"
        pending={rename.isPending}
        error={rename.error}
        confirmDisabled={name.trim() !== "" && name.trim().length < 2}
        onConfirm={() => rename.mutate(name.trim() || null, { onSuccess: close })}
      >
        <div className="grid gap-1.5">
          <Label htmlFor={`admin-name-${admin.id}`}>Name</Label>
          <Input id={`admin-name-${admin.id}`} value={name} onChange={(event) => setName(event.target.value)} maxLength={120} placeholder="Leave empty to show the email" />
        </div>
      </AdminConfirmDialog>

      <AdminConfirmDialog
        open={dialog === "reset"}
        onOpenChange={(next) => !next && close()}
        title={revealed ? "Temporary password set" : `Reset ${label}'s password?`}
        description={revealed ? "They have been signed out everywhere." : "They're signed out everywhere and must choose a new password at their next sign-in."}
        confirmLabel={revealed ? "Done" : "Reset password"}
        pending={reset.isPending}
        error={reset.error}
        confirmDisabled={!revealed && passwordProblem(password) !== null}
        onConfirm={() => (revealed ? close() : reset.mutate(password, { onSuccess: () => setRevealed(password) }))}
      >
        {revealed ? <PasswordReveal password={revealed} /> : <TemporaryPasswordField id={`admin-reset-${admin.id}`} value={password} onChange={setPassword} />}
      </AdminConfirmDialog>

      <AdminConfirmDialog
        open={dialog === "deactivate" || dialog === "reactivate"}
        onOpenChange={(next) => !next && close()}
        title={dialog === "deactivate" ? `Deactivate ${label}?` : `Reactivate ${label}?`}
        description={dialog === "deactivate" ? "They're signed out immediately and can't sign in until reactivated. Their audit history stays." : "They can sign in again with their current password."}
        confirmLabel={dialog === "deactivate" ? "Deactivate" : "Reactivate"}
        destructive={dialog === "deactivate"}
        pending={status.isPending}
        onConfirm={() => status.mutate(dialog === "reactivate", { onSuccess: close })}
      >
        {statusError ? <p className="text-sm text-destructive">{statusError}</p> : null}
      </AdminConfirmDialog>

      <AdminConfirmDialog
        open={dialog === "delete"}
        onOpenChange={(next) => !next && close()}
        title={`Delete ${label}?`}
        description="They're signed out and removed from this list, and can't sign in again. Their past changes stay in the Audit Log under their name. Adding the same email later restores the account."
        confirmLabel="Delete admin"
        destructive
        pending={remove.isPending}
        onConfirm={() => remove.mutate(undefined, { onSuccess: close })}
      >
        {removeError ? <p className="text-sm text-destructive">{removeError}</p> : null}
      </AdminConfirmDialog>
    </li>
  );
}

/** Admin accounts: everyone listed here has full access to the admin panel. */
export function AdminUsersView() {
  const accounts = useAdminAccounts();
  const [adding, setAdding] = useState(false);
  return (
    <AdminDetailFrame ready={accounts.ready} error={accounts.error} onRetry={accounts.reload} noun="admins">
      {() => {
        const items = accounts.data?.items ?? [];
        const active = items.filter((item) => item.status === "active");
        const inactive = items.filter((item) => item.status !== "active");
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title="Admins"
              description="People who can sign in to this admin panel. Every admin has full access."
              meta={<span className="tabular-nums">{active.length} active{inactive.length ? ` · ${inactive.length} deactivated` : ""}</span>}
              primaryAction={
                <Button variant="conversion" onClick={() => setAdding(true)}>
                  <UserPlus aria-hidden="true" />
                  Add admin
                </Button>
              }
            />
            <AdminSectionCard title="Active">
              <ul className="divide-y divide-border">
                {active.map((admin) => (
                  <AdminRow key={admin.id} admin={admin} />
                ))}
              </ul>
            </AdminSectionCard>
            {inactive.length ? (
              <AdminSectionCard title="Deactivated">
                <ul className="divide-y divide-border">
                  {inactive.map((admin) => (
                    <AdminRow key={admin.id} admin={admin} />
                  ))}
                </ul>
              </AdminSectionCard>
            ) : null}
            <AddAdminDialog open={adding} onOpenChange={setAdding} />
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
