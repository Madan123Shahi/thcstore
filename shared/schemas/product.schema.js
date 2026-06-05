// validators/productValidator.js
import { z } from "zod";

export const getProductsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12), // ✅ capped
  sort: z
    .enum([
      "-createdAt",
      "createdAt",
      "price",
      "-price",
      "name",
      "-name",
      "rating",
      "-rating",
    ])
    .default("-createdAt"), // ✅ whitelisted
  category: z.string().trim().max(100).optional(),
  search: z.string().trim().max(100).optional(), // ✅ length capped
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  brand: z.string().trim().max(100).optional(), // ✅ length capped
  requiresPrescription: z.enum(["true", "false"]).optional(),
  isFeatured: z.enum(["true", "false"]).optional(),
  isBestSeller: z.enum(["true", "false"]).optional(),
  isNewArrival: z.enum(["true", "false"]).optional(),
});

export const createProductSchema = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(2000),
  price: z.coerce.number().min(0),
  stock: z.coerce.number().int().min(0),
  category: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ID"),
  brand: z.string().trim().max(100).optional(),
  tags: z.array(z.string().trim().max(50)).optional(),
  requiresPrescription: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
});

export const updateProductSchema = createProductSchema
  .partial()
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Provide at least one field to update",
  });

export const addReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z.string().trim().min(1).max(500),
});
