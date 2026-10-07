"use client";

import { slugify } from "../lib/format";
import { useRef, useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import {
  ChevronLeft,
  ChevronRight,
  ExternalLink,
  ImagePlus,
  Star,
  Trash2,
} from "lucide-react";
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
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useCategoryRepository } from "@/features/store/hooks/use-category-repository";
import { useProductRepository } from "@/features/store/hooks/use-product-repository";
import {
  getProductCatalogStatusLabel,
  getProductManagementStatusLabel,
} from "@/features/store/selectors/store-domain";
import {
  productCatalogStatusValues,
  productManagementStatusValues,
  type StoreProduct,
} from "@/features/store/types/store";
import { useSessionImageCollection } from "../hooks/use-session-image-collection";
import {
  storeProductEditorSchema,
  type StoreProductEditorValues,
} from "./store-product-editor-schema";

function FieldError({ message }: { message?: string }) {
  return message ? (
    <p className="text-xs font-medium text-destructive">{message}</p>
  ) : null;
}

function EditorCard({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <Card className="shadow-sm">
      <CardHeader className="border-b border-border px-5 py-3.5">
        <CardTitle className="text-sm font-semibold">{title}</CardTitle>
      </CardHeader>
      <CardContent className="p-5">{children}</CardContent>
    </Card>
  );
}

export function AdminStoreProductEditor({
  product,
}: {
  product?: StoreProduct;
}) {
  const router = useRouter();
  const { records: categories } = useCategoryRepository();
  const { create, update, slugExists } = useProductRepository();

  const fileInput = useRef<HTMLInputElement>(null);
  const [discardOpen, setDiscardOpen] = useState(false);
  const [urlDialogOpen, setUrlDialogOpen] = useState(false);
  const [urlInput, setUrlInput] = useState("");
  const [selectedMediaIdx, setSelectedMediaIdx] = useState<number | null>(null);
  const [mediaError, setMediaError] = useState<string | null>(null);

  const {
    media,
    isDirty: mediaDirty,
    addFiles,
    addUrl,
    remove,
    move,
    setPrimary,
    updateAlt,
  } = useSessionImageCollection(product?.media ?? []);

  const {
    register,
    setValue,
    watch,
    handleSubmit,
    setError,
    formState: { errors, isDirty, isValid },
  } = useForm<StoreProductEditorValues>({
    resolver: zodResolver(storeProductEditorSchema),
    mode: "onChange",
    defaultValues: {
      name: product?.name ?? "",
      slug: product?.slug ?? "",
      shortDescription: product?.shortDescription ?? "",
      description: product?.description ?? "",
      categoryId: product?.categoryId ?? "unassigned",
      priceInRupees:
        product?.pricing.priceInPaise === undefined
          ? ""
          : String(product.pricing.priceInPaise / 100),
      trackInventory: product?.inventory?.trackInventory ?? false,
      stockQuantity: product?.inventory?.stockQuantity?.toString() ?? "",
      featured: product?.featured ?? false,
      catalogStatus: product?.catalogStatus ?? "unconfigured",
      managementStatus: product?.managementStatus ?? "unconfigured",
    },
  });

  const values = watch();
  const dirty = isDirty || mediaDirty;
  const back = product
    ? `/admin/store/products/${product.slug}`
    : "/admin/store/products";

  const selectedCategory = categories.find((c) => c.id === values.categoryId);

  const handleAddUrl = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    addUrl(trimmed);
    setUrlInput("");
    setUrlDialogOpen(false);
  };

  const handleCancel = () => {
    if (dirty) setDiscardOpen(true);
    else router.push(back);
  };

  const submit = (vals: StoreProductEditorValues) => {
    if (!product && slugExists(vals.slug)) {
      setError("slug", { message: "A product with this slug already exists." });
      return;
    }

    const saved: StoreProduct = {
      ...product,
      id: product?.id ?? `prod-${Date.now()}`,
      slug: vals.slug,
      name: vals.name.trim(),
      shortDescription: vals.shortDescription.trim(),
      description: vals.description.trim() || undefined,
      categoryId:
        vals.categoryId === "unassigned" ? undefined : vals.categoryId,
      media,
      pricing: {
        priceInPaise:
          vals.priceInRupees === ""
            ? undefined
            : Math.round(Number(vals.priceInRupees) * 100),
        currency: "INR",
      },
      inventory: vals.trackInventory
        ? {
            trackInventory: true,
            stockQuantity: Number(vals.stockQuantity),
          }
        : { trackInventory: false },
      featured: vals.featured,
      catalogStatus:
        vals.catalogStatus === "unconfigured" ? undefined : vals.catalogStatus,
      managementStatus:
        vals.managementStatus === "unconfigured"
          ? undefined
          : vals.managementStatus,
    };

    if (product) {
      update(saved);
      toast.success("Product updated");
    } else {
      create(saved);
      toast.success("Product created");
    }

    router.push(`/admin/store/products/${saved.slug}`);
  };

  return (
    <form
      noValidate
      onSubmit={handleSubmit(submit)}
      className="flex w-full max-w-[1360px] flex-col gap-4"
    >
      {/* ── Page header ────────────────────────────────────── */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          
          <h1 className="font-sans text-xl font-semibold tracking-tight text-foreground">
            {product ? "Edit Product" : "New Product"}
          </h1>
        </div>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleCancel}
          >
            Cancel
          </Button>
          <Button
            type="submit"
            variant="conversion"
            size="sm"
            disabled={!dirty || !isValid}
          >
            {product ? "Save changes" : "Create Product"}
          </Button>
        </div>
      </div>

      {/* ── Two-column workspace ──────────────────────────── */}
      <div className="grid gap-4 lg:grid-cols-2">
        {/* ═══ LEFT COLUMN ═══ */}
        <div className="space-y-4">
          {/* Product Information */}
          <EditorCard title="Product Information">
            <div className="space-y-3">
              <div className="grid gap-1.5">
                <Label htmlFor="product-name">Product name</Label>
                <Input
                  id="product-name"
                  placeholder="Enter product name"
                  {...register("name", {
                    onChange: (e) => {
                      if (!product)
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
                <Label
                  htmlFor="product-slug"
                  className="text-muted-foreground"
                >
                  Slug
                </Label>
                <Input
                  id="product-slug"
                  className="font-mono text-xs"
                  readOnly={Boolean(product)}
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
                <Label htmlFor="product-short-desc">Short description</Label>
                <Textarea
                  id="product-short-desc"
                  className="min-h-16 resize-none"
                  placeholder="One-line product summary…"
                  {...register("shortDescription")}
                />
                <FieldError message={errors.shortDescription?.message} />
              </div>

              <div className="grid gap-1.5">
                <Label htmlFor="product-desc">Description</Label>
                <Textarea
                  id="product-desc"
                  className="min-h-24 resize-y"
                  placeholder="Detailed product description…"
                  {...register("description")}
                />
              </div>
            </div>
          </EditorCard>

          {/* Organization */}
          <EditorCard title="Organization">
            <div className="space-y-3">
              <div className="grid gap-1.5">
                <Label>Category</Label>
                {categories.length ? (
                  <Select
                    value={values.categoryId}
                    onValueChange={(v) =>
                      setValue("categoryId", v, { shouldDirty: true })
                    }
                  >
                    <SelectTrigger aria-label="Product category">
                      <SelectValue>
                        {selectedCategory?.name ?? "No category"}
                      </SelectValue>
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="unassigned">No category</SelectItem>
                      {categories.map((c) => (
                        <SelectItem key={c.id} value={c.id}>
                          {c.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                ) : (
                  <div className="flex items-center justify-between gap-2 rounded-md border border-border px-3 py-2 text-sm">
                    <span className="text-muted-foreground">
                      No categories yet.
                    </span>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        window.open(
                          "/admin/store/categories/new",
                          "_blank",
                          "noopener,noreferrer",
                        )
                      }
                    >
                      Create{" "}
                      <ExternalLink className="size-3.5" aria-hidden="true" />
                    </Button>
                  </div>
                )}
              </div>

              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm">Featured product</span>
                <Checkbox
                  checked={values.featured}
                  onCheckedChange={(checked) =>
                    setValue("featured", checked === true, {
                      shouldDirty: true,
                    })
                  }
                />
              </label>
            </div>
          </EditorCard>

          {/* Inventory */}
          <EditorCard title="Inventory">
            <div className="space-y-3">
              <label className="flex cursor-pointer items-center justify-between gap-3">
                <span className="text-sm">Track inventory</span>
                <Checkbox
                  checked={values.trackInventory}
                  onCheckedChange={(checked) =>
                    setValue("trackInventory", checked === true, {
                      shouldDirty: true,
                      shouldValidate: true,
                    })
                  }
                />
              </label>
              {values.trackInventory && (
                <div className="grid gap-1.5 border-t border-border pt-3">
                  <Label htmlFor="product-stock">Stock quantity</Label>
                  <Input
                    id="product-stock"
                    inputMode="numeric"
                    placeholder="0"
                    className="max-w-36"
                    {...register("stockQuantity")}
                  />
                  <FieldError message={errors.stockQuantity?.message} />
                </div>
              )}
            </div>
          </EditorCard>
        </div>

        {/* ═══ RIGHT COLUMN ═══ */}
        <div className="space-y-4">
          {/* Product Details */}
          <EditorCard title="Product Details">
            <div className="grid grid-cols-2 gap-3">
              <div className="grid gap-1.5">
                <Label>Management status</Label>
                <Select
                  value={values.managementStatus}
                  onValueChange={(v) =>
                    setValue(
                      "managementStatus",
                      v as StoreProductEditorValues["managementStatus"],
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

              <div className="grid gap-1.5">
                <Label>Catalog status</Label>
                <Select
                  value={values.catalogStatus}
                  onValueChange={(v) =>
                    setValue(
                      "catalogStatus",
                      v as StoreProductEditorValues["catalogStatus"],
                      { shouldDirty: true },
                    )
                  }
                >
                  <SelectTrigger aria-label="Catalog status">
                    <SelectValue>
                      {values.catalogStatus === "unconfigured"
                        ? "Not configured"
                        : getProductCatalogStatusLabel(values.catalogStatus)}
                    </SelectValue>
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="unconfigured">Not configured</SelectItem>
                    {productCatalogStatusValues.map((s) => (
                      <SelectItem key={s} value={s}>
                        {getProductCatalogStatusLabel(s)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </EditorCard>

          {/* Pricing */}
          <EditorCard title="Pricing">
            <div className="grid gap-1.5">
              <Label htmlFor="product-price">Price</Label>
              <div className="flex overflow-hidden rounded-md border border-input bg-background focus-within:ring-[3px] focus-within:ring-ring/30">
                <span className="flex items-center border-r border-input px-3 text-sm text-muted-foreground">
                  ₹
                </span>
                <Input
                  id="product-price"
                  inputMode="decimal"
                  placeholder="0.00"
                  className="border-0 shadow-none focus-visible:ring-0"
                  {...register("priceInRupees")}
                />
              </div>
              <FieldError message={errors.priceInRupees?.message} />
            </div>
          </EditorCard>

          {/* Product Images */}
          <EditorCard title="Product Images">
            <div className="space-y-3">
              {/* Tile grid: Add tile + image tiles */}
              <div className="grid grid-cols-3 gap-2">
                {/* Add tile */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <button
                      type="button"
                      className="aspect-square cursor-pointer rounded-md border-2 border-dashed border-border bg-muted/30 transition-colors hover:bg-muted/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      aria-label="Add product media"
                    >
                      <div className="flex h-full flex-col items-center justify-center gap-1">
                        <ImagePlus
                          className="size-5 text-muted-foreground"
                          aria-hidden="true"
                        />
                        <span className="text-xs text-muted-foreground">
                          Add media
                        </span>
                      </div>
                    </button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem onSelect={() => fileInput.current?.click()}>
                      <ImagePlus aria-hidden="true" />
                      Upload images
                    </DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => setUrlDialogOpen(true)}>
                      <ExternalLink aria-hidden="true" />
                      Add from URL
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>

                {/* Image tiles */}
                {media.map((item, idx) => {
                  const isPrimary = idx === 0;
                  const isSelected = selectedMediaIdx === idx;
                  return (
                    <button
                      key={`${item.src}-${idx}`}
                      type="button"
                      onClick={() =>
                        setSelectedMediaIdx(isSelected ? null : idx)
                      }
                      className={`group relative aspect-square overflow-hidden rounded-md border transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring ${
                        isSelected
                          ? "border-sidebar-primary ring-2 ring-sidebar-primary"
                          : "border-border"
                      }`}
                      aria-label={`${item.alt || `Image ${idx + 1}`}${isSelected ? " (selected)" : ""}`}
                      aria-pressed={isSelected}
                    >
                      <img
                        src={item.src}
                        alt={item.alt || ""}
                        className="size-full object-cover"
                      />
                      {isPrimary && (
                        <span className="absolute left-1 top-1 rounded bg-sidebar-primary px-1 py-0.5 text-[10px] font-semibold leading-none text-white">
                          Primary
                        </span>
                      )}
                      {/* Hover overlay with actions */}
                      <div className="absolute inset-0 flex items-end justify-center gap-0.5 bg-black/50 p-1 opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                        {idx > 0 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  move(idx, -1);
                                  if (isSelected)
                                    setSelectedMediaIdx(idx - 1);
                                }}
                                className="inline-flex size-6 items-center justify-center rounded bg-white/20 text-white hover:bg-white/40"
                                aria-label="Move image left"
                              >
                                <ChevronLeft
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Move left</TooltipContent>
                          </Tooltip>
                        )}
                        {idx < media.length - 1 && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  move(idx, 1);
                                  if (isSelected)
                                    setSelectedMediaIdx(idx + 1);
                                }}
                                className="inline-flex size-6 items-center justify-center rounded bg-white/20 text-white hover:bg-white/40"
                                aria-label="Move image right"
                              >
                                <ChevronRight
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Move right</TooltipContent>
                          </Tooltip>
                        )}
                        {!isPrimary && (
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setPrimary(idx);
                                  setSelectedMediaIdx(0);
                                }}
                                className="inline-flex size-6 items-center justify-center rounded bg-white/20 text-white hover:bg-white/40"
                                aria-label="Set as primary image"
                              >
                                <Star
                                  className="size-3.5"
                                  aria-hidden="true"
                                />
                              </button>
                            </TooltipTrigger>
                            <TooltipContent>Set as primary</TooltipContent>
                          </Tooltip>
                        )}
                        <Tooltip>
                          <TooltipTrigger asChild>
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                remove(idx);
                                setSelectedMediaIdx(null);
                              }}
                              className="inline-flex size-6 items-center justify-center rounded bg-white/20 text-white hover:bg-destructive/80"
                              aria-label="Remove image"
                            >
                              <Trash2
                                className="size-3.5"
                                aria-hidden="true"
                              />
                            </button>
                          </TooltipTrigger>
                          <TooltipContent>Remove</TooltipContent>
                        </Tooltip>
                      </div>
                    </button>
                  );
                })}
              </div>

              {mediaError && (
                <p className="text-xs font-medium text-destructive">
                  {mediaError}
                </p>
              )}

              {/* Selected image alt text editor */}
              {selectedMediaIdx !== null && media[selectedMediaIdx] && (
                <div className="space-y-2 rounded-md border border-border bg-muted/20 p-3">
                  <p className="text-xs font-medium text-foreground">
                    Image {selectedMediaIdx + 1} of {media.length}
                    {selectedMediaIdx === 0 && (
                      <span className="ml-2 text-muted-foreground">
                        (primary)
                      </span>
                    )}
                  </p>
                  <div className="grid gap-1">
                    <Label htmlFor="media-alt" className="text-xs">
                      Alt text
                    </Label>
                    <Input
                      id="media-alt"
                      value={media[selectedMediaIdx].alt ?? ""}
                      onChange={(e) =>
                        updateAlt(selectedMediaIdx, e.target.value)
                      }
                      placeholder="Describe this image for accessibility…"
                      className="h-8 text-xs"
                    />
                  </div>
                </div>
              )}

              {/* Hidden file input */}
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                multiple
                className="sr-only"
                aria-label="Upload product images"
                onChange={(e) => {
                  const result = addFiles(e.target.files);
                  setMediaError(
                    result.rejected
                      ? "Some images were skipped — each must be under 5 MB."
                      : null,
                  );
                  e.currentTarget.value = "";
                }}
              />
            </div>
          </EditorCard>
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
            <Label htmlFor="url-input">Image URL or path</Label>
            <Input
              id="url-input"
              value={urlInput}
              onChange={(e) => setUrlInput(e.target.value)}
              placeholder="https://… or /assets/…"
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  handleAddUrl();
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
              onClick={handleAddUrl}
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
