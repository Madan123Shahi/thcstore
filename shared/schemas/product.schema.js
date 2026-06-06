import { z } from "zod";

export const getProductsSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(50).default(12),
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
    .default("-createdAt"),
  category: z.string().trim().max(100).optional(),
  search: z.string().trim().max(100).optional(),
  minPrice: z.coerce.number().min(0).optional(),
  maxPrice: z.coerce.number().min(0).optional(),
  brand: z.string().trim().max(100).optional(),
  requiresPrescription: z.enum(["true", "false"]).optional(),
  isFeatured: z.enum(["true", "false"]).optional(),
  isBestSeller: z.enum(["true", "false"]).optional(),
  isNewArrival: z.enum(["true", "false"]).optional(),
});

// ✅ Base schema WITHOUT refine — so .partial() works in Zod v4
const createProductBase = z.object({
  name: z.string().trim().min(2).max(200),
  description: z.string().trim().min(10).max(2000),
  price: z.coerce.number().positive("Price must be greater than 0"),
  mrp: z.coerce.number().positive("MRP must be greater than 0"),
  stock: z.coerce.number().int().min(0, "Stock cannot be negative"),
  category: z.string().regex(/^[a-f\d]{24}$/i, "Invalid category ID"),
  brand: z.string().trim().max(100).optional(),
  tags: z.array(z.string().trim().max(50)).optional(),
  requiresPrescription: z.boolean().default(false),
  isFeatured: z.boolean().default(false),
  isBestSeller: z.boolean().default(false),
  isNewArrival: z.boolean().default(false),
});

// ✅ Add refine AFTER base — for create only
export const createProductSchema = createProductBase.refine(
  (data) => data.price <= data.mrp,
  { message: "Selling price cannot exceed MRP", path: ["price"] },
);

// ✅ .partial() on base (no refine) — then add refines after
export const updateProductSchema = createProductBase
  .partial()
  .refine((data) => Object.values(data).some((v) => v !== undefined), {
    message: "Provide at least one field to update",
  })
  .refine(
    (data) => {
      // ✅ Only check price vs mrp if both are provided
      if (data.price !== undefined && data.mrp !== undefined)
        return data.price <= data.mrp;
      return true;
    },
    { message: "Selling price cannot exceed MRP", path: ["price"] },
  );

export const addReviewSchema = z.object({
  rating: z.number().int().min(1).max(5),
  comment: z
    .string()
    .trim()
    .min(3, "Comment must be at least 3 characters")
    .max(500),
});
