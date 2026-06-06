import { z } from "zod";

// ✅ Base schema WITHOUT refine — so .partial() works in Zod v4
const createCategoryBase = z.object({
  name: z.string().trim().min(2).max(100),
  slug: z.string().trim().toLowerCase().min(2).max(100).optional(),
  description: z.string().trim().max(500).optional(),
  image: z.string().trim().optional(),
  isActive: z.boolean().default(true),
  sortOrder: z.number().int().min(0).default(0),
});

export const createCategorySchema = createCategoryBase;

// ✅ .partial() on base, then refine after
export const updateCategorySchema = createCategoryBase
  .partial()
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Provide at least one field to update",
  });
