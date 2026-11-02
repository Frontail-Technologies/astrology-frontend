import type { LucideIcon } from "lucide-react";

import { AdminEmptyState } from "./admin-empty-state";

/** @deprecated Use `AdminEmptyState`. Kept as a thin alias for existing callers. */
export function AdminIntegrationEmptyState({ icon, title, description }: { icon: LucideIcon; title: string; description: string }) {
  return <AdminEmptyState icon={icon} title={title} description={description} />;
}
