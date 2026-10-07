import { z } from "zod";

const money = z.string().trim().refine((value) => value === "" || /^\d+(\.\d{1,2})?$/.test(value), "Use a valid INR amount.");

export const storeProductEditorSchema = z.object({
  name: z.string().trim().min(1, "Enter a product name."),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  shortDescription: z.string().trim().min(1, "Enter a short description."),
  description: z.string().trim(),
  categoryId: z.string(),
  priceInRupees: money,
  trackInventory: z.boolean(),
  stockQuantity: z.string().trim(),
  featured: z.boolean(),
  catalogStatus: z.enum(["unconfigured", "available", "coming-soon", "unavailable"]),
  managementStatus: z.enum(["unconfigured", "draft", "active", "archived"]),
}).superRefine((value, ctx) => {
  if (value.trackInventory && !/^\d+$/.test(value.stockQuantity)) ctx.addIssue({ code: "custom", path: ["stockQuantity"], message: "Enter a whole stock quantity." });
});

export type StoreProductEditorValues = z.infer<typeof storeProductEditorSchema>;
