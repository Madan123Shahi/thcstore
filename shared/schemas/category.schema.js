import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().toLowerCase().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  image: z.string().trim().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

// On update, all fields are optional (partial)
export const updateCategorySchema = createCategorySchema
  .partial()
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Provide at least one field to update",
  });
