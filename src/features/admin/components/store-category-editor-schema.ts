import { z } from "zod";

export const storeCategoryEditorSchema = z.object({
  name: z.string().trim().min(1, "Enter a category name."),
  slug: z.string().trim().regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, and hyphens only."),
  description: z.string().trim(),
  imageSrc: z.string().trim(),
  managementStatus: z.enum(["unconfigured", "draft", "active", "archived"]),
});

export type StoreCategoryEditorValues = z.infer<typeof storeCategoryEditorSchema>;
