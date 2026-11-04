"use client";

import Link from "next/link";
import { BadgeCheck, Ban, EyeOff, FileClock, Pencil, Star, StarOff, Undo2, XCircle, type LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  ASTROLOGER_NOT_VERIFIED,
  astrologerModeLabels,
  availabilityLabels,
  availabilityVariants,
  verificationLabels,
  verificationVariants,
  visibilityLabels,
  visibilityVariants,
} from "@/features/astrologers/constants/astrologer-status";
import { useAstrologerDetail, useAstrologerStatusUpdate } from "@/features/astrologers/hooks/use-astrologer-admin";
import type { AstrologerStatusInput, ManagedAstrologer } from "@/features/astrologers/types/astrologer-admin";
import { formatDateTime, formatINR } from "../../lib/format";
import { AdminConfirmDialog } from "../shared/admin-confirm-dialog";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminRowActions } from "../shared/admin-row-actions";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { AdminStatusBadge, AdminStatusPill } from "../shared/admin-status-badge";
import { useConfirmAction } from "../shared/use-confirm-action";
import { AstrologerAvatar } from "./astrologer-avatar";
import { AstrologerDocumentsCard } from "./astrologer-documents-card";
import { AstrologerRelatedPanels } from "./astrologer-related-panels";
import { AstrologerSignInCard } from "./astrologer-sign-in-card";

type StatusAction = {
  key: string;
  label: string;
  input: AstrologerStatusInput;
  title: string;
  description: string;
  destructive?: boolean;
  icon?: LucideIcon;
};

/**
 * Actions offered for the current state. The backend stays authoritative: it refuses publishing an unverified
 * astrologer (ASTROLOGER_NOT_VERIFIED) and every result comes from the server response.
 */
function statusActions(astrologer: ManagedAstrologer): StatusAction[] {
  const actions: StatusAction[] = [];
  const { verificationStatus: verification, visibilityStatus: visibility } = astrologer;
  if (verification !== "verified") {
    actions.push({ key: "verify", label: "Verify", icon: BadgeCheck, input: { verificationStatus: "verified" }, title: "Verify this astrologer?", description: "Confirms their identity and credentials were reviewed. They can then be published." });
  }
  if (verification === "pending") {
    actions.push({ key: "reject", label: "Reject application", icon: XCircle, input: { verificationStatus: "rejected" }, title: "Reject this application?", description: "The astrologer stays unpublished until verified.", destructive: true });
  }
  if (verification === "verified") {
    actions.push({ key: "unverify", label: "Revoke verification", icon: Undo2, input: { verificationStatus: "pending" }, title: "Move back to pending review?", description: "A published astrologer must be unpublished first; otherwise the change is refused.", destructive: true });
  }
  if (visibility === "draft") {
    actions.push({ key: "publish", label: "Publish", input: { visibilityStatus: "published" }, title: "Publish this astrologer?", description: "Their profile becomes visible and bookable. Only verified astrologers can be published." });
  }
  if (visibility === "published") {
    actions.push({ key: "unpublish", label: "Unpublish", icon: EyeOff, input: { visibilityStatus: "draft" }, title: "Unpublish this astrologer?", description: "Their profile is hidden from customers. Existing consultations are not changed." });
    actions.push({ key: "suspend", label: "Suspend", icon: Ban, input: { visibilityStatus: "suspended" }, title: "Suspend this astrologer?", description: "Their profile is hidden and they cannot take new consultations until reactivated.", destructive: true });
  }
  if (visibility === "suspended") {
    actions.push({ key: "reactivate", label: "Reactivate", input: { visibilityStatus: "published" }, title: "Reactivate and publish?", description: "Their profile becomes visible again. Only verified astrologers can be published." });
    actions.push({ key: "draft", label: "Move to draft", icon: FileClock, input: { visibilityStatus: "draft" }, title: "Move to draft?", description: "Lifts the suspension but keeps the profile hidden." });
  }
  actions.push(
    astrologer.featured
      ? { key: "unfeature", label: "Remove from featured", icon: StarOff, input: { featured: false }, title: "Remove from featured?", description: "They no longer appear in featured placements." }
      : { key: "feature", label: "Feature", icon: Star, input: { featured: true }, title: "Feature this astrologer?", description: "They appear in featured placements while published." },
  );
  return actions;
}

/** The one committed next step for the current state, shown as the saffron header button. */
function primaryActionKey(astrologer: ManagedAstrologer) {
  if (astrologer.verificationStatus !== "verified") return "verify";
  if (astrologer.visibilityStatus === "draft") return "publish";
  if (astrologer.visibilityStatus === "suspended") return "reactivate";
  return null;
}

const yearsLabel = (years: number) => (years === 1 ? "1 year" : `${years} years`);

export function AdminAstrologerDetailView({ astrologerId }: { astrologerId: string }) {
  const detail = useAstrologerDetail(astrologerId);
  const mutation = useAstrologerStatusUpdate(astrologerId);
  const confirm = useConfirmAction<StatusAction>(mutation);
  const { target: pending } = confirm;

  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="astrologer">
      {() => {
        const astrologer = detail.data!;
        const actions = statusActions(astrologer);
        const primaryKey = primaryActionKey(astrologer);
        const primary = actions.find((action) => action.key === primaryKey) ?? null;
        const menu = actions.filter((action) => action !== primary);
        const notVerified = mutation.error?.code === ASTROLOGER_NOT_VERIFIED;
        const location = [astrologer.city, astrologer.country].filter(Boolean).join(", ");
        return (
          <div className="space-y-5">
            <AdminPageHeader
              title={astrologer.displayName}
              backHref="/admin/astrologers"
              backLabel="Astrologers"
              meta={
                <>
                  <AdminStatusBadge status={astrologer.verificationStatus} labels={verificationLabels} variants={verificationVariants} />
                  <AdminStatusBadge status={astrologer.visibilityStatus} labels={visibilityLabels} variants={visibilityVariants} />
                  {astrologer.featured ? (
                    <AdminStatusPill tone="neutral" dot={false}>
                      Featured
                    </AdminStatusPill>
                  ) : null}
                  <span className="tabular-nums">Updated {formatDateTime(astrologer.updatedAt)}</span>
                </>
              }
              actions={
                <>
                  <Button variant="outline" size="sm" className="bg-surface" asChild>
                    <Link href={`/admin/astrologers/${astrologer.id}/edit`}>
                      <Pencil aria-hidden="true" />
                      Edit profile
                    </Link>
                  </Button>
                  <AdminRowActions
                    label="More status actions"
                    className="size-9 min-h-9 border border-border bg-surface"
                    actions={menu.map((action, index) => ({
                      label: action.label,
                      icon: action.icon,
                      destructive: action.destructive,
                      separatorBefore: action.destructive && index > 0 && !menu[index - 1].destructive,
                      onSelect: () => confirm.open(action),
                    }))}
                  />
                </>
              }
              primaryAction={
                primary ? (
                  <Button variant="conversion" size="sm" onClick={() => confirm.open(primary)}>
                    {primary.label}
                  </Button>
                ) : null
              }
            />

            <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
              <div className="min-w-0 space-y-5">
                <AdminSectionCard title="Profile">
                  <div className="flex items-start gap-4">
                    <AstrologerAvatar name={astrologer.displayName} imageUrl={astrologer.profileImageUrl} className="size-16" fallbackClassName="text-base" />
                    <div className="min-w-0 space-y-0.5">
                      <p className="text-lg font-semibold">{astrologer.displayName}</p>
                      <p className="text-sm text-muted-foreground">
                        {yearsLabel(astrologer.experienceYears)} of experience{location ? ` · ${location}` : ""}
                      </p>
                      <p className="truncate text-xs text-muted-foreground">Profile link /{astrologer.slug}</p>
                    </div>
                  </div>
                  {astrologer.bio ? (
                    <p className="mt-4 max-w-prose whitespace-pre-line text-sm leading-relaxed text-foreground">{astrologer.bio}</p>
                  ) : (
                    <p className="mt-4 text-sm text-muted-foreground">No bio yet.</p>
                  )}
                </AdminSectionCard>

                <AstrologerDocumentsCard astrologerId={astrologer.id} />

                <AdminSectionCard title="Consultation pricing" flush>
                  {astrologer.consultationModes.length === 0 ? (
                    <p className="px-5 py-4 text-sm text-muted-foreground">No consultation modes set up yet.</p>
                  ) : (
                    <ul className="divide-y divide-border">
                      {astrologer.consultationModes.map((mode) => (
                        <li key={mode.mode} className="flex items-center justify-between gap-3 px-5 py-3 text-sm">
                          <span className="font-medium">{astrologerModeLabels[mode.mode] ?? mode.mode}</span>
                          <span className="ml-auto tabular-nums text-muted-foreground">
                            {formatINR(mode.pricePaise)}
                            {mode.durationMinutes ? ` for ${mode.durationMinutes} min` : ""}
                          </span>
                          <AdminStatusPill tone={mode.enabled ? "success" : "neutral"}>{mode.enabled ? "Offered" : "Off"}</AdminStatusPill>
                        </li>
                      ))}
                    </ul>
                  )}
                </AdminSectionCard>

                <AdminSectionCard title="Expertise and languages">
                  <dl className="grid gap-4">
                    {[
                      { label: "Expertise", items: astrologer.expertise.map((item) => ({ key: item.id, name: item.name })), empty: "No expertise set" },
                      { label: "Specialties", items: astrologer.specialties.map((item) => ({ key: item.id, name: item.name })), empty: "No specialties set" },
                      { label: "Languages", items: astrologer.languages.map((name) => ({ key: name, name })), empty: "No languages set" },
                    ].map((group) => (
                      <div key={group.label} className="grid gap-1.5">
                        <dt className="text-[13px] text-muted-foreground">{group.label}</dt>
                        <dd className="flex flex-wrap gap-1.5">
                          {group.items.length ? (
                            group.items.map((item) => (
                              <span key={item.key} className="inline-flex h-7 items-center rounded-full border border-border bg-muted px-2.5 text-[13px] font-medium">
                                {item.name}
                              </span>
                            ))
                          ) : (
                            <span className="text-sm text-muted-foreground">{group.empty}</span>
                          )}
                        </dd>
                      </div>
                    ))}
                  </dl>
                </AdminSectionCard>
              </div>

              <AdminDetailStickyRail className="space-y-5">
                <AdminSectionCard title="Status">
                  <div className="divide-y divide-border">
                    <DetailRow label="Verification" value={<AdminStatusBadge status={astrologer.verificationStatus} labels={verificationLabels} variants={verificationVariants} />} />
                    <DetailRow label="Visibility" value={<AdminStatusBadge status={astrologer.visibilityStatus} labels={visibilityLabels} variants={visibilityVariants} />} />
                    <DetailRow label="Availability" value={<AdminStatusBadge status={astrologer.availability} labels={availabilityLabels} variants={availabilityVariants} />} />
                    <DetailRow label="Featured" value={astrologer.featured ? "Yes" : "No"} />
                    <DetailRow label="Last updated" value={<span className="tabular-nums">{formatDateTime(astrologer.updatedAt)}</span>} />
                  </div>
                </AdminSectionCard>
                <AstrologerSignInCard astrologer={astrologer} />
                <AstrologerRelatedPanels astrologerId={astrologerId} />
              </AdminDetailStickyRail>
            </div>

            <AdminConfirmDialog
              {...confirm.dialogProps}
              title={pending?.title ?? ""}
              description={pending?.description ?? ""}
              confirmLabel={pending?.label ?? "Confirm"}
              destructive={pending?.destructive}
              onConfirm={() => {
                if (pending) mutation.mutate(pending.input, { onSuccess: confirm.close });
              }}
            >
              {notVerified ? (
                <p className="rounded-md border border-warning/30 bg-warning/10 p-3 text-sm">
                  This astrologer is not verified. Verify them first, then publish; a published astrologer must be unpublished before verification can be revoked.
                </p>
              ) : null}
            </AdminConfirmDialog>
          </div>
        );
      }}
    </AdminDetailFrame>
  );
}
