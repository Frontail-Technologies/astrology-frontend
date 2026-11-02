import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

import { AdminEmptyState } from "./admin-empty-state";

/** @deprecated Use `AdminEmptyState`. Kept as a thin alias for existing callers. */
export function AdminCatalogEmptyState({ icon, title, description, action }: { icon: LucideIcon; title: string; description: string; action: ReactNode }) {
  return <AdminEmptyState icon={icon} title={title} description={description} action={action} />;
}
