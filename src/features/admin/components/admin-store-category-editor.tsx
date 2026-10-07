"use client";

import { slugify } from "../lib/format";
import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { ExternalLink, ImagePlus, Tags, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";

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
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useSessionImagePreview } from "../hooks/use-session-image-preview";
import { useCategoryRepository } from "@/features/store/hooks/use-category-repository";
import {
  getProductManagementStatusLabel,
} from "@/features/store/selectors/store-domain";
import {
  productManagementStatusValues,
  type ProductCategory,
} from "@/features/store/types/store";
import {
  storeCategoryEditorSchema,
  type StoreCategoryEditorValues,
} from "./store-category-editor-schema";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-xs font-medium text-destructive">{message}</p>
  ) : null;
}

export function AdminStoreCategoryEditor({
  category,
}: {
  category?: ProductCategory;
}) {
  const router = useRouter();
  const { create, update, slugExists } = useCategoryRepository();
  const image = useSessionImagePreview({ onReject: (message) => toast.error(message) });
  const [discardOpen, setDiscardOpen] = useState(false);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [failedSrc, setFailedSrc] = useState<string | undefined>();

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isValid },
  } = useForm<StoreCategoryEditorValues>({
    resolver: zodResolver(storeCategoryEditorSchema),
    mode: "onChange",
    defaultValues: {
      name: category?.name ?? "",
      slug: category?.slug ?? "",
      description: category?.description ?? "",
      imageSrc: category?.imageSrc ?? "",
      managementStatus: category?.managementStatus ?? "unconfigured",
    },
  });

  const values = watch();
  const preview = values.imageSrc;
  const imgError = failedSrc === preview;
  const dirty = isDirty || preview !== (category?.imageSrc ?? "");
  const back = category
    ? `/admin/store/categories/${category.slug}`
    : "/admin/store/categories";

  const applyFile = (file: File | undefined) => {
    const url = image.select(file);
    if (url) setValue("imageSrc", url, { shouldDirty: true });
  };

  const applyUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    image.clear();
    setValue("imageSrc", trimmed, { shouldDirty: true });
    setUrlInput("");
    setUrlDialogOpen(false);
  };

  const removeImage = () => {
    image.clear();
    setValue("imageSrc", "", { shouldDirty: true });
  };

  const submit = (vals: StoreCategoryEditorValues) => {
    if (!category && slugExists(vals.slug)) {
      setError("slug", {
        message: "A category with this slug already exists.",
      });
      return;
    }

    const saved: ProductCategory = {
      ...category,
      id: category?.id ?? `cat-${Date.now()}`,
      slug: vals.slug,
      name: vals.name.trim(),
      description: vals.description.trim() || undefined,
      imageSrc: vals.imageSrc.trim() || undefined,
      managementStatus:
        vals.managementStatus === "unconfigured"
          ? undefined
          : vals.managementStatus,
    };

    if (category) {
      update(saved);
      toast.success("Category updated");
    } else {
      create(saved);
      toast.success("Category created");
    }

    router.push(`/admin/store/categories/${saved.slug}`);
  };

  const statusLabel =
    values.managementStatus === "unconfigured"
      ? null
      : getProductManagementStatusLabel(values.managementStatus);

  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      className="flex w-full max-w-[1200px] flex-col gap-4"
    >
      {/* ── Page header ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          
          <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">
            {category ? "Edit Category" : "New Category"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() =>
              dirty ? setDiscardOpen(true) : router.push(back)
            }
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="conversion"
            size="sm"
            disabled={!dirty || !isValid}
          >
            {category ? "Save changes" : "Create Category"}
          </Button>
        </div>
      </div>

      {/* ── Two-column workspace ──────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-[2fr_1fr]">
        {/* ═══ LEFT — Category Information ═══ */}
        <Card className="shadow-sm">
          <CardHeader className="border-b border-border px-5 py-3.5">
            <CardTitle className="text-sm font-semibold">
              Category Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3 p-5">
            <div className="grid gap-1.5">
              <Label htmlFor="cat-name">Name</Label>
              <Input
                id="cat-name"
                placeholder="Enter category name"
                {...register("name", {
                  onChange: (e) => {
                    if (!category)
                      setValue("slug", slugify(e.target.value), {
                        shouldDirty: true,
                        shouldValidate: true,
                      });
                  },
                })}
              />
              <FieldError message={errors.name?.message} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="cat-slug" className="text-muted-foreground">
                Slug
              </Label>
              <Input
                id="cat-slug"
                className="font-mono text-xs"
                readOnly={Boolean(category)}
                {...register("slug", {
                  onChange: (e) =>
                    setValue("slug", slugify(e.target.value), {
                      shouldDirty: true,
                      shouldValidate: true,
                    }),
                })}
              />
              <FieldError message={errors.slug?.message} />
            </div>

            <div className="grid gap-1.5">
              <Label htmlFor="cat-description">Description</Label>
              <Textarea
                id="cat-description"
                className="min-h-20 resize-y"
                placeholder="Describe this category…"
                {...register("description")}
              />
            </div>
          </CardContent>
        </Card>

        {/* ═══ RIGHT — Settings + Preview ═══ */}
        <div className="space-y-4">
          {/* Category Settings */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border px-5 py-3.5">
              <CardTitle className="text-sm font-semibold">
                Category Settings
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 p-5">
              {/* Management status */}
              <div className="grid gap-1.5">
                <Label>Management status</Label>
                <Select
                  value={values.managementStatus}
                  onValueChange={(v) =>
                    setValue(
                      "managementStatus",
                      v as StoreCategoryEditorValues["managementStatus"],
                      { shouldDirty: true },
                    )
                  }
                >
                  <SelectTrigger aria-label="Management status">
                    <SelectValue>
                      {values.managementStatus === "unconfigured"
                        ? "Not configured"
                        : getProductManagementStatusLabel(
                            values.managementStatus,
                          )}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unconfigured">Not configured</SelectItem>
                    {productManagementStatusValues.map((s) => (
                      <SelectItem key={s} value={s}>
                        {getProductManagementStatusLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Category image */}
              <div className="grid gap-2">
                <Label>Category image</Label>

                {preview && !imgError ? (
                  <div className="group relative size-24 overflow-hidden rounded-md border border-border">
                    <img
                      src={preview}
                      alt={values.name || "Category image"}
                      className="size-full object-cover"
                      onError={() => setFailedSrc(preview)}
                    />
                    <button
                      type="button"
                      onClick={removeImage}
                      className="absolute right-1 top-1 inline-flex size-5 items-center justify-center rounded bg-black/60 text-white opacity-0 transition-opacity hover:bg-black/80 group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none"
                      aria-label="Remove image"
                    >
                      <Trash2 className="size-3" aria-hidden="true" />
                    </button>
                  </div>
                ) : (
                  <div className="grid size-24 place-items-center rounded-md border-2 border-dashed border-border bg-muted/30">
                    <Tags className="size-6 text-muted-foreground" aria-hidden="true" />
                  </div>
                )}

                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={image.openPicker}
                  >
                    <ImagePlus className="size-3.5" aria-hidden="true" />
                    {preview && !imgError ? "Change" : "Upload"}
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setUrlDialogOpen(true)}
                  >
                    <ExternalLink className="size-3.5" aria-hidden="true" />
                    URL
                  </Button>
                  {preview && !imgError && (
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={removeImage}
                      className="text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="size-3.5" aria-hidden="true" />
                      Remove
                    </Button>
                  )}
                </div>

                <input
                  ref={image.inputRef}
                  type="file"
                  accept="image/*"
                  className="sr-only"
                  aria-label="Upload category image"
                  onChange={(e) => {
                    const url = image.handleInputChange(e);
                    if (url) setValue("imageSrc", url, { shouldDirty: true });
                  }}
                />
              </div>
            </CardContent>
          </Card>

          {/* Live preview */}
          <Card className="shadow-sm">
            <CardHeader className="border-b border-border px-5 py-3.5">
              <CardTitle className="text-sm font-semibold text-muted-foreground">
                Preview
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4">
              <div className="flex items-center gap-3">
                <div className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-md bg-muted">
                  {preview && !imgError ? (
                    <img
                      src={preview}
                      alt=""
                      className="size-full object-cover"
                      onError={() => setFailedSrc(preview)}
                    />
                  ) : (
                    <Tags className="size-4 text-muted-foreground" aria-hidden="true" />
                  )}
                </div>
                <div className="min-w-0">
                  <p className="truncate text-sm font-medium text-foreground">
                    {values.name || (
                      <span className="text-muted-foreground">Category name</span>
                    )}
                  </p>
                  <p className="truncate text-xs text-muted-foreground">
                    {values.slug || "slug"}
                  </p>
                </div>
                {statusLabel && (
                  <Badge variant="outline" className="ml-auto shrink-0 text-xs">
                    {statusLabel}
                  </Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* ── Dialogs ────────────────────────────────────────── */}
      <AlertDialog open={discardOpen} onOpenChange={setDiscardOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
            <AlertDialogDescription>
              Your local changes will be lost.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Continue editing</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push(back)}>
              Discard changes
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={urlDialogOpen} onOpenChange={setUrlDialogOpen}>
        <DialogContent className="sm:max-w-sm">
          <DialogHeader>
            <DialogTitle>Add image from URL</DialogTitle>
          </DialogHeader>
          <div className="grid gap-1.5">
            <Label htmlFor="cat-url-input">Image URL or path</Label>
            <Input
              id="cat-url-input"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://… or /assets/…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  applyUrl();
                }
              }}
              autoFocus
            />
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setUrlDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="button"
              variant="conversion"
              onClick={applyUrl}
              disabled={!urlInput.trim()}
            >
              Add image
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </form>
  );
}
