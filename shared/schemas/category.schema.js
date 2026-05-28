import { z } from "zod";

export const createCategorySchema = z.object({
  name: z.string().min(1).max(100),
  slug: z
    .string()
    .min(1)
    .regex(/^[a-z0-9-]+$/),
  isActive: z.boolean().optional().default(true),
  sortOrder: z.number().int().optional().default(0),
});

// On update, all fields are optional (partial)
export const updateCategorySchema = createCategorySchema.partial();
