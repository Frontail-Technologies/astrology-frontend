"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Controller } from "react-hook-form";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useAdminForm } from "@/features/admin/data/use-admin-form";
import { ARTICLE_LIMITS, articleCategoryOptions } from "@/features/articles/constants/article-status";
import { useArticleDetail, useArticleTags, useCreateArticle, useUpdateArticle } from "@/features/articles/hooks/use-article-admin";
import { articleFormToInput, articleTagChoices, articleToFormValues, emptyArticleForm, type ArticleFormValues } from "@/features/articles/lib/article-form";
import type { ManagedArticle } from "@/features/articles/types/article-admin";
import { AdminFormError, AdminFormField, AdminFormSection, fieldError } from "../shared/admin-form-section";
import { AdminImageField } from "../shared/admin-image-field";
import { AdminPageHeader } from "../shared/admin-page-header";
import { AdminSelectField } from "../shared/admin-select-field";
import { AdminDetailFrame } from "../shared/admin-server-list";
import { ArticleStatusPanel } from "./article-status-panel";

const articleSchema = z.object({
  title: z.string().trim().min(ARTICLE_LIMITS.title[0], { error: "Enter a title (at least 2 characters)." }).max(ARTICLE_LIMITS.title[1]),
  excerpt: z.string().trim().max(ARTICLE_LIMITS.excerpt),
  content: z.string().trim().min(1, { error: "Write the article content." }).max(ARTICLE_LIMITS.content),
  heroImageUrl: z.string().nullable(),
  category: z.string().trim().max(ARTICLE_LIMITS.category),
  authorName: z.string().trim().max(ARTICLE_LIMITS.authorName),
  tagIds: z.array(z.string()).max(ARTICLE_LIMITS.tags, { error: `Choose at most ${ARTICLE_LIMITS.tags} tags.` }),
}) satisfies z.ZodType<ArticleFormValues, ArticleFormValues>;

/** `/admin/articles/new` (no id) or `/admin/articles/[id]/edit`. */
export function AdminArticleEditor({ id }: { id?: string }) {
  const detail = useArticleDetail(id ?? "");
  if (!id) return <ArticleForm />;
  return (
    <AdminDetailFrame ready={detail.ready} error={detail.error} onRetry={detail.reload} noun="article">
      {() => <ArticleForm key={detail.data!.id} article={detail.data!} />}
    </AdminDetailFrame>
  );
}

function ArticleForm({ article }: { article?: ManagedArticle }) {
  const router = useRouter();
  const create = useCreateArticle();
  const update = useUpdateArticle(article?.id ?? "");
  const tags = useArticleTags();
  const { form, submit, formError, pending } = useAdminForm<ArticleFormValues, ArticleFormValues, ReturnType<typeof articleFormToInput>, ManagedArticle>({
    schema: articleSchema,
    defaultValues: article ? articleToFormValues(article) : emptyArticleForm,
    mutation: article ? update : create,
    toInput: articleFormToInput,
    onSuccess: (saved, _values, instance) => {
      if (article) instance.reset(articleToFormValues(saved));
      else router.push(`/admin/articles/${saved.id}`);
    },
  });
  const errors = form.formState.errors;
  const choices = articleTagChoices(tags.data ?? [], article?.tags ?? []);
  const cancelHref = article ? `/admin/articles/${article.id}` : "/admin/articles";
  const saveDisabled = pending || (Boolean(article) && !form.formState.isDirty);
  const saveLabel = pending ? "Saving…" : article ? "Save changes" : "Create draft";
  const saveButton = (
    <Button type="submit" variant="conversion" size="sm" disabled={saveDisabled}>
      {saveLabel}
    </Button>
  );

  return (
    <form onSubmit={submit} noValidate className="space-y-5">
      <AdminPageHeader
        title={article ? `Edit ${article.title}` : "New article"}
        description={article ? undefined : "New articles are saved as drafts. Publish or schedule them from the article page."}
        backHref={cancelHref}
        backLabel={article ? "Back to article" : "Articles"}
        actions={
          <Button asChild variant="outline" size="sm" className="bg-surface">
            <Link href={cancelHref}>Cancel</Link>
          </Button>
        }
        primaryAction={saveButton}
      />
      <AdminFormError message={formError} />
      <div className="grid items-start gap-5 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0 space-y-5">
          <AdminFormSection title="Article">
            <AdminFormField label="Title" required error={fieldError(errors, "title")}>
              {(control) => <Input {...control} {...form.register("title")} maxLength={ARTICLE_LIMITS.title[1]} />}
            </AdminFormField>
            <AdminFormField label="Excerpt" description="Short summary for listings and previews." error={fieldError(errors, "excerpt")}>
              {(control) => <Textarea {...control} {...form.register("excerpt")} rows={3} maxLength={ARTICLE_LIMITS.excerpt} />}
            </AdminFormField>
            <AdminFormField label="Content" required description="Plain text. Separate paragraphs with a blank line." error={fieldError(errors, "content")}>
              {(control) => <Textarea {...control} {...form.register("content")} className="min-h-80 resize-y leading-7" />}
            </AdminFormField>
          </AdminFormSection>
          <AdminFormSection title="Hero image">
            <Controller
              name="heroImageUrl"
              control={form.control}
              render={({ field, fieldState }) => (
                <AdminImageField label="Hero image" value={field.value} onChange={(value) => field.onChange(value)} error={fieldState.error?.message} aspect="wide" disabled={pending} />
              )}
            />
          </AdminFormSection>
        </div>
        <aside className="min-w-0 space-y-5">
          {article ? <ArticleStatusPanel article={article} /> : null}
          <AdminFormSection title="Classification">
            <Controller
              name="category"
              control={form.control}
              render={({ field }) => (
                <AdminFormField label="Category" description="Groups the article on the public articles page." error={fieldError(errors, "category")}>
                  {(control) => (
                    <AdminSelectField
                      control={control}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value ?? "")}
                      onBlur={field.onBlur}
                      options={articleCategoryOptions}
                      placeholder="Choose a category"
                      clearable={{ label: "No category" }}
                      other={{ label: "Other category…", placeholder: "Category name", maxLength: ARTICLE_LIMITS.category, inputLabel: "Custom category" }}
                      disabled={pending}
                    />
                  )}
                </AdminFormField>
              )}
            />
            <AdminFormField label="Author name" error={fieldError(errors, "authorName")}>
              {(control) => <Input {...control} {...form.register("authorName")} maxLength={ARTICLE_LIMITS.authorName} />}
            </AdminFormField>
            <Controller
              name="tagIds"
              control={form.control}
              render={({ field, fieldState }) => (
                <fieldset className="grid gap-2">
                  <legend className="mb-1 text-sm font-medium">Tags</legend>
                  <p className="-mt-1 text-xs text-muted-foreground">Active tags from Master data → Tags.</p>
                  {tags.isPending ? <p className="text-xs text-muted-foreground">Loading tags…</p> : null}
                  {tags.isError ? <p className="text-xs text-destructive">Could not load tags.</p> : null}
                  {!tags.isPending && !choices.length ? <p className="text-xs text-muted-foreground">No active tags. Add them in Master data → Tags.</p> : null}
                  <div className="grid max-h-64 gap-2 overflow-y-auto pr-1">
                    {choices.map((tag) => {
                      const checked = field.value.includes(tag.id);
                      return (
                        <div key={tag.id} className="flex items-center gap-2">
                          <Checkbox
                            id={`article-tag-${tag.id}`}
                            checked={checked}
                            disabled={pending || (!tag.active && !checked)}
                            onCheckedChange={(next) => field.onChange(next === true ? [...field.value, tag.id] : field.value.filter((value) => value !== tag.id))}
                          />
                          <Label htmlFor={`article-tag-${tag.id}`} className="font-normal">
                            {tag.name}
                            {!tag.active ? <span className="ml-1 text-xs text-muted-foreground">(inactive — remove before saving)</span> : null}
                          </Label>
                        </div>
                      );
                    })}
                  </div>
                  {fieldState.error?.message ? <p className="text-xs text-destructive">{fieldState.error.message}</p> : null}
                </fieldset>
              )}
            />
          </AdminFormSection>
        </aside>
      </div>
      <div className="flex justify-end gap-2 border-t border-border pt-4 md:hidden">
        <Button asChild variant="outline" size="sm" className="bg-surface">
          <Link href={cancelHref}>Cancel</Link>
        </Button>
        {saveButton}
      </div>
    </form>
  );
}
