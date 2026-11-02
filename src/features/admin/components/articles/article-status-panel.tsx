"use client";

import { useState } from "react";

import {
  articleStatusLabels,
  articleStatusVariants,
  articleTransitionDescriptions,
  articleTransitionLabels,
  articleTransitionOrder,
} from "@/features/articles/constants/article-status";
import { useArticleStatusUpdate } from "@/features/articles/hooks/use-article-admin";
import { isFutureInstant } from "@/features/articles/lib/article-form";
import type { ManagedArticle } from "@/features/articles/types/article-admin";
import { Label } from "@/components/ui/label";
import { formatOptionalDateTime } from "../../lib/format";
import { AdminDateTimeInput } from "../shared/admin-datetime-input";
import { DetailRow } from "../shared/admin-detail-row";
import { AdminSectionCard } from "../shared/admin-section-card";
import { AdminStatusBadge } from "../shared/admin-status-badge";
import { AdminTransitionActions } from "../shared/admin-transition-actions";

/** Publishing card: current status, dates and the server-provided transitions (scheduling asks for a time). */
export function ArticleStatusPanel({ article }: { article: ManagedArticle }) {
  const update = useArticleStatusUpdate(article.id);
  const [scheduledAt, setScheduledAt] = useState<string | null>(article.scheduledAt);
  const scheduleInFuture = isFutureInstant(scheduledAt);

  return (
    <AdminSectionCard title="Publishing" actions={<AdminStatusBadge status={article.status} labels={articleStatusLabels} variants={articleStatusVariants} />}>
      <div className="divide-y divide-border">
        <DetailRow label="Published" value={formatOptionalDateTime(article.publishedAt)} />
        <DetailRow label="Scheduled for" value={formatOptionalDateTime(article.scheduledAt)} />
      </div>
      <AdminTransitionActions
        className="mt-4"
        allowed={article.allowedTransitions}
        labels={articleTransitionLabels}
        descriptions={articleTransitionDescriptions}
        variants={{ archived: "outline", published: "conversion", scheduled: "outline", draft: "outline" }}
        order={articleTransitionOrder}
        mutation={update}
        onConfirm={(status, _reason, close) =>
          update.mutate(status === "scheduled" && scheduledAt ? { status, scheduledAt } : { status }, { onSuccess: close })
        }
        isConfirmDisabled={(target) => target === "scheduled" && !scheduleInFuture}
      >
        {(target) =>
          target === "scheduled" ? (
            <div className="grid gap-1.5">
              <Label htmlFor="article-schedule-at">Publish at</Label>
              <AdminDateTimeInput id="article-schedule-at" value={scheduledAt} onChange={setScheduledAt} min={new Date().toISOString()} />
              <p className="text-xs text-muted-foreground">{scheduleInFuture ? "Shown in your local time zone." : "Choose a time in the future."}</p>
            </div>
          ) : null
        }
      </AdminTransitionActions>
    </AdminSectionCard>
  );
}
