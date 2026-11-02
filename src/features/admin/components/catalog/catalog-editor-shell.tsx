"use client";

import { useState, type FormEvent, type ReactNode } from "react";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { useAdminScrollSpy } from "../../hooks/use-admin-scroll-spy";
import { AdminDetailStickyRail } from "../shared/admin-detail-sticky-rail";
import { AdminEditorSectionNav, type AdminEditorSection } from "../shared/admin-editor-section-nav";
import { AdminFormError } from "../shared/admin-form-section";
import { AdminPageHeader } from "../shared/admin-page-header";

/**
 * Editor page frame for the catalog editors (poojas, store categories/products, coupons), following the kit's
 * editor recipe: `AdminPageHeader` with Cancel (asks before discarding changes) and the saffron Save, the form-level
 * server error, the form sections in the main column and a sticky rail (section nav + optional extras such as a
 * preview) on wide screens. On mobile the section nav scrolls horizontally above the form and Save is repeated at
 * the bottom of the form.
 */
export function CatalogEditorShell({
  title,
  description,
  meta,
  cancelHref,
  backLabel = "Back",
  sections,
  submitLabel,
  pending,
  dirty,
  formError,
  onSubmit,
  rail,
  children,
}: {
  title: string;
  description?: ReactNode;
  /** Pills or small facts under the title. */
  meta?: ReactNode;
  /** Where Cancel and the back link go (the detail page when editing, the list when creating). */
  cancelHref: string;
  /** Back-link text in the header; defaults to "Back". */
  backLabel?: string;
  sections: AdminEditorSection[];
  submitLabel: string;
  pending: boolean;
  dirty: boolean;
  formError: string | null;
  onSubmit: (event?: FormEvent<HTMLFormElement>) => void;
  rail?: ReactNode;
  children: ReactNode;
}) {
  const router = useRouter();
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const { activeId, scrollToSection } = useAdminScrollSpy(sections.map((section) => section.id));
  const cancel = () => (dirty ? setConfirmDiscard(true) : router.push(cancelHref));
  const saveButton = (className?: string) => (
    <Button type="submit" variant="conversion" size="sm" disabled={pending || !dirty} aria-busy={pending || undefined} className={className}>
      {pending ? <Loader2 className="animate-spin" aria-hidden="true" /> : null}
      {pending ? "Saving…" : submitLabel}
    </Button>
  );

  return (
    <form noValidate onSubmit={onSubmit} className="space-y-5">
      <AdminPageHeader
        title={title}
        description={description}
        meta={meta}
        backHref={cancelHref}
        backLabel={backLabel}
        actions={
          <Button type="button" variant="outline" size="sm" className="bg-surface" onClick={cancel} disabled={pending}>
            Cancel
          </Button>
        }
        primaryAction={saveButton()}
      />
      <AdminFormError message={formError} />
      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_240px]">
        <div className="min-w-0 space-y-5">{children}</div>
        <AdminDetailStickyRail className="order-first space-y-4 xl:order-none">
          <div className="rounded-xl border border-border bg-surface p-1.5 xl:p-2">
            <AdminEditorSectionNav sections={sections} activeId={activeId} onNavigate={scrollToSection} />
          </div>
          {rail}
        </AdminDetailStickyRail>
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-4 sm:hidden">
        <Button type="button" variant="outline" size="sm" className="bg-surface" onClick={cancel} disabled={pending}>
          Cancel
        </Button>
        {saveButton()}
      </div>
      <AlertDialog open={confirmDiscard} onOpenChange={setConfirmDiscard}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>Your changes on this page have not been saved.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Keep editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push(cancelHref)}>Discard changes</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </form>
  );
}
